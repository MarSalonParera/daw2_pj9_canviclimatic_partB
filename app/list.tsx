import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getFossils } from '../database/db';

export default function ListScreen() {
  const [fossils, setFossils] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadFossils();
  }, []);

  const loadFossils = async () => {
    const data = await getFossils();
    setFossils(data);
  };

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={fossils}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/detail', params: { fossil: JSON.stringify(item) } })
            }
          >
            <Text style={{ fontSize: 18, padding: 10 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}