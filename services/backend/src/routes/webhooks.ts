import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const router = Router();
const prisma = new PrismaClient();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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'
});

export async function getMonicaAIResponse(userMessage: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Você é a Mônica, assistente virtual de viagens da Captur Agência de Viagens. Responda de forma curta, amigável e direta para o WhatsApp.'
        },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0]?.message?.content || 'Como posso te ajudar com sua viagem na Captur?';
  } catch (err) {
    console.error('Erro na resposta da Mônica via Groq (Llama 3.1 8B):', err);
    return 'Estou aqui para ajudar! Qualquer dúvida sobre sua viagem, é só me perguntar.';
  }
}

// Webhook para Status de Envio do WhatsApp (Evolution API)
router.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;

    if (event === 'messages.upsert' && data?.status === 'READ') {
      const messageId = data.key.id;
      console.log(`[WhatsApp Webhook] Mensagem ${messageId} confirmada como LIDA.`);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar webhook do WhatsApp' });
  }
});

// Webhook para Confirmação de Pagamento PIX
router.post('/webhooks/pix-payment', async (req: Request, res: Response) => {
  try {
    const { paymentId, status, tripId } = req.body;

    if (status === 'APPROVED' || status === 'PAID') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'PAID' }
      });

      console.log(`[PIX Webhook] Pagamento ${paymentId} confirmado para a viagem ${tripId}.`);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar webhook de PIX' });
  }
});

export default router;
