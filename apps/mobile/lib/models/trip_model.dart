class Responsibility {
  final String id;
  final String titulo;
  final String tipo; // AGENCIA ou CLIENTE
  final String status; // PENDENTE, ENVIADO, APROVADO
  final DateTime? dataLimite;

  Responsibility({
    required this.id,
    required this.titulo,
    required this.tipo,
    required this.status,
    this.dataLimite,
  });
}

class DestinationGuideItem {
  final String id;
  final String destino;
  final String categoria; // RESTAURANTE, BALADA, PONTO_TURISTICO
  final String nomeLocal;
  final String descricao;
  final String fotoUrl;

  DestinationGuideItem({
    required this.id,
    required this.destino,
    required this.categoria,
    required this.nomeLocal,
    required this.descricao,
    required this.fotoUrl,
  });
}

class TripDetail {
  final String id;
  final String destino;
  final DateTime dataEmbarque;
  final DateTime dataRetorno;
  final String status;
  final List<Responsibility> responsibilities;

  TripDetail({
    required this.id,
    required this.destino,
    required this.dataEmbarque,
    required this.dataRetorno,
    required this.status,
    required this.responsibilities,
  });

  double get progressPercentage {
    if (responsibilities.isEmpty) return 0.0;
    final approved = responsibilities.where((r) => r.status == 'APROVADO').length;
    return approved / responsibilities.length;
  }
}
