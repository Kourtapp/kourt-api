import { supabase } from "@/lib/supabase";

export interface PhotoToVerify {
  type: "overview" | "equipment" | "floor" | "other";
  url: string;
}

export interface CourtInfoToVerify {
  name: string;
  description?: string;
  sports: string[];
  floorTypes: string[];
  hasLighting: boolean;
  isCovered: boolean;
}

export interface PhotoContentValidation {
  type: string;
  hasRequiredContent: boolean;
  detectedElements: string[];
  issues: string[];
  quality: "good" | "acceptable" | "poor";
}

export interface VerificationResult {
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
  photoValidation?: PhotoContentValidation[];
}

/**
 * Verifica as fotos e informações de uma quadra usando IA (Claude Vision)
 * @param photos Array de fotos com tipo e URL
 * @param courtInfo Informações da quadra fornecidas pelo usuário
 * @returns Resultado da verificação
 */
export async function verifyCourtSubmission(
  photos: PhotoToVerify[],
  courtInfo: CourtInfoToVerify
): Promise<VerificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("verify-court", {
      body: { photos, courtInfo },
    });

    if (error) {
      console.error("Verification error:", error);
      throw new Error(error.message || "Erro ao verificar quadra");
    }

    return data as VerificationResult;
  } catch (err) {
    console.error("Court verification failed:", err);
    // Retorna resultado padrão em caso de erro
    return {
      isValid: false,
      confidence: 0,
      isSportsCourt: false,
      detectedSports: [],
      detectedFloorType: "outro",
      issues: ["Erro ao conectar com o serviço de verificação"],
      suggestions: ["Verifique sua conexão e tente novamente"],
      descriptionMatch: 0,
      photoQuality: {
        overview: "poor",
        equipment: "poor",
        floor: "poor",
      },
    };
  }
}

/**
 * Verifica se a foto é de uma quadra esportiva (verificação rápida)
 * @param photoUrl URL da foto
 * @returns true se parecer ser uma quadra
 */
export async function quickVerifyPhoto(photoUrl: string): Promise<{
  isSportsCourt: boolean;
  confidence: number;
  detectedSport?: string;
}> {
  try {
    const result = await verifyCourtSubmission(
      [{ type: "overview", url: photoUrl }],
      {
        name: "Verificação rápida",
        sports: [],
        floorTypes: [],
        hasLighting: false,
        isCovered: false,
      }
    );

    return {
      isSportsCourt: result.isSportsCourt,
      confidence: result.confidence,
      detectedSport: result.detectedSports[0],
    };
  } catch {
    return {
      isSportsCourt: true, // Em caso de erro, assume válido para não bloquear
      confidence: 0,
    };
  }
}

/**
 * Traduz os issues para mensagens amigáveis em português
 */
export function translateIssues(issues: string[]): string[] {
  const translations: Record<string, string> = {
    "photo is blurry": "A foto está borrada",
    "not a sports court": "Não parece ser uma quadra esportiva",
    "sport mismatch": "O esporte informado não corresponde à foto",
    "floor type mismatch": "O tipo de piso não corresponde à foto",
    "poor lighting": "A foto tem iluminação ruim",
    "photo too dark": "A foto está muito escura",
    "photo too bright": "A foto está muito clara",
    "no court visible": "Não é possível ver a quadra na foto",
    "no equipment visible": "Não é possível ver equipamentos na foto",
  };

  return issues.map((issue) => {
    const lowerIssue = issue.toLowerCase();
    for (const [key, value] of Object.entries(translations)) {
      if (lowerIssue.includes(key)) {
        return value;
      }
    }
    return issue; // Retorna original se não encontrar tradução
  });
}

/**
 * Gera uma mensagem de feedback baseada no resultado da verificação
 */
