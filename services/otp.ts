// services/otp.ts
import { supabase } from '@/lib/supabase';

export interface OTPResponse {
  success: boolean;
  error?: string;
  expiresAt?: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  error?: string;
  verified?: boolean;
}

/**
 * Envia um código OTP via SMS para o telefone informado
 */
export async function sendOTP(phone: string): Promise<OTPResponse> {
  try {
    // Formatar telefone (remover espaços e caracteres especiais)
    const formattedPhone = phone.replace(/\D/g, '');

    // Validar formato do telefone
    if (formattedPhone.length < 10 || formattedPhone.length > 13) {
      return {
        success: false,
        error: 'Número de telefone inválido',
      };
    }

    // Adicionar código do país se não existir
    const fullPhone = formattedPhone.startsWith('55')
      ? `+${formattedPhone}`
      : `+55${formattedPhone}`;

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { phone: fullPhone },
    });

    if (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        error: error.message || 'Erro ao enviar código',
      };
    }

    return {
      success: true,
      expiresAt: data.expiresAt,
    };
  } catch (error: any) {
    console.error('Send OTP exception:', error);
    return {
      success: false,
      error: error.message || 'Erro inesperado ao enviar código',
    };
  }
}

/**
 * Verifica se o código OTP está correto
 */
export async function verifyOTP(
  phone: string,
  code: string,
): Promise<VerifyOTPResponse> {
  try {
    // Formatar telefone
    const formattedPhone = phone.replace(/\D/g, '');
    const fullPhone = formattedPhone.startsWith('55')
      ? `+${formattedPhone}`
      : `+55${formattedPhone}`;

    // Validar código
    if (!code || code.length !== 6) {
      return {
        success: false,
        error: 'Código deve ter 6 dígitos',
      };
    }

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { phone: fullPhone, code },
    });

    if (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error.message || 'Erro ao verificar código',
      };
    }

    if (!data.verified) {
      return {
        success: false,
        error: data.error || 'Código inválido ou expirado',
      };
    }

    return {
      success: true,
      verified: true,
    };
  } catch (error: any) {
    console.error('Verify OTP exception:', error);
    return {
      success: false,
      error: error.message || 'Erro inesperado ao verificar código',
    };
  }
}

/**
 * Atualiza o telefone verificado no perfil do usuário
 */
export async function updateVerifiedPhone(
  userId: string,
  phone: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedPhone = phone.replace(/\D/g, '');
    const fullPhone = formattedPhone.startsWith('55')
      ? `+${formattedPhone}`
      : `+55${formattedPhone}`;

    const { error } = await supabase
      .from('profiles')
      .update({
        phone: fullPhone,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Update phone error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Update phone exception:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Formata o telefone para exibição
 */
export function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Remove código do país se existir
  const localDigits = digits.startsWith('55') ? digits.slice(2) : digits;

  if (localDigits.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  } else if (localDigits.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
  }

  return phone;
}

/**
 * Máscara de input para telefone
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 2) {
    return `(${digits}`;
  } else if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}
