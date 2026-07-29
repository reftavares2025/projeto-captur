import 'package:flutter/material.dart';
import 'screens/trip_detail_screen.dart';

void main() {
  runApp(const CapturTurismoApp());
}

class CapturTurismoApp extends StatelessWidget {
  const CapturTurismoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Captur Agência de Viagens',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFC8102E),
          primary: const Color(0xFFC8102E),
          secondary: const Color(0xFF0F172A),
        ),
        useMaterial3: true,
      ),
      home: const TripDetailScreen(),
    );
  }
}
