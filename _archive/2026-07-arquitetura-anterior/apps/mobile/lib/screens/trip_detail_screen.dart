import 'package:flutter/material.dart';
import '../models/trip_model.dart';

class TripDetailScreen extends StatefulWidget {
  const TripDetailScreen({super.key});

  @override
  State<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends State<TripDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final TripDetail mockTrip = TripDetail(
    id: '1',
    destino: 'Cancún, México 🇲🇽',
    dataEmbarque: DateTime.now().add(const Duration(days: 15)),
    dataRetorno: DateTime.now().add(const Duration(days: 22)),
    status: 'EM_ANDAMENTO',
    responsibilities: [
      Responsibility(id: '1', titulo: 'Envio do Passaporte Válido', tipo: 'CLIENTE', status: 'PENDENTE'),
      Responsibility(id: '2', titulo: 'Assinatura do Contrato de Viagem', tipo: 'CLIENTE', status: 'PENDENTE'),
      Responsibility(id: '3', titulo: 'Formulário de Imigração Preenchido', tipo: 'CLIENTE', status: 'ENVIADO'),
      Responsibility(id: '4', titulo: 'Emissão das Passagens Aéreas', tipo: 'AGENCIA', status: 'APROVADO'),
      Responsibility(id: '5', titulo: 'Vouchers de Hotelaria & Transfer', tipo: 'AGENCIA', status: 'APROVADO'),
      Responsibility(id: '6', titulo: 'Seguro Viagem Internacional', tipo: 'AGENCIA', status: 'APROVADO'),
    ],
  );

  final List<DestinationGuideItem> mockGuides = [
    DestinationGuideItem(
      id: '1',
      destino: 'Cancún, México',
      categoria: 'RESTAURANTE',
      nomeLocal: 'Lorenzillo\'s Lobster House',
      descricao: 'Restaurante flutuante especializado em frutos do mar com vista para a lagoa Nichupté.',
      fotoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    ),
    DestinationGuideItem(
      id: '2',
      destino: 'Cancún, México',
      categoria: 'BALADA',
      nomeLocal: 'Coco Bongo Show & Disco',
      descricao: 'Espetáculo ao vivo estilo Las Vegas misturado com balada de alta energia.',
      fotoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
    ),
    DestinationGuideItem(
      id: '3',
      destino: 'Cancún, México',
      categoria: 'PONTO_TURISTICO',
      nomeLocal: 'Chichén Itzá & Pirâmide de Kukulcán',
      descricao: 'Uma das 7 Maravilhas do Mundo Moderno. Passeio imperdível pela cultura Maia.',
      fotoUrl: 'https://images.unsplash.com/photo-1518638150340-f706e86654de',
    ),
    DestinationGuideItem(
      id: '4',
      destino: 'Cancún, México',
      categoria: 'PONTO_TURISTICO',
      nomeLocal: 'Isla Mujeres & Playa Norte',
      descricao: 'Águas cristalinas ideais para mergulho e relaxamento em beach clubs.',
      fotoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final progress = mockTrip.progressPercentage;
    final progressInt = (progress * 100).toInt();

    return Scaffold,
      appBar: AppBar(
        title: Text(mockTrip.destino, style: const TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFFF6D00),
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.checklist), text: 'Timeline & Status'),
            Tab(icon: Icon(Icons.explore), text: 'Guia do Destino'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTimelineTab(progress, progressInt),
          _buildDestinationGuideTab(),
        ],
      ),
    );
  }

  /// 1. Timeline & Checklist
  Widget _buildTimelineTab(double progress, int progressInt) {
    final clienteTasks = mockTrip.responsibilities.where((r) => r.tipo == 'CLIENTE').toList();
    final agenciaTasks = mockTrip.responsibilities.where((r) => r.tipo == 'AGENCIA').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner de Progresso Visual
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1565C0), Color(0xFF0D47A1)],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.blue.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Progresso da Viagem', style: TextStyle(color: Colors.white70, fontSize: 14)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF6D00),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '$progressInt% ORGANIZADA',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 10,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFF6D00)),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: const [
                    Icon(Icons.calendar_today, color: Colors.white70, size: 16),
                    SizedBox(width: 6),
                    Text('Embarque: Faltam 15 dias', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Seção 1: Responsabilidades do Cliente
          const Text(
            '📌 Suas Pendências (Cliente)',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 8),
          ...clienteTasks.map((task) => _buildTaskItem(task)),

          const SizedBox(height: 24),

          // Seção 2: Responsabilidades da Agência
          const Text(
            '🏢 Organizado pela Agência Captur',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 8),
          ...agenciaTasks.map((task) => _buildTaskItem(task)),
        ],
      ),
    );
  }

  Widget _buildTaskItem(Responsibility task) {
    Color statusColor = Colors.orange;
    IconData statusIcon = Icons.hourglass_top;

    if (task.status == 'APROVADO') {
      statusColor = Colors.green;
      statusIcon = Icons.check_circle;
    } else if (task.status == 'ENVIADO') {
      statusColor = Colors.blue;
      statusIcon = Icons.unarchive;
    } else if (task.status == 'PENDENTE') {
      statusColor = Colors.red;
      statusIcon = Icons.error_outline;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(statusIcon, color: statusColor, size: 28),
        title: Text(task.titulo, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          task.tipo == 'CLIENTE' ? 'Sua Ação Necessária' : 'Captur Turismo cuidando de tudo',
          style: const TextStyle(fontSize: 12),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            task.status,
            style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
          ),
        ),
      ),
    );
  }

  /// 2. Guia do Destino (Restaurantes, Baladas e Pontos Turísticos)
  Widget _buildDestinationGuideTab() {
    final restaurantes = mockGuides.where((g) => g.categoria == 'RESTAURANTE').toList();
    final baladas = mockGuides.where((g) => g.categoria == 'BALADA').toList();
    final pontos = mockGuides.where((g) => g.categoria == 'PONTO_TURISTICO').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Guia Oficial de Cancún 🌴',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const Text(
            'Dicas exclusivas selecionadas pela Paula para a sua viagem',
            style: TextStyle(color: Colors.grey, fontSize: 14),
          ),
          const SizedBox(height: 20),

          // Categoria 1: Pontos Turísticos
          _buildGuideSection('🏛️ Pontos Turísticos Imperdíveis', pontos),

          const SizedBox(height: 20),
          // Categoria 2: Restaurantes
          _buildGuideSection('🍽️ Onde Comer & Gastronomia', restaurantes),

          const SizedBox(height: 20),
          // Categoria 3: Baladas
          _buildGuideSection('🎉 Vida Noturna & Festas', baladas),
        ],
      ),
    );
  }

  Widget _buildGuideSection(String title, List<DestinationGuideItem> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1565C0))),
        const SizedBox(height: 10),
        ...items.map((item) => Card(
              margin: const EdgeInsets.only(bottom: 12),
              clipBehavior: Clip.antiAlias,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 140,
                    width: double.infinity,
                    color: Colors.blueGrey.shade100,
                    child: Stack(
                      children: [
                        Positioned.fill(
                          child: Icon(
                            item.categoria == 'RESTAURANTE'
                                ? Icons.restaurant
                                : item.categoria == 'BALADA'
                                    ? Icons.nightlife
                                    : Icons.landscape,
                            size: 60,
                            color: Colors.blueGrey.shade300,
                          ),
                        ),
                        Positioned(
                          top: 10,
                          right: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.7),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              item.categoria,
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        )
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(14.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.nomeLocal, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(item.descricao, style: const TextStyle(color: Colors.black70, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}
