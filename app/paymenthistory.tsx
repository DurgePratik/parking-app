import { useNavigation } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { db } from '../firebaseConfig';

type Payment = {
  id: string;
  spotName: string;
  amount: string;
  timestamp: string;
};

export default function PaymentHistory() {

const navigation = useNavigation();
   
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const q = query(collection(db, 'payments'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Payment[];

        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment History</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Spot: {item.spotName}</Text>
            <Text style={styles.text}>Amount: ₹{item.amount}</Text>
            <Text style={styles.text}>Date: {new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#1a1a1a',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
  },
});
