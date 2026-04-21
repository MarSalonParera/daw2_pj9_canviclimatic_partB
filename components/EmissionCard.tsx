import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmissionRecord } from '../database/db';

type EmissionCardProps = {
  item: EmissionRecord;
  onPress: (id: number) => void;
};

// RUBRICA: Lògica de l’aplicació i POO (props y componentes)
// Ubicación: componente reutilizable del listado que recibe item y acción por props.
export function EmissionCard({ item, onPress }: EmissionCardProps) {
  // Como el id en la clase es opcional pero en la lista siempre existe, 
  // usamos 'item.id!' para asegurar a TS que no es nulo aquí.
  return (
    <Pressable style={styles.card} onPress={() => onPress(item.id!)}>
      <View style={styles.row}>
        <View style={styles.mainContent}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.title}>{item.source}</Text>
          <Text style={styles.meta}>
            {item.co2Kg} kg CO2 · Impacto {item.impactLabel}
          </Text>
          <Text style={styles.meta}>{item.formattedDate}</Text>
        </View>

        {item.photoUri ? (
          // RUBRICA: Ús de la media
          // Ubicación: miniatura de la imagen asociada al registro dentro del listado.
          <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>CO2</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // RUBRICA: Estils i disseny
    // Ubicación: tarjeta visual del listado con estilo móvil propio.
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0B241A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  row: {
    // RUBRICA: Estils i disseny
    // Ubicación: uso de flex para organizar texto e imagen en horizontal.
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    gap: 4,
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#4B8F6C',
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17352A',
  },
  meta: {
    fontSize: 13,
    color: '#5C726B',
  },
  thumbnail: {
    width: 76,
    height: 76,
    borderRadius: 18,
  },
  placeholder: {
    width: 76,
    height: 76,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCECE3',
  },
  placeholderText: {
    color: '#285F47',
    fontWeight: '800',
    fontSize: 18,
  },
});
