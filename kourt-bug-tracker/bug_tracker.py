import pandas as pd
import os
import sys
from datetime import datetime
import json

def load_bugs(file_path):
    try:
        df = pd.read_excel(file_path)
        return df
    except Exception as e:
        print(f"Erro ao ler arquivo Excel: {e}")
        sys.exit(1)

def generate_prompt(group_name, bugs):
    prompt = f"## 🐛 Bugs: {group_name}\n\n"
    prompt += "Por favor, analise e corrija os seguintes problemas:\n\n"
    
    for idx, row in bugs.iterrows():
        priority_icon = "🔴" if row.get('Prioridade') == 'Crítico' else "🟠" if row.get('Prioridade') == 'Alto' else "🟡"
        
        prompt += f"### {priority_icon} {row.get('Funcionalidade', 'Geral')}\n"
        prompt += f"**Tela:** {row.get('Tela', 'N/A')}\n"
        prompt += f"**Prioridade:** {row.get('Prioridade', 'Normal')}\n"
        prompt += f"**Problema:**\n> {row.get('Comentário/Erro', 'Sem descrição')}\n\n"
        prompt += "**Ação Necessária:**\n"
        prompt += "- [ ] Investigar causa raiz\n"
        prompt += "- [ ] Implementar correção\n"
        prompt += "- [ ] Verificar efeitos colaterais\n\n"
        prompt += "---\n\n"
        
    return prompt

def main():
    if len(sys.argv) < 2:
        project_path = "."
    else:
        project_path = sys.argv[1]
        
    base_dir = os.path.dirname(os.path.abspath(__file__))
    excel_path = os.path.join(base_dir, "Kourt_Rastreamento_Bugs.xlsx")
    reports_dir = os.path.join(base_dir, "reports")
    
    if not os.path.exists(excel_path):
        print(f"Arquivo não encontrado: {excel_path}")
        print("Execute 'python3 setup_tracker.py' para criar o modelo.")
        return

    print(f"📂 Lendo bugs de: {excel_path}")
    df = load_bugs(excel_path)
    
    # Filter active bugs
    active_bugs = df[df['Status'] == 'Bug'].copy()
    
    if active_bugs.empty:
        print("✅ Nenhum bug ativo encontrado!")
        return

    # Group by Section
    consolidated_prompt = "# 🐞 Relatório Consolidado de Bugs\n\n"
    
    for section, group in active_bugs.groupby('Seção'):
        print(f"Processando seção: {section} ({len(group)} bugs)")
        
        section_prompt = generate_prompt(section, group)
        consolidated_prompt += section_prompt
        
        # Save individual section prompt
        safe_name = "".join([c if c.isalnum() else "_" for c in str(section)]).lower()
        with open(os.path.join(reports_dir, f"prompt_{safe_name}.md"), "w") as f:
            f.write(section_prompt)
            
    # Save consolidated prompt
    consolidated_path = os.path.join(reports_dir, "prompts_consolidated.md")
    with open(consolidated_path, "w") as f:
        f.write(consolidated_prompt)
        
    print(f"\n✨ Relatórios gerados em: {reports_dir}")
    print(f"📄 Consolidado: {consolidated_path}")

if __name__ == "__main__":
    main()
