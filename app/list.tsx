import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmissionCard } from '../components/EmissionCard';
import { getEmissionRecords } from '../database/db';

export default function ListScreen() {
  const router = useRouter();
  // RUBRICA: Lògica de l’aplicació i POO (estados)
  // Ubicación: estado de búsqueda y estado de la colección mostrada en pantalla.
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<any[]>([]);

  const loadRecords = async () => {
    const data = await getEmissionRecords();
    setRecords(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const filteredRecords = records.filter((record) => {
    const normalizedSearch = search.toLowerCase();
    return (
      record.source.toLowerCase().includes(normalizedSearch) ||
      record.category.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Historial de emisiones</Text>
      <Text style={styles.caption}>Consulta, filtra y abre el detalle de cada actividad.</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por actividad o categoría"
        placeholderTextColor="#6F8A80"
        style={styles.searchInput}
      />

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          // RUBRICA: Lògica de l’aplicació i POO (props)
          // Ubicación: cada registro se pasa por props al componente EmissionCard.
          <EmissionCard
            item={item}
            onPress={(id) => router.push({ pathname: '/detail', params: { id: String(id) } })}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No hay registros que coincidan.</Text>}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/add')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* RUBRICA: Lògica de l’aplicació i POO
          Ubicación: listado con filtro dinámico, navegación al detalle y componentes reutilizables. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18392D',
  },
  caption: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: '#5A756A',
  },
  searchInput: {
    backgroundColor: '#E8F1EC',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#17352A',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 90,
  },
  empty: {
    paddingTop: 30,
    textAlign: 'center',
    color: '#5A756A',
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D5A',
    shadowColor: '#17352A',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '700',
  },
});
