import React from 'react';
import { View, Text } from 'react-native';

export default function DetailScreen({ route }) {
  const { fossil } = route.params;

  return (
    <View>
      <Text>Nombre: {fossil.name}</Text>
      <Text>Edad: {fossil.age}</Text>
      <Text>Descripción: {fossil.description}</Text>
    </View>
  );
}