import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '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'
});

const SYSTEM_PROMPT_MONICA = `
Você é a Mônica, a assistente virtual e consultora de viagens oficial da Captur Agência de Viagens.
Seu objetivo é ajudar os clientes da Captur com informações sobre suas viagens, dicas de destinos, dúvidas sobre bagagens, documentação (passaportes, vistos, vacinas) e roteiros.

Diretrizes de comportamento:
1. Seja sempre muito cortês, elegante, entusiasta e objetiva.
2. Lembre o cliente de conferir seus vouchers e passaportes no App da Captur.
3. A cor e identidade oficial da empresa é "Vermelho Captur" (#C8102E).
4. Se o assunto for alteração de voo, cancelamento ou reembolso financeiro, diga gentilmente que vai transferir para a Paula ou equipe humana da Captur.
`;

router.post('/chat/monica', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT_MONICA },
      ...(history || []),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0]?.message?.content || 'Olá! Como posso te ajudar com a sua viagem hoje?';

    res.json({
      sender: 'Mônica - Captur IA',
      reply
    });
  } catch (error) {
    console.error('[Mônica IA / Groq Error]:', error);
    res.status(500).json({
      reply: 'Ops! Tive um pequeno imprevisto técnico, mas a equipe da Captur já está de olho para te ajudar!'
    });
  }
});

export default router;
