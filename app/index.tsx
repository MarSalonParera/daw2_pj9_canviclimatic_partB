import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fossil App 🦴</Text>

      <Button title="Ver fósiles" onPress={() => router.push('/list')} />
      <Button title="Añadir fósil" onPress={() => router.push('/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});