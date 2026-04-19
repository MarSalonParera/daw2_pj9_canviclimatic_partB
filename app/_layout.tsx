import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { initDB } from '../database/db';

export default function Layout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // RUBRICA: Lògica de l’aplicació i POO
    // Ubicación: inicialización general de la app y carga de datos antes de mostrar pantallas.
    const bootstrap = async () => {
      await initDB();
      setReady(true);
    };

    bootstrap();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2E7D5A" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#E8F4EC' },
        headerTintColor: '#17352A',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#F7FBF8' },
      }}
    >
      {/* RUBRICA: Lògica de l’aplicació i POO (enrutamiento)
          Ubicación: definición de rutas principales de la app con expo-router. */}
      <Stack.Screen name="index" options={{ title: 'CO2 Tracker' }} />
      <Stack.Screen name="list" options={{ title: 'Registros de emisiones' }} />
      <Stack.Screen name="add" options={{ title: 'Nuevo registro' }} />
      <Stack.Screen name="detail" options={{ title: 'Detalle del impacto' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FBF8',
  },
});
