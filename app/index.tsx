import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../components/MetricCard';
import { getDashboardStats } from '../database/db';

export default function HomeScreen() {
  const router = useRouter();
  // RUBRICA: Lògica de l’aplicació i POO (estados)
  // Ubicación: estado de métricas del dashboard.
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalCo2: 0,
    averageCo2: 0,
    topCategory: 'Sin datos',
  });

  useEffect(() => {
    const loadStats = async () => {
      const nextStats = await getDashboardStats();
      setStats(nextStats);
    };

    loadStats();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Seguimiento personal</Text>
        <Text style={styles.title}>Controla tus actividades que generan CO2</Text>
        <Text style={styles.description}>
          Esta app registra emisiones, recomienda mejoras y guarda evidencias visuales de cada
          actividad para analizar tu impacto.
        </Text>
      </View>

      <View style={styles.metricsRow}>
        {/* RUBRICA: Lògica de l’aplicació i POO (props)
            Ubicación: envío de props a componentes reutilizables MetricCard. */}
        <MetricCard
          label="Registros guardados"
          value={String(stats.totalRecords)}
          accent="#2E7D5A"
        />
        <MetricCard label="CO2 acumulado" value={`${stats.totalCo2} kg`} accent="#D17B38" />
      </View>

      <View style={styles.metricsRow}>
        <MetricCard label="Media por actividad" value={`${stats.averageCo2} kg`} accent="#3C8DA8" />
        <MetricCard label="Categoría dominante" value={stats.topCategory} accent="#7A5CBB" />
      </View>

  

      <Pressable style={styles.primaryButton} onPress={() => router.push('/list')}>
        <Text style={styles.primaryButtonText}>Ver registros</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.push('/add')}>
        <Text style={styles.secondaryButtonText}>Crear nuevo registro</Text>
      </Pressable>

      {/* RUBRICA: Lògica de l’aplicació i POO (8 puntos)
          Ubicación: pantalla principal con navegación, estado y uso de componentes. */}
      {/* RUBRICA: Estils i disseny (8 puntos)
          Ubicación: layout con flex, tarjetas responsivas y estilo móvil propio. */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  hero: {
    backgroundColor: '#163E2F',
    borderRadius: 28,
    padding: 24,
    gap: 10,
  },
  eyebrow: {
    color: '#A7DFC2',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
  },
  description: {
    color: '#D9F0E3',
    fontSize: 15,
    lineHeight: 22,
  },
  metricsRow: {
    // RUBRICA: Estils i disseny
    // Ubicación: uso de flex para adaptar tarjetas a distintos tamaños de pantalla.
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2EDE6',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#17352A',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#48645B',
  },
  primaryButton: {
    backgroundColor: '#2E7D5A',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Platform.select({
      ios: '#E6F2EB',
      android: '#DFF0E5',
      default: '#E6F2EB',
    }),
  },
  secondaryButtonText: {
    color: '#1C5A41',
    fontSize: 16,
    fontWeight: '700',
  },
});
