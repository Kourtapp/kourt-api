import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserData {
  name: string;
  cpf?: string;
  birthDate?: string;
}

interface RequestBody {
  documentUrl: string;
  userData?: UserData;
  companyName?: string;
  documentType: "identity" | "cnpj";
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { documentUrl, userData, companyName, documentType }: RequestBody =
      await req.json();

    if (!documentUrl) {
      throw new Error("Document URL is required");
    }

    const anthropic = new Anthropic({ apiKey });

    // Build the prompt based on document type
    let systemPrompt: string;
    let userPrompt: string;

    if (documentType === "identity") {
      systemPrompt = `Você é um especialista em verificação de documentos de identidade brasileiros.
Sua tarefa é analisar a imagem de um documento e extrair as informações visíveis.
Você deve identificar se é um RG, CNH ou Passaporte.
Extraia: nome completo, CPF (se visível), data de nascimento, número do documento.
Compare os dados extraídos com os dados fornecidos pelo usuário.
Responda APENAS em JSON válido, sem markdown.`;

      userPrompt = `Analise este documento de identidade e compare com os dados do usuário:

Dados do usuário para comparação:
- Nome: ${userData?.name || "Não informado"}
- CPF: ${userData?.cpf || "Não informado"}
- Data de Nascimento: ${userData?.birthDate || "Não informado"}

Responda em JSON com esta estrutura:
{
  "isValid": boolean (documento é legível e autêntico),
  "confidence": number (0-1, confiança na análise),
  "documentType": "rg" | "cnh" | "passport" | "unknown",
  "extractedData": {
    "name": string ou null,
    "cpf": string ou null,
    "birthDate": string ou null,
    "documentNumber": string ou null
  },
  "nameMatch": boolean (nome do documento confere com userData),
  "cpfMatch": boolean (CPF do documento confere com userData),
  "issues": string[] (problemas encontrados)
}`;
    } else {
      // CNPJ document
      systemPrompt = `Você é um especialista em verificação de documentos empresariais brasileiros.
Sua tarefa é analisar documentos relacionados a CNPJ (cartão CNPJ, contrato social, etc).
Extraia: razão social, nome fantasia, CNPJ.
Compare com o nome da empresa fornecido.
Responda APENAS em JSON válido, sem markdown.`;

      userPrompt = `Analise este documento empresarial e compare com:

Nome da empresa informado: ${companyName || "Não informado"}

Responda em JSON com esta estrutura:
{
  "isValid": boolean (documento é legível e autêntico),
  "confidence": number (0-1, confiança na análise),
  "extractedCnpj": string ou null,
  "extractedName": string ou null,
  "nameMatch": boolean (nome confere),
  "issues": string[] (problemas encontrados)
}`;
    }

    // Call Claude Vision API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: documentUrl,
              },
            },
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    });

    // Parse the response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Clean JSON from markdown if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    const result = JSON.parse(cleanedResponse);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Document verification error:", error);

    return new Response(
      JSON.stringify({
        isValid: false,
        confidence: 0,
        documentType: "unknown",
        extractedData: {},
        nameMatch: false,
        cpfMatch: false,
        issues: [error.message || "Erro ao processar documento"],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
