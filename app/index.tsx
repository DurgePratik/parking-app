 import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';




const Index = () => {
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/mainpage'), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/caricon.png')} style={styles.image} /> 
    <Text style={styles.text}>Park my car</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 5,
  },
  text: {
    fontSize: 20,
    fontStyle: 'italic',
  },
});

export default Index;