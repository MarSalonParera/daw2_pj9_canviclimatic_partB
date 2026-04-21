import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

export default function ListScreen() {
  const [data, setData] = useState([
    { id: '1', nombre: 'Carbón', co2: '2.5' },
    { id: '2', nombre: 'Petróleo', co2: '2.0' },
    { id: '3', nombre: 'Gas Natural', co2: '1.5' }
  ]);

  return (
    <View style={{ flex:1 }}>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text>{item.nombre} - CO2: {item.co2}</Text>
        )}
      />
    </View>
  );
}