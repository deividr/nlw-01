import React, { useEffect, useState } from 'react';
import { AppLoading } from 'expo';
import * as MailComposer from 'expo-mail-composer';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import api from '../../services/api';

interface Params {
  point_id: number;
}

interface PointItems {
  point: {
    id: number;
    image: string;
    name: string;
    email: string;
    whatsapp: number;
    city: string;
    uf: string;
  };
  items: {
    title: string;
  }[];
}

const Detail = () => {
  const [pointItems, setPointItems] = useState<PointItems>({
    point: {
      id: 0,
      image: '',
      name: '',
      email: '',
      whatsapp: 0,
      city: '',
      uf: '',
    },
    items: [
      {
        title: '',
      },
    ],
  });

  const navigation = useNavigation();

  const params = useRoute().params as Params;

  useEffect(() => {
    api.get(`points/${params.point_id}`).then((response) => {
      setPointItems(response.data);
    });
  }, []);

  const handleNavigateBack = () => {
    navigation.goBack();
  };

  const handleMailComposer = () => {
    MailComposer.composeAsync({
      subject: 'Interessado na coleta de resíduos.',
      recipients: [pointItems.point.email],
    });
  };

  const handleSendMessageWhatsapp = () => {
    Linking.openURL(
      `whatsapp://send?phone=${pointItems.point.whatsapp}&text=Estou interessado no ponto de coleta!`
    );
  };

  if (!pointItems.point.image) {
    return <AppLoading />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name='arrow-left' size={20} color='#34cb79' />
        </TouchableOpacity>

        <Image
          style={styles.pointImage}
          source={{ uri: pointItems.point.image }}
        />

        <Text style={styles.pointName}>{pointItems.point.name}</Text>

        <Text style={styles.pointItems}>
          {pointItems.items.map((item) => item.title).join(', ')}
        </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>
            {pointItems.point.city}, {pointItems.point.uf}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleSendMessageWhatsapp}>
          <FontAwesome name='whatsapp' size={20} color='#fff' />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleMailComposer}>
          <Icon name='mail' size={20} color='#fff' />
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80',
  },

  address: {
    marginTop: 32,
  },

  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80',
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});

export default Detail;
