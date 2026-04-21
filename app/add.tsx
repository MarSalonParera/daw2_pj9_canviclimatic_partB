import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { addEmissionRecord } from '../database/db';

// Lista de actividades predefinidas para facilitar la entrada de datos
const SUGGESTED_ACTIVITIES = [
  { label: 'Coche (Gasolina)', category: 'Transporte', factor: 0.19, unit: 'km', recommendation: 'Usa el transporte público o comparte vehículo.' },
  { label: 'Coche (Eléctrico)', category: 'Transporte', factor: 0.05, unit: 'km', recommendation: 'Carga el coche en horas de energía renovable.' },
  { label: 'Autobús / Metro', category: 'Transporte', factor: 0.03, unit: 'km', recommendation: '¡Excelente elección! Sigue usando el transporte público.' },
  { label: 'Vuelo comercial', category: 'Transporte', factor: 0.15, unit: 'km', recommendation: 'Para distancias cortas, el tren es más eficiente.' },
  { label: 'Aire Acondicionado', category: 'Energía', factor: 0.8, unit: 'horas', recommendation: 'Aísla bien las ventanas para mantener el frío.' },
  { label: 'Calefacción (Gas)', category: 'Energía', factor: 0.2, unit: 'kWh', recommendation: 'Baja un grado el termostato para ahorrar un 7%.' },
  { label: 'Secadora', category: 'Hogar', factor: 2.5, unit: 'ciclos', recommendation: 'Tiende la ropa al sol siempre que sea posible.' },
  { label: 'Lavadora (60°C)', category: 'Hogar', factor: 0.8, unit: 'ciclos', recommendation: 'Lava en frío para ahorrar un 80% de energía.' },
  { label: 'Consumo de carne roja', category: 'Alimentación', factor: 27.0, unit: 'kg', recommendation: 'Considera opciones basadas en plantas más a menudo.' },
  { label: 'Consumo de pollo', category: 'Alimentación', factor: 6.9, unit: 'kg', recommendation: 'Es una opción con menos impacto que la carne roja.' },
  { label: 'Frutas/Verduras', category: 'Alimentación', factor: 0.4, unit: 'kg', recommendation: 'Prioriza productos locales y de temporada.' },
  { label: 'Residuos generados', category: 'Residuos', factor: 0.5, unit: 'kg', recommendation: 'Recicla y evita productos con exceso de embalaje.' },
  { label: 'Uso de lavavajillas', category: 'Hogar', factor: 0.7, unit: 'ciclos', recommendation: 'Carga el lavavajillas por completo antes de usarlo.' },
];

const CATEGORIES = [...new Set(SUGGESTED_ACTIVITIES.map(a => a.category))];

const getImpactLevel = (co2Kg: number) => {
  if (co2Kg >= 10) return 'Alta';
  if (co2Kg >= 5) return 'Media';
  return 'Baja';
};

export default function AddScreen() {
  const router = useRouter();

  // RUBRICA: Lògica de l’aplicació i POO (estados)
  // Ubicación: estados del formulario para crear un nuevo registro.
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [co2Kg, setCo2Kg] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('unidades');
  const [factor, setFactor] = useState(0);
  const [recommendation, setRecommendation] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Función para auto-rellenar según la actividad seleccionada
  const selectActivity = (activity: typeof SUGGESTED_ACTIVITIES[0]) => {
    setSource(activity.label);
    setCategory(activity.category);
    setUnit(activity.unit);
    setFactor(activity.factor);
    setQuantity('1');
    setCo2Kg(activity.factor.toString());
    setRecommendation(activity.recommendation);
  };

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const num = parseFloat(val);
    if (!isNaN(num) && factor > 0) {
      const calculated = num * factor;
      setCo2Kg(calculated.toFixed(2));
    }
  };

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
      base64: Platform.OS === 'web', // Pedimos el contenido en base64 solo si es web
    });

    if (!result.canceled) {
      try {
        if (Platform.OS === 'web') {
          // En Web, las URIs temporales (blob:) caducan al cerrar el navegador.
          // Convertimos la imagen a un Data URI (Base64) para que se guarde físicamente en la DB.
          const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
          setPhotoUri(base64Uri);
        } else {
          // Persistencia Real en Móvil: Copiamos la imagen de la caché a la carpeta de documentos
          const fileName = `photo_${Date.now()}.jpg`;
          const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.copyAsync({ from: result.assets[0].uri, to: permanentUri });
          setPhotoUri(permanentUri);
        }
      } catch (error) {
        console.error("Error al guardar la imagen:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const numericCo2 = Number(co2Kg);

      if (!source || !category || !recommendation || co2Kg === '' || Number.isNaN(numericCo2)) {
        Alert.alert('Faltan datos', 'Completa todos los campos y usa un valor numérico válido en CO2.');
        return;
      }

      await addEmissionRecord({
        source,
        category,
        co2Kg: numericCo2,
        impactLevel: getImpactLevel(numericCo2),
        recommendation,
        photoUri,
      });

      // Pequeña pausa para mitigar posibles problemas de concurrencia en el worker de SQLite en web
      // Esto da tiempo al sistema subyacente para liberar el "Access Handle" de la base de datos.
      await new Promise(resolve => setTimeout(resolve, 50));
      router.replace('/list');
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert('Error', 'No se pudo guardar el registro en la base de datos.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Añade una actividad con emisiones</Text>
      
      <Text style={styles.sectionLabel}>1. Selecciona una categoría:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
        {CATEGORIES.map((cat) => (
          <Pressable 
            key={cat} 
            style={[styles.suggestionChip, selectedCategory === cat && styles.selectedChip]} 
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.suggestionText, selectedCategory === cat && styles.selectedText]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {selectedCategory && (
        <>
          <Text style={styles.sectionLabel}>2. Elige la actividad de {selectedCategory}:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestions}>
            {SUGGESTED_ACTIVITIES
              .filter(act => act.category === selectedCategory)
              .map((act, index) => (
                <Pressable 
                  key={index} 
                  style={[styles.suggestionChip, source === act.label && styles.selectedChip]} 
                  onPress={() => selectActivity(act)}
                >
                  <Text style={[styles.suggestionText, source === act.label && styles.selectedText]}>
                    {act.label}
                  </Text>
                </Pressable>
              ))}
          </ScrollView>
        </>
      )}

      <View style={[styles.formCard, !selectedCategory && { opacity: 0.5 }]}>
        <Text style={styles.sectionLabel}>3. Datos del registro</Text>
        <Text style={styles.inputLabel}>Nombre de la actividad</Text>
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
        <Text style={styles.inputLabel}>{`Cantidad (${unit})`}</Text>
        <TextInput
          value={quantity}
          onChangeText={handleQuantityChange}
          placeholder={`Número de ${unit}`}
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.calculationPreview}>
          {co2Kg ? `Impacto calculado: ${co2Kg} kg de CO2` : 'Introduce cantidad'}
        </Text>

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
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17352A',
    marginTop: 10,
  },
  suggestions: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  suggestionChip: {
    backgroundColor: '#E6F2EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D0E4D9',
  },
  selectedChip: {
    backgroundColor: '#2E7D5A',
    borderColor: '#2E7D5A',
  },
  suggestionText: {
    color: '#2E7D5A',
    fontSize: 14,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B8F6C',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#EFF5F1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#17352A',
  },
  calculationPreview: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D5A',
    marginBottom: 4,
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
