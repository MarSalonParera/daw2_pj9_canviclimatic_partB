import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { addFossil } from '../database/db';

export default function AddScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    await addFossil({ name, age, description });
    navigation.navigate('List');
  };

  return (
    <View>
      <TextInput placeholder="Nombre" onChangeText={setName} />
      <TextInput placeholder="Edad" onChangeText={setAge} />
      <TextInput placeholder="Descripción" onChangeText={setDescription} />
      <Button title="Guardar" onPress={handleAdd} />
    </View>
  );
}
