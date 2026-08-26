import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Limpando dados anteriores...');
  await prisma.document.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.responsibility.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  console.log('[SEED] Criando cliente...');
  const user = await prisma.user.create({
    data: {
      nome: 'Régis Tavares',
      whatsapp: '5585999999999',
      cpf: '123.456.789-00',
    },
  });

  console.log('[SEED] Criando viagem para Cancún...');
  const dataEmbarque = new Date();
  dataEmbarque.setDate(dataEmbarque.getDate() + 15);
  const dataRetorno = new Date(dataEmbarque);
  dataRetorno.setDate(dataEmbarque.getDate() + 7);

  const trip = await prisma.trip.create({
    data: {
      clienteId: user.id,
      destino: 'Cancún, México',
      dataEmbarque: dataEmbarque,
      dataRetorno: dataRetorno,
      status: 'EM_ANDAMENTO',
    },
  });

  console.log('[SEED] Criando responsabilidades e documentos...');
  const respPassaporte = await prisma.responsibility.create({
    data: {
      tripId: trip.id,
      titulo: 'Envio de Cópia do Passaporte Válido',
      tipo: 'CLIENTE',
      status: 'ENVIADO',
      dataLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.document.create({
    data: {
      responsibilityId: respPassaporte.id,
      fileUrl: 'http://localhost:3001/uploads/passaporte_regis.pdf',
      status: 'EM_ANALISE',
      notes: 'Passaporte válido até 2030 enviado para conferência.',
    },
  });

  await prisma.responsibility.create({
    data: {
      tripId: trip.id,
      titulo: 'Assinatura do Contrato de Viagem',
      tipo: 'CLIENTE',
      status: 'PENDENTE',
      dataLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.responsibility.create({
    data: {
      tripId: trip.id,
      titulo: 'Emissão dos Vouchers de Hotelaria e Passeios',
      tipo: 'AGENCIA',
      status: 'APROVADO',
    },
  });

  console.log('[SEED] Criando pagamentos...');
  await prisma.payment.createMany({
    data: [
      {
        tripId: trip.id,
        title: 'Entrada Pacote Cancún (Sinal)',
        amount: 1500.0,
        dueDate: new Date(),
        status: 'PAGO',
      },
      {
        tripId: trip.id,
        title: '2ª Parcela Pacote Cancún',
        amount: 2500.0,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'PENDENTE',
        pixQrCode: '00020126360014BR.GOV.BCB.PIX0114+558599999999952040000530398654041500',
      },
    ],
  });

  console.log('[SEED] Seed concluído com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
