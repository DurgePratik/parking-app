import { GOOGLE_MAPS_API_KEY } from '@env';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

type Coord = {
  latitude: number;
  longitude: number;
};

type ParkingSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function BookingPage() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const spotId = params.spotId as string;

  const [location, setLocation] = useState<Coord | null>(null);
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);

  const parkingSpots: ParkingSpot[] = [
    { id: '1', name: 'Parking Lot Mumbai', latitude: 19.076, longitude: 72.8777 },
    { id: '2', name: 'Parking Lot Delhi', latitude: 28.7041, longitude: 77.1025 },
    { id: '3', name: 'Parking Lot Bengaluru', latitude: 12.9716, longitude: 77.5946 },
    { id: '4', name: 'Parking Lot Chennai', latitude: 13.0827, longitude: 80.2707 },
    { id: '5', name: 'Parking Lot Pune', latitude: 18.5204, longitude: 73.8567 },
    { id: '6', name: 'Parking Lot Nagpur', latitude: 21.1458, longitude: 79.0882 },
    { id: '7', name: 'Parking Lot Nashik', latitude: 19.9975, longitude: 73.7898 },
    { id: '8', name: 'Parking Lot Aurangabad', latitude: 19.8762, longitude: 75.3433 },
    { id: '9', name: 'Parking Lot Solapur', latitude: 17.6599, longitude: 75.9064 },
    { id: '10', name: 'Parking Lot Thane', latitude: 19.2183, longitude: 72.9781 },
    { id: '11', name: 'Parking Lot Kolhapur', latitude: 16.705, longitude: 74.2433 },
    { id: '12', name: 'Parking Lot Ahmednagar', latitude: 19.0952, longitude: 74.7496 },
    { id: '13', name: 'Parking Lot Latur', latitude: 18.4066, longitude: 76.5602 },
    { id: '14', name: 'Parking Lot Amravati', latitude: 20.9333, longitude: 77.75 },
    { id: '15', name: 'Parking Lot Guwahati', latitude: 26.1445, longitude: 91.7362 },
    { id: '16', name: 'Parking Lot Shillong', latitude: 25.5788, longitude: 91.8933 },
    { id: '17', name: 'Parking Lot Itanagar', latitude: 27.0844, longitude: 93.6053 },
    { id: '18', name: 'Parking Lot Agartala', latitude: 23.8315, longitude: 91.2868 },
    { id: '19', name: 'Parking Lot Gangtok', latitude: 27.3314, longitude: 88.613 },
    { id: '20', name: 'Parking Lot Dibrugarh', latitude: 27.4728, longitude: 94.9114 },
    { id: '21', name: 'Parking Lot Silchar', latitude: 24.8339, longitude: 92.7780 },
  ];

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission denied');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(userLocation);

      if (spotId) {
        const spot = parkingSpots.find((s) => s.id === spotId);
        if (spot) {
          setSelectedSpot(spot);
          await fetchDirections(userLocation, spot);  
        }
      }

      setLoading(false);
    })();
  }, [spotId]);

  const fetchDirections = async (origin: Coord, destination: Coord) => {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes.length > 0) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]: number[]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);  
      } else {
        console.warn('No route found');
      }
    } catch (err) {
      console.error('Failed to fetch route:', err);
    }
  };

  const handleSpotPress = (spot: ParkingSpot) => {
    if (!location) return;
    Alert.alert(
      'Confirm Booking',
      `Book a spot at ${spot.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book',
          onPress: () => {
            router.push({
              pathname: '/payment',
              params: {
                spotId: spot.id,
                spotName: spot.name,
                amount: '50',
              },
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading || !location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00BFA6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.name}
            pinColor={selectedSpot?.id === spot.id ? 'blue' : 'green'}
            onPress={() => handleSpotPress(spot)}
          />
        ))}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
