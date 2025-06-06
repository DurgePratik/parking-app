import { useNavigation, useRouter } from 'expo-router'; // <-- Use this
import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

  

export default function MainPage() {
  const router = useRouter(); 

 const navigation = useNavigation();
   
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleBooking = () => {
    router.push('/bookingpage');  
  };

  const handleHistory =() => {
        router.push('/paymenthistory');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Park My Car</Text>
      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Book a Parking Spot</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleHistory}>
        <Text style={styles.buttonText}>View Parking history</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#00BFA6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
