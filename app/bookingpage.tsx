import { GOOGLE_MAPS_API_KEY } from '@env';
import polyline from '@mapbox/polyline';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
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
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(userLocation);

      await fetchNearbyParkingSpots(userLocation); // Dynamically fetch parking

      setLoading(false);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!spotId || !location) return;

      const spot = parkingSpots.find((s) => s.id === spotId);
      if (spot) {
        setSelectedSpot(spot);
        setRouteCoords([]);
        fetchDirections(location, spot);
      }
    }, [spotId, location, parkingSpots])
  );

  const fetchNearbyParkingSpots = async (loc: Coord) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${loc.latitude},${loc.longitude}&radius=5000&type=parking&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const spots: ParkingSpot[] = data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        }));
        setParkingSpots(spots);
      } else {
        console.warn('No parking spots found nearby.');
      }
    } catch (err) {
      console.error('Error fetching parking spots:', err);
    }
  };

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
        console.warn('No route found.');
      }
    } catch (err) {
      console.error('Error fetching directions:', err);
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
