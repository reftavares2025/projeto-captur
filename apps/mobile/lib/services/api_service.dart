import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://localhost:3001/api';

  /// GET /api/trips/:id/full-details - Busca dados completos da viagem
  static Future<Map<String, dynamic>> fetchTripDetails(String tripId) async {
    // Simulação robusta para desacoplamento de build web/desktop
    return {
      "id": tripId,
      "destino": "Cancún, México",
      "dataEmbarque": "2026-08-12T00:00:00.000Z",
      "dataRetorno": "2026-08-19T00:00:00.000Z",
      "status": "EM_ANDAMENTO",
      "responsibilities": [
        {"id": "1", "titulo": "Envio de Cópia do Passaporte Válido", "tipo": "CLIENTE", "status": "ENVIADO"},
        {"id": "2", "titulo": "Assinatura do Contrato de Viagem", "tipo": "CLIENTE", "status": "PENDENTE"},
        {"id": "3", "titulo": "Emissão dos Vouchers & Seguro", "tipo": "AGENCIA", "status": "APROVADO"}
      ],
      "payments": [
        {"id": "p1", "title": "Entrada Pacote Cancún (Sinal)", "amount": 1500.0, "status": "PAGO"},
        {"id": "p2", "title": "2ª Parcela Pacote Cancún", "amount": 2500.0, "status": "PENDENTE"}
      ]
    };
  }

  /// POST /api/upload-document - Upload de passaporte/comprovante pelo cliente
  static Future<bool> uploadDocument(String responsibilityId, String filePath) async {
    print('[API SERVICE] Simulando upload multipart do arquivo $filePath para pendência $responsibilityId');
    return true;
  }
}
