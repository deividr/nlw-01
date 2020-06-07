import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Image, Text, StyleSheet, ImageBackground } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import axios from 'axios';

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

interface PickerItem {
  label: string;
  value: string;
}

const Home = () => {
  const [ufs, setUfs] = useState<PickerItem[]>([
    {
      label: '',
      value: '',
    },
  ]);

  const [cities, setCities] = useState<PickerItem[]>([
    {
      label: '',
      value: '',
    },
  ]);

  const [selectedUf, setSelectedUf] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const navigation = useNavigation();

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then((response) => {
        const ufsInitials = response.data.map((uf) => ({
          label: uf.sigla,
          value: uf.sigla,
        }));
        setUfs(ufsInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') return;

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityInitials = response.data.map((city) => ({
          label: city.nome,
          value: city.nome,
        }));
        setCities(cityInitials);
      });
  }, [selectedUf]);

  const handleSelectUf = (value: string) => {
    setSelectedUf(value);
  };

  const handleSelectCity = (value: string) => {
    setSelectedCity(value);
  };

  const handleNavigationToPoints = () => {
    navigation.navigate('Points', { uf: selectedUf, city: selectedCity });
  };

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu market place de coleta de resíduos</Text>
        <Text style={styles.description}>
          Ajudamos as pessoas encontrarem pontos de coletas de forma eficientes
        </Text>
      </View>

      <View>
        <RNPickerSelect
          placeholder={{
            label: 'Selecione um estado',
            value: null,
            color: '#ccc',
          }}
          items={ufs}
          onValueChange={handleSelectUf}
          style={pickerStyles}
          useNativeAndroidPickerStyle={false}
        />

        <RNPickerSelect
          placeholder={{
            label: 'Selecione uma cidade',
            value: null,
            color: '#ccc',
          }}
          items={cities}
          onValueChange={handleSelectCity}
          style={pickerStyles}
          useNativeAndroidPickerStyle={false}
        />
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigationToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name='arrow-right' color='#fff' size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

const pickerStyles = StyleSheet.create({
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  inputIOS: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },
});

export default Home;
