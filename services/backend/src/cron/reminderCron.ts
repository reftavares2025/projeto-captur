import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Configurações do Evolution API (WhatsApp Webhook/API)
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'sua_api_key_aqui';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'CapturTurismo';

/**
 * Função para enviar mensagem via Evolution API (WhatsApp)
 */
async function sendWhatsAppNotification(phone: string, message: string) {
  try {
    // Formata o número (remover caracteres não numéricos)
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    await axios.post(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        number: formattedPhone,
        text: message
      },
      {
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[WHATSAPP] Notificação enviada com sucesso para ${formattedPhone}`);
  } catch (error: any) {
    console.error(`[WHATSAPP ERROR] Erro ao enviar notificação para ${phone}:`, error?.response?.data || error.message);
  }
}

/**
 * Lógica principal de checagem dos lembretes pré-viagem (30, 15 e 7 dias)
 */
export async function checkAndSendTravelReminders() {
  console.log('[CRON] Iniciando checagem de pendências de viagens para próximos 30, 15 e 7 dias...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Intervalos de interesse em dias
  const targetDays = [30, 15, 7];

  for (const days of targetDays) {
    const targetDateStart = new Date(today);
    targetDateStart.setDate(today.getDate() + days);

    const targetDateEnd = new Date(targetDateStart);
    targetDateEnd.setHours(23, 59, 59, 999);

    // Busca viagens que embarcam exatamente na janela de 'days' dias
    const trips = await prisma.trip.findMany({
      where: {
        status: 'EM_ANDAMENTO',
        dataEmbarque: {
          gte: targetDateStart,
          lte: targetDateEnd
        }
      },
      include: {
        cliente: true,
        responsibilities: {
          where: {
            tipo: 'CLIENTE',
            status: 'PENDENTE'
          }
        }
      }
    });

    for (const trip of trips) {
      if (trip.responsibilities.length > 0) {
        const pendingList = trip.responsibilities.map(r => `• ${r.titulo}`).join('\n');
        
        const message = `Olá, *${trip.cliente.nome}*! ✈️\n\nFaltam apenas *${days} dias* para a sua viagem com destino a *${trip.destino}*!\n\nIdentificamos pendências da sua viagem que precisam de sua atenção:\n\n${pendingList}\n\nPor favor, acesse o app *Captur Agência de Viagens* para regularizar e garantir uma viagem sem imprevistos! 🧳✨`;

        console.log(`[ALERTA] Cliente: ${trip.cliente.nome} | Faltam ${days} dias | Pendências: ${trip.responsibilities.length}`);

        if (trip.cliente.whatsapp) {
          await sendWhatsAppNotification(trip.cliente.whatsapp, message);
        }
      }
    }
  }

  console.log('[CRON] Checagem de lembretes concluída com sucesso!');
}

// Configura execução diária às 08:00 AM (0 8 * * *) ou acionamento direto se for rodado como script
if (require.main === module) {
  // Roda imediatamente ao iniciar a execução do script
  checkAndSendTravelReminders().then(() => {
    // Agenda cron job para rodar diariamente às 08:00 AM
    cron.schedule('0 8 * * *', () => {
      checkAndSendTravelReminders();
    });
    console.log('[CRON SERVICE] Agendador ativado (Execução diária às 08:00).');
  });
}
