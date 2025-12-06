import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface VerificationRequest {
  photos: {
    type: "overview" | "equipment" | "floor" | "other";
    url: string;
  }[];
  courtInfo: {
    name: string;
    description?: string;
    sports: string[];
    floorTypes: string[];
    hasLighting: boolean;
    isCovered: boolean;
  };
}

interface PhotoContentValidation {
  type: string;
  hasRequiredContent: boolean;
  detectedElements: string[];
  issues: string[];
  quality: "good" | "acceptable" | "poor";
}

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  isSportsCourt: boolean;
  detectedSports: string[];
  detectedFloorType: string;
  issues: string[];
  suggestions: string[];
  descriptionMatch: number;
  photoQuality: {
    overview: "good" | "acceptable" | "poor";
    equipment: "good" | "acceptable" | "poor";
    floor: "good" | "acceptable" | "poor";
  };
  photoValidation: PhotoContentValidation[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function analyzeWithClaude(
  photos: VerificationRequest["photos"],
  courtInfo: VerificationRequest["courtInfo"]
): Promise<VerificationResult> {
  const imageContents = photos.map((photo) => ({
    type: "image" as const,
    source: {
      type: "url" as const,
      url: photo.url,
    },
  }));

  const prompt = `Você é um especialista em verificação de quadras esportivas para um aplicativo chamado Kourt.

TAREFA PRINCIPAL: Analise CADA foto individualmente e verifique se ela mostra o conteúdo EXIGIDO para seu tipo.

REQUISITOS POR TIPO DE FOTO:
- OVERVIEW (Visão Geral): DEVE mostrar a quadra inteira, incluindo linhas demarcatórias e a rede/equipamento principal. A foto deve capturar as dimensões completas da quadra.
- EQUIPMENT (Rede/Tabela): DEVE mostrar claramente a rede, postes, tabela ou equipamento principal do esporte. Detalhes devem ser visíveis.
- FLOOR (Piso): DEVE mostrar a textura/material do piso de forma clara e identificável (areia, saibro, cimento, grama, sintético, madeira).
- OTHER: Fotos adicionais opcionais.

INFORMAÇÕES FORNECIDAS PELO USUÁRIO:
- Nome da quadra: ${courtInfo.name}
- Descrição: ${courtInfo.description || "Não informada"}
- Esportes: ${courtInfo.sports.join(", ")}
- Tipos de piso: ${courtInfo.floorTypes.join(", ")}
- Tem iluminação: ${courtInfo.hasLighting ? "Sim" : "Não"}
- É coberta: ${courtInfo.isCovered ? "Sim" : "Não"}

FOTOS ENVIADAS (na ordem):
${photos.map((p, i) => `${i + 1}. Tipo: ${p.type}`).join("\n")}

ANÁLISE RIGOROSA:
1. Verifique se cada foto mostra EXATAMENTE o conteúdo exigido para seu tipo
2. Se uma foto de "overview" não mostrar a quadra completa, marque hasRequiredContent como false
3. Se uma foto de "equipment" não mostrar a rede/equipamento claramente, marque hasRequiredContent como false
4. Se uma foto de "floor" não mostrar a textura do piso de forma identificável, marque hasRequiredContent como false
5. Fotos borradas, escuras demais ou com obstáculos bloqueando a visão devem ser rejeitadas

Responda APENAS com um JSON válido (sem markdown, sem explicações):
{
  "isValid": true/false,
  "confidence": 0.0 a 1.0,
  "isSportsCourt": true/false,
  "detectedSports": ["esporte1", "esporte2"],
  "detectedFloorType": "areia" | "saibro" | "concreto" | "grama" | "sintético" | "madeira" | "outro",
  "issues": ["problema1", "problema2"],
  "suggestions": ["sugestão1", "sugestão2"],
  "descriptionMatch": 0.0 a 1.0,
  "photoQuality": {
    "overview": "good" | "acceptable" | "poor",
    "equipment": "good" | "acceptable" | "poor",
    "floor": "good" | "acceptable" | "poor"
  },
  "photoValidation": [
    {
      "type": "overview",
      "hasRequiredContent": true/false,
      "detectedElements": ["quadra completa", "linhas visíveis", "rede presente"],
      "issues": ["foto não mostra quadra completa"],
      "quality": "good" | "acceptable" | "poor"
    }
  ]
}

CRITÉRIOS DE APROVAÇÃO (isValid = true):
- TODAS as fotos obrigatórias devem ter hasRequiredContent = true
- Deve ser claramente uma quadra esportiva (isSportsCourt = true)
- Confidence >= 0.7
- Qualidade de fotos aceitável ou boa

CRITÉRIOS DE REJEIÇÃO (isValid = false):
- Foto de overview sem mostrar quadra completa
- Foto de equipment sem mostrar rede/equipamento claramente
- Foto de floor sem mostrar textura do piso
- Fotos muito escuras, borradas ou com obstruções
- Não parecer ser uma quadra esportiva`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse JSON response
  try {
    const result = JSON.parse(content);
    return result as VerificationResult;
  } catch {
    console.error("Failed to parse Claude response:", content);
    // Return default failed result
    return {
      isValid: false,
      confidence: 0,
      isSportsCourt: false,
      detectedSports: [],
      detectedFloorType: "outro",
      issues: ["Erro ao processar análise da IA"],
      suggestions: ["Tente novamente com fotos mais claras"],
      descriptionMatch: 0,
      photoQuality: {
        overview: "poor",
        equipment: "poor",
        floor: "poor",
      },
      photoValidation: photos.map((p) => ({
        type: p.type,
        hasRequiredContent: false,
        detectedElements: [],
        issues: ["Não foi possível analisar a foto"],
        quality: "poor" as const,
      })),
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { photos, courtInfo } = (await req.json()) as VerificationRequest;

    if (!photos || photos.length === 0) {
      return new Response(
        JSON.stringify({ error: "No photos provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Verifying court with ${photos.length} photos...`);

    const result = await analyzeWithClaude(photos, courtInfo);

    console.log("Verification result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        isValid: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
