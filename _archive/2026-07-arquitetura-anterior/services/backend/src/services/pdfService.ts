import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function generateVoucherPDF(tripData: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fileName = `voucher_${tripData.id}.pdf`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Cabeçalho da Captur Agência de Viagens
    doc.rect(0, 0, 612, 100).fill('#B80D28');
    doc.font('Helvetica-Bold').fillColor('#FFFFFF').fontSize(22).text('CAPTUR AGÊNCIA DE VIAGENS', 50, 32);
    doc.font('Helvetica').fontSize(11).text('Voucher Oficial de Confirmação de Reserva & Hospedagem', 50, 62);

    // Corpo do Documento
    doc.moveDown(4);
    doc.font('Helvetica-Bold').fillColor('#0F172A').fontSize(16).text(`Destino: ${tripData.destino || tripData.destination}`, { underline: true });
    doc.moveDown();
    
    doc.font('Helvetica').fontSize(12).text(`Passageiro: ${tripData.cliente?.nome || tripData.client?.name || 'Cliente Captur'}`);
    doc.text(`CPF: ${tripData.cliente?.cpf || tripData.client?.cpf || 'Não informado'}`);
    doc.text(`Data de Embarque: ${new Date(tripData.dataEmbarque || tripData.startDate).toLocaleDateString('pt-BR')}`);
    doc.text(`Data de Retorno: ${new Date(tripData.dataRetorno || tripData.endDate).toLocaleDateString('pt-BR')}`);
    doc.text(`Status da Reserva: CONFIRMADA E APROVADA ✅`);

    doc.moveDown(3);
    doc.rect(50, 260, 512, 80).fillAndStroke('#FFF5F6', '#B80D28');
    doc.font('Helvetica-Bold').fillColor('#B80D28').fontSize(12).text('INSTRUÇÕES DE CHECK-IN', 70, 275);
    doc.font('Helvetica').fillColor('#0F172A').fontSize(10).text('Apresente este voucher digitalmente ou impresso no momento do check-in no hotel / transporte da viagem.', 70, 295);

    doc.moveDown(4);
    doc.fontSize(9).fillColor('#64748B').text('Captur Agência de Viagens - Transformando seu sonho em momentos incríveis!', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/uploads/${fileName}`));
    stream.on('error', (err) => reject(err));
  });
}
