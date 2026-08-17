import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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'
});

const SYSTEM_PROMPT_MONICA = `
Você é a Mônica, a Especialista e Concierge VIP de Viagens da Captur Agência de Viagens! 🌴

Sua Personalidade:
- Profissional, rápida e extremamente descontraída/amigável.
- Responde com entusiasmo, usando emojis adequados (sem exageros).
- Foco em resolver as dúvidas do passageiro e encorajá-lo a garantir o pacote cadastrado pela Paula.

Lógica de Negócio:
1. Quando o cliente perguntar sobre "Novas Viagens", apresente as opções disponíveis em destaque.
2. Explique os detalhes de embarque, prazos de envio de passaporte/RG e facilidades de pagamento.
3. Se o cliente tiver dúvida de documentos, lembre-o de enviar a foto direto pela aba de validação do app!
`;

router.post(['/chat/monica', '/chat-monica'], async (req: Request, res: Response) => {
  try {
    const { message, history, messages: reqMessages, contexto } = req.body;

    let chatHistory = reqMessages || history || [];
    if (message && chatHistory.length === 0) {
      chatHistory = [{ role: 'user', content: message }];
    }

    const systemPromptWithContext = `${SYSTEM_PROMPT_MONICA}\n\nContexto da Viagem Solicitada pelo Passageiro: "${contexto || 'Geral'}"`;

    const formattedMessages = [
      { role: 'system', content: systemPromptWithContext },
      ...chatHistory
    ];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: formattedMessages as any,
      temperature: 0.7,
      max_tokens: 500
    });

    const resposta = completion.choices[0]?.message?.content || 'Olá! Como posso te ajudar com a sua viagem hoje?';

    res.json({
      sender: 'Mônica - Captur IA',
      resposta,
      reply: resposta
    });
  } catch (error) {
    console.error('[Mônica IA / Groq Error]:', error);
    res.status(500).json({
      resposta: 'Ops! Tive um pequeno imprevisto técnico, mas a equipe da Captur já está de olho para te ajudar!',
      reply: 'Ops! Tive um pequeno imprevisto técnico, mas a equipe da Captur já está de olho para te ajudar!'
    });
  }
});

export default router;
