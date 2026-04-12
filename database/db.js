import AsyncStorage from '@react-native-async-storage/async-storage';

const FOSSILS_KEY = 'fossils';

// Datos iniciales
const initialFossils = [
  { id: 1, name: "Carbón", type: "Sólido", description: "Combustible fósil que libera CO₂ al quemarse" },
  { id: 2, name: "Petróleo", type: "Líquido", description: "Usado en transporte y energía, genera emisiones de CO₂" },
  { id: 3, name: "Gas Natural", type: "Gas", description: "Combustible fósil más limpio que el carbón, pero aún emite CO₂" }
];

// Inicializar DB
export const initDB = async () => {
  const data = await AsyncStorage.getItem(FOSSILS_KEY);
  if (!data) {
    await AsyncStorage.setItem(FOSSILS_KEY, JSON.stringify(initialFossils));
  }
};

// Obtener todos
export const getFossils = async () => {
  const data = await AsyncStorage.getItem(FOSSILS_KEY);
  return data ? JSON.parse(data) : [];
};

// Añadir uno nuevo
export const addFossil = async (fossil) => {
  const fossils = await getFossils();
  const newFossil = { id: Date.now(), ...fossil };
  fossils.push(newFossil);
  await AsyncStorage.setItem(FOSSILS_KEY, JSON.stringify(fossils));
};