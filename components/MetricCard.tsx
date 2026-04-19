import { StyleSheet, Text, View } from 'react-native';

type MetricCardProps = {
  label: string;
  value: string;
  accent: string;
};

// RUBRICA: Lògica de l’aplicació i POO (props y componentes)
// Ubicación: componente reutilizable que recibe datos por props.
export function MetricCard({ label, value, accent }: MetricCardProps) {
  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // RUBRICA: Estils i disseny
    // Ubicación: tarjeta flexible y reutilizable para el dashboard.
    flex: 1,
    minWidth: 150,
    backgroundColor: '#F3F7F4',
    borderTopWidth: 5,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#17352A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#133B2C',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: '#48645B',
  },
});
