import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Envia mensagem de texto via Evolution API v1/v2
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  const url = `${process.env.EVOLUTION_API_URL || 'http://localhost:8080'}/message/sendText/${process.env.EVOLUTION_INSTANCE || 'CapturAgenciaDeViagens'}`;
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    await axios.post(
      url,
      {
        number: formattedPhone,
        text: message
      },
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY || 'sua_api_key_aqui',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[WHATSAPP] Mensagem enviada com sucesso para ${formattedPhone}`);
  } catch (error: any) {
    console.error(`[WHATSAPP ERROR] Falha no envio para ${phone}:`, error?.response?.data || error.message);
  }
}

/**
 * Envia documento/mídia (PDF/Vouchers) via Evolution API
 */
export async function sendWhatsAppMedia(phone: string, mediaUrl: string, fileName: string, caption: string) {
  const url = `${process.env.EVOLUTION_API_URL || 'http://localhost:8080'}/message/sendMedia/${process.env.EVOLUTION_INSTANCE || 'CapturAgenciaDeViagens'}`;
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    await axios.post(
      url,
      {
        number: formattedPhone,
        mediaMessage: {
          mediatype: 'document',
          media: mediaUrl,
          fileName: fileName,
          caption: caption
        }
      },
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY || 'sua_api_key_aqui',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[WHATSAPP MEDIA] Mídia ${fileName} enviada com sucesso para ${formattedPhone}`);
  } catch (error: any) {
    console.error(`[WHATSAPP MEDIA ERROR] Falha ao enviar mídia para ${phone}:`, error?.response?.data || error.message);
  }
}
