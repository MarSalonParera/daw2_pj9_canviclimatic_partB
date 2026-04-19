import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEmissionRecordById } from '../database/db';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // RUBRICA: Lògica de l’aplicació i POO (estado)
  // Ubicación: estado local del registro cargado para la pantalla de detalle.
  const [record, setRecord] = useState<any | null>(null);

  useEffect(() => {
    const loadRecord = async () => {
      if (!id) {
        return;
      }

      const data = await getEmissionRecordById(id);
      setRecord(data);
    };

    loadRecord();
  }, [id]);

  if (!record) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>No se encontró el registro.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.category}>{record.category}</Text>
        <Text style={styles.title}>{record.source}</Text>
        <Text style={styles.meta}>
          {record.co2Kg} kg CO2 · Impacto {record.impactLabel}
        </Text>
      </View>

      {record.photoUri ? (
        // RUBRICA: Ús de la media (visualización dentro de la app)
        // Ubicación: la foto tomada con cámara se enseña en el detalle del registro.
        <Image source={{ uri: record.photoUri }} style={styles.image} />
      ) : (
        <View style={styles.noPhotoBox}>
          <Text style={styles.noPhotoTitle}>Sin foto asociada</Text>
          <Text style={styles.noPhotoText}>
            Los registros creados con cámara aparecen aquí dentro de la app.
          </Text>
        </View>
      )}

      <View style={styles.detailCard}>
        <Text style={styles.label}>Ubicación</Text>
        <Text style={styles.value}>{record.location}</Text>

        <Text style={styles.label}>Nivel de impacto guardado</Text>
        <Text style={styles.value}>{record.impactLevel}</Text>

        <Text style={styles.label}>Fecha</Text>
        <Text style={styles.value}>{record.formattedDate}</Text>

        <Text style={styles.label}>Recomendación</Text>
        <Text style={styles.value}>{record.recommendation}</Text>
      </View>

      {/* RUBRICA: Ús de la media 
          Ubicación: detalle donde se muestra la imagen guardada en el registro. */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FBF8',
  },
  empty: {
    color: '#577267',
    fontSize: 16,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  hero: {
    backgroundColor: '#DFF0E5',
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  category: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#427B61',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#17352A',
  },
  meta: {
    fontSize: 15,
    color: '#49675B',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 24,
  },
  noPhotoBox: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#F1F6F3',
    borderWidth: 1,
    borderColor: '#D8E6DD',
  },
  noPhotoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#17352A',
  },
  noPhotoText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#5D776D',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#67927F',
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    lineHeight: 24,
    color: '#17352A',
  },
});