export function getVerificationFeedback(result: VerificationResult): {
  title: string;
  message: string;
  type: "success" | "warning" | "error";
} {
  if (result.isValid && result.confidence >= 0.8) {
    return {
      title: "Verificação aprovada!",
      message: "Suas fotos foram verificadas com sucesso.",
      type: "success",
    };
  }

  if (result.isValid && result.confidence >= 0.5) {
    return {
      title: "Verificação com ressalvas",
      message:
        result.suggestions.length > 0
          ? result.suggestions[0]
          : "Algumas fotos podem ser melhoradas.",
      type: "warning",
    };
  }

  if (!result.isSportsCourt) {
    return {
      title: "Foto não reconhecida",
      message:
        "As fotos não parecem ser de uma quadra esportiva. Tire novas fotos mostrando claramente a quadra.",
      type: "error",
    };
  }

  return {
    title: "Verificação pendente",
    message:
      result.issues.length > 0
        ? translateIssues(result.issues)[0]
        : "Por favor, revise suas fotos e tente novamente.",
    type: "error",
  };
}

// ============ DOCUMENT VERIFICATION ============

export interface UserDataToVerify {
  name: string;
  cpf?: string;
  birthDate?: string;
}

export interface DocumentVerificationResult {
  isValid: boolean;
  confidence: number;
  documentType: "rg" | "cnh" | "cnpj" | "passport" | "unknown";
  extractedData: {
    name?: string;
    cpf?: string;
    birthDate?: string;
    documentNumber?: string;
  };
  nameMatch: boolean;
  cpfMatch: boolean;
  issues: string[];
}

/**
 * Verifica se o documento de identidade é válido e corresponde aos dados do usuário
 * @param documentUrl URL da imagem do documento
 * @param userData Dados do usuário para comparação
 * @returns Resultado da verificação
 */
export async function verifyIdentityDocument(
  documentUrl: string,
  userData: UserDataToVerify
): Promise<DocumentVerificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("verify-document", {
      body: { documentUrl, userData, documentType: "identity" },
    });

    if (error) {
      console.error("Document verification error:", error);
      throw new Error(error.message || "Erro ao verificar documento");
    }

    return data as DocumentVerificationResult;
  } catch (err) {
    console.error("Document verification failed:", err);
    return {
      isValid: false,
      confidence: 0,
      documentType: "unknown",
      extractedData: {},
      nameMatch: false,
      cpfMatch: false,
      issues: ["Erro ao conectar com o serviço de verificação"],
    };
  }
}

/**
 * Verifica documento empresarial (CNPJ)
 * @param documentUrl URL da imagem do documento
 * @param companyName Nome da empresa
 * @returns Resultado da verificação
 */
export async function verifyBusinessDocument(
  documentUrl: string,
  companyName: string
): Promise<{
  isValid: boolean;
  confidence: number;
  extractedCnpj?: string;
  extractedName?: string;
  nameMatch: boolean;
  issues: string[];
}> {
  try {
    const { data, error } = await supabase.functions.invoke("verify-document", {
      body: { documentUrl, companyName, documentType: "cnpj" },
    });

    if (error) {
      console.error("Business document verification error:", error);
      throw new Error(error.message || "Erro ao verificar documento");
    }

    return data;
  } catch (err) {
    console.error("Business document verification failed:", err);
    return {
      isValid: false,
      confidence: 0,
      nameMatch: false,
      issues: ["Erro ao conectar com o serviço de verificação"],
    };
  }
}

/**
 * Gera feedback para verificação de documento
 */
export function getDocumentVerificationFeedback(result: DocumentVerificationResult): {
  title: string;
  message: string;
  type: "success" | "warning" | "error";
} {
  if (result.isValid && result.nameMatch) {
    return {
      title: "Documento verificado!",
      message: "Seus dados foram confirmados com sucesso.",
      type: "success",
    };
  }

  if (result.isValid && !result.nameMatch) {
    return {
      title: "Nome não confere",
      message: "O nome no documento não corresponde ao cadastro. Verifique se digitou corretamente.",
      type: "warning",
    };
  }

  if (!result.isValid && result.documentType === "unknown") {
    return {
      title: "Documento não reconhecido",
      message: "Não foi possível identificar o documento. Envie uma foto clara de RG, CNH ou Passaporte.",
      type: "error",
    };
  }

  return {
    title: "Verificação pendente",
    message: result.issues[0] || "Por favor, envie uma foto mais legível do documento.",
    type: "error",
  };
}
