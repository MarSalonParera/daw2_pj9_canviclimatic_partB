import { Button, Text, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text>Quema de combustibles fósiles</Text>
      <Text>Genera CO2 y contamina el planeta</Text>

      <Button 
        title="Ver datos"
        onPress={() => navigation.navigate('Lista')}
      />
    </View>
  );
}