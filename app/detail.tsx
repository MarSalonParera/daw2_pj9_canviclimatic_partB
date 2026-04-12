import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DetailScreen() {
  const { fossil } = useLocalSearchParams();

  const parsedFossil = fossil ? JSON.parse(fossil as string) : null;

  if (!parsedFossil) return <Text>No hay datos</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>{parsedFossil.name}</Text>
      <Text>Edad: {parsedFossil.age}</Text>
      <Text>Descripción: {parsedFossil.description}</Text>
    </View>
  );
}