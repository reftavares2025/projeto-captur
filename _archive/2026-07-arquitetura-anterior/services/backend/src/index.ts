import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import { checkAndSendTravelReminders } from './cron/reminderCron';
import { sendWhatsAppMessage, sendWhatsAppMedia } from './services/whatsappService';
import { authenticateToken, AuthenticatedRequest } from './middlewares/authMiddleware';
import { generateVoucherPDF } from './services/pdfService';
import webhookRoutes from './routes/webhooks';
import templateRoutes from './routes/templates';
import aiAssistantRoutes from './routes/aiAssistant';

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log(`[WebSocket] Painel Admin conectado: ${socket.id}`);
});

export function notifyAdminNewDocument(docData: any) {
  io.emit('new_document_uploaded', {
    message: `Novo documento enviado por ${docData.clientName || 'Cliente'}`,
    document: docData
  });
}

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'captur_secret_key_2026';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições originadas deste IP, tente novamente em 15 minutos.' }
});

app.use('/api/', limiter);
app.use(express.json());

app.use('/api', webhookRoutes);
app.use('/api', templateRoutes);
app.use('/api', aiAssistantRoutes);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Captur Agência de Viagens Backend API', timestamp: new Date() });
});

// Login Admin
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'admin@captur.com.br' && password === 'admin123') {
    const token = jwt.sign({ id: 'admin-1', role: 'ADMIN', email }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ success: true, token, user: { nome: 'Paula Fructuoso', role: 'ADMIN' } });
  }
  return res.status(401).json({ error: 'Credenciais inválidas.' });
});

// Relatórios CSV
app.get('/api/admin/reports/export-csv', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      include: { cliente: true, payments: true }
    });

    let csvContent = 'ID Viagem,Cliente,Destino,Data Embarque,Data Retorno,Status,Faturamento Total\n';

    trips.forEach((t) => {
      const totalAmount = t.payments.reduce((acc, p) => acc + p.amount, 0);
      csvContent += `"${t.id}","${t.cliente?.nome || 'N/A'}","${t.destino}","${t.dataEmbarque}","${t.dataRetorno}","${t.status}",${totalAmount}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_captur_viagens.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório CSV' });
  }
});

// GET /api/trips
app.get('/api/trips', async (req: Request, res: Response) => {
  const trips = await prisma.trip.findMany({
    include: { cliente: true, responsibilities: { include: { documents: true } }, payments: true }
  });
  res.json(trips);
});

// POST /api/trips
app.post('/api/trips', async (req: Request, res: Response) => {
  try {
    const { clienteId, destino, dataEmbarque, dataRetorno } = req.body;
    const trip = await prisma.trip.create({
      data: {
        clienteId,
        destino,
        dataEmbarque: new Date(dataEmbarque),
        dataRetorno: new Date(dataRetorno),
        status: 'EM_ANDAMENTO',
        responsibilities: {
          create: [
            { titulo: 'Envio de Passaporte Válido', tipo: 'CLIENTE', status: 'PENDENTE' },
            { titulo: 'Assinatura do Contrato de Viagem', tipo: 'CLIENTE', status: 'PENDENTE' },
            { titulo: 'Emissão dos Vouchers & Seguro', tipo: 'AGENCIA', status: 'APROVADO' }
          ]
        }
      },
      include: { cliente: true, responsibilities: true }
    });

    if (trip.cliente?.whatsapp) {
      await sendWhatsAppMessage(
        trip.cliente.whatsapp,
        `Olá *${trip.cliente.nome}*! ✈️ Sua viagem para *${trip.destino}* foi cadastrada na *Captur Agência de Viagens*. Acesse o app para conferir seu checklist!`
      );
    }
    res.status(201).json(trip);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/upload-document
app.post('/api/upload-document', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { responsibilityId, notes } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const doc = await prisma.document.create({
      data: { responsibilityId, fileUrl, notes, status: 'EM_ANALISE' }
    });

    const resp = await prisma.responsibility.update({
      where: { id: responsibilityId },
      data: { status: 'ENVIADO' },
      include: { trip: { include: { cliente: true } } }
    });

    notifyAdminNewDocument({
      clientName: resp.trip.cliente?.nome || 'Passageiro',
      documentId: doc.id,
      title: resp.titulo
    });

    res.status(201).json({ success: true, document: doc });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/responsibilities/:id/approve
app.patch('/api/responsibilities/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const resp = await prisma.responsibility.update({
      where: { id },
      data: { status },
      include: { trip: { include: { cliente: true } } }
    });

    const phone = resp.trip.cliente?.whatsapp;

    if (status === 'APROVADO') {
      const pdfUrl = await generateVoucherPDF(resp.trip);
      const fullPdfUrl = `${req.protocol}://${req.get('host')}${pdfUrl}`;

      if (phone) {
        await sendWhatsAppMessage(
          phone,
          `✅ *Captur Agência de Viagens*: Excelente notícia, ${resp.trip.cliente.nome}! O seu documento referente a *${resp.titulo}* foi aprovado com sucesso! Seu voucher oficial já está disponível no App!`
        );
        await sendWhatsAppMedia(phone, fullPdfUrl, `voucher_${resp.trip.id}.pdf`, 'Seu Voucher Oficial da Viagem!');
      }
    } else if (status === 'REJEITADO' && phone) {
      await sendWhatsAppMessage(
        phone,
        `⚠️ *Captur Agência de Viagens*: Olá, ${resp.trip.cliente.nome}. O documento referente a *${resp.titulo}* precisa de ajuste.\n\n*Motivo:* ${notes || 'Documento ilegível'}.\nPor favor, envie novamente pelo App!`
      );
    }

    res.json({ success: true, responsibility: resp });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao processar aprovação.' });
  }
});

// GET /api/trips/:id/full-details
app.get('/api/trips/:id/full-details', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { cliente: true, responsibilities: { include: { documents: true } }, payments: true }
    });
    res.json(trip);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users
app.get('/api/users', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// GET /api/test-cron
app.get('/api/test-cron', async (req: Request, res: Response) => {
  await checkAndSendTravelReminders();
  res.json({ success: true, message: 'Execução manual do Cron Job de lembretes concluída!' });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`[Backend/WS] Mônica IA Groq (Llama 3.1 8B) rodando na porta ${PORT}`);
});
