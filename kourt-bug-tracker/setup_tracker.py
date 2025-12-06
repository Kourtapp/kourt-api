import pandas as pd
import os

def create_template():
    data = {
        'Seção': ['1. ONBOARDING', '2. HOME', '3. SOCIAL'],
        'Tela': ['Registro', 'Home', 'Feed'],
        'Funcionalidade': ['Autofill CPF', 'Mapa', 'Follow'],
        'Comentário/Erro': [
            'Autofill do CPF não está funcionando',
            'Remover mapa da home',
            'Botão seguir não atualiza estado'
        ],
        'Prioridade': ['Alto', 'Médio', 'Alto'],
        'Status': ['Bug', 'Bug', 'Bug']
    }
    
    df = pd.DataFrame(data)
    
    file_path = "Kourt_Rastreamento_Bugs.xlsx"
    df.to_excel(file_path, index=False)
    print(f"✅ Template criado: {file_path}")

if __name__ == "__main__":
    create_template()
