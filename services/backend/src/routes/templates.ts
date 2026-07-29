import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os templates
router.get('/admin/templates', authenticateToken, async (req: Request, res: Response) => {
  const templates = await (prisma as any).messageTemplate.findMany();
  res.json(templates);
});

// Atualizar ou criar template de mensagem
router.put('/admin/templates/:trigger', authenticateToken, async (req: Request, res: Response) => {
  const { trigger } = req.params;
  const { title, content } = req.body;

  const template = await (prisma as any).messageTemplate.upsert({
    where: { trigger },
    update: { title, content },
    create: { trigger, title, content }
  });

  res.json({ message: 'Template de mensagem atualizado com sucesso', template });
});

export default router;
