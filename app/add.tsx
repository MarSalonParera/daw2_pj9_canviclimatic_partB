import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addEmissionRecord } from '../database/db';

const getImpactLevel = (co2Kg: number) => {
  if (co2Kg >= 10) {
    return 'Alta';
  }

  if (co2Kg >= 5) {
    return 'Media';
  }

  return 'Baja';
};

export default function AddScreen() {
  const router = useRouter();

  // RUBRICA: Lògica de l’aplicació i POO (estados)
  // Ubicación: estados del formulario para crear un nuevo registro.
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [co2Kg, setCo2Kg] = useState('');
  const [location, setLocation] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const openCamera = async () => {
    // RUBRICA: Ús de la media (captura)
    // Ubicación: apertura de cámara para obtener una imagen desde el dispositivo.
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitas aceptar la cámara para guardar evidencias.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const numericCo2 = Number(co2Kg);

    if (!source || !category || !location || !recommendation || Number.isNaN(numericCo2)) {
      Alert.alert('Faltan datos', 'Completa todos los campos y usa un valor numérico en CO2.');
      return;
    }

    await addEmissionRecord({
      source,
      category,
      co2Kg: numericCo2,
      impactLevel: getImpactLevel(numericCo2),
      recommendation,
      location,
      photoUri,
    });

    router.push('/list');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Añade una actividad con emisiones</Text>
      <Text style={styles.subtitle}>
        Registra el impacto, la ubicación y una foto tomada desde la cámara.
      </Text>

      <View style={styles.formCard}>
        <TextInput
          value={source}
          onChangeText={setSource}
          placeholder="Actividad o fuente de emisión"
          style={styles.input}
        />
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Categoría"
          style={styles.input}
        />
        <TextInput
          value={co2Kg}
          onChangeText={setCo2Kg}
          placeholder="kg de CO2"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Ubicación"
          style={styles.input}
        />
        <TextInput
          value={recommendation}
          onChangeText={setRecommendation}
          placeholder="Recomendación de mejora"
          multiline
          style={[styles.input, styles.multilineInput]}
        />

        <Pressable style={styles.cameraButton} onPress={openCamera}>
          <Text style={styles.cameraButtonText}>Abrir cámara</Text>
        </Pressable>

        {photoUri ? (
          // RUBRICA: Ús de la media (visualización dentro de la app)
          // Ubicación: previsualización de la imagen capturada.
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>La foto aparecerá aquí</Text>
          </View>
        )}

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar registro</Text>
        </Pressable>
      </View>

      {/* RUBRICA: Ús de la media (4 puntos)
          Ubicación: formulario de alta con cámara y vista previa interna. */}
      {/* RUBRICA: Lògica de l’aplicació i POO
          Ubicación: gestión del formulario, validación y guardado persistente. */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#17352A',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5A756A',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  input: {
    backgroundColor: '#EFF5F1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#17352A',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  cameraButton: {
    backgroundColor: '#DBEBE2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#20553E',
    fontWeight: '700',
    fontSize: 15,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  photoPlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E6DD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FAF7',
  },
  photoPlaceholderText: {
    color: '#6B867A',
  },
  saveButton: {
    backgroundColor: '#2E7D5A',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
