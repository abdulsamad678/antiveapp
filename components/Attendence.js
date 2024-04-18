import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Geolocation from '@react-native-community/geolocation';
const Attendence = ({onLogout}) => {
  const {user} = useSelector(state => state.authSlice);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  console.log('accessToken1', accessToken);
  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        setAccessToken(token);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    getAccessToken();
  }, []);
  const markAttendance = async () => {
    console.log('Check-in button pressed');
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app requires access to your location.',
          buttonPositive: 'OK',
        },
      );
      console.log('Check-in button pressed1', granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async position => {
            console.log('Latitude:', position.coords.latitude);
            console.log('Longitude:', position.coords.longitude);
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log('Check-in button pressed22');
            // Use a reverse geocoding service to get address from latitude and longitude
            const address = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyD1OziPhyoc20nI5jTvZHvElMw3SMmFWmA`,
            )
              .then(response => response.json())
              .catch(error => {
                console.error('Error fetching address:', error);
                return null;
              });
            console.log('Check-in button pressed2', address);
            console.log('Check-in button pressed33');
            const now = new Date();
            const offset = now.getTimezoneOffset();
            const localTimestamp = new Date(now.getTime() - offset * 60 * 1000);
            console.log('Check-in button pressed50');
            const formattedLocalTimestamp = localTimestamp
              .toISOString()
              .slice(0, 19)
              .replace('T', ' ');
            const response = await fetch(
              'https://hrbackend.vercel.app/api/employee/mark-employee-attendance',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  employeeID: user.id,
                  timestamp: formattedLocalTimestamp,
                  latitude: latitude,
                  longitude: longitude,
                  address: address,
                }),
              },
            );
            console.log('body' + JSON.stringify(body));

            const data = await response.json();
            console.log('attendence' + JSON.parse(JSON.stringify(data)));
            if (data.success == true) {
              Alert.alert('Success', 'Attendence Marked Sucessfully');

              console.log('data', data);
            } else {
              // Handle unsuccessful login
              Alert.alert(data.message);
            }
          },
          error => {
            const errorMessage = `Error getting location: ${error.message}`;
            console.error(errorMessage);
            Alert.alert('Error', errorMessage, [{text: 'OK'}]);
            setError('Error getting location. Please try again.');
          },
          {enableHighAccuracy: true, timeout: 30000, maximumAge: 10000},
        );
      } else {
        console.log('Location permission denied');
        // Handle the case where the user denies permission
        Alert.alert(
          'Location Permission Denied',
          'This app requires access to your location to mark attendance. Please enable location permissions in your device settings.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Error logging in attendece:', error);
      setError('Error', error);
    }
  };

  const markClockOut = async () => {
    console.log('Check-out button pressed');
    try {
      const currentTimestamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      const response = await fetch(
        'https://hrbackend.vercel.app/api/employee/mark-clockout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            employeeID: user.id,
            clockout: new Date(currentTimestamp),
          }),
        },
      );
      const data = await response.json();
      console.log('attendence' + JSON.stringify(data));
      if (data.success == true) {
        Alert.alert('Success', 'Successfully Clockout');

        console.log('data', data);
      } else {
        // Handle unsuccessful login
        Alert.alert(data.message);
      }
    } catch (error) {
      console.error('Error logging in attendece:', error);
      setError('Error', error);
    }
  };
  const handleSignOut = () => {
    onLogout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNavBar}>
        <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
        <Text style={styles.title}>Mark Your Attendance</Text>
      </View>
      <View style={styles.card}>
        <ImageBackground
          source={{
            uri: 'https://www.pockethrms.com/wp-content/uploads/2022/01/Happy-Workforce.jpg',
          }}
          style={styles.background}></ImageBackground>
        <TouchableOpacity style={styles.checkButton} onPress={markAttendance}>
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>
        {/* {error && <Text style={styles.error}>{error}</Text>} */}

        <TouchableOpacity style={styles.checkOUTButton} onPress={markClockOut}>
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  topNavBar: {
    backgroundColor: 'skyblue', // Adjust color as needed
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  background: {
    width: 200,
    height: 200,
    marginBottom: 50,
    marginLeft: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 15,
    marginBottom: 20,
    color: '#333',
  },
  checkButton: {
    backgroundColor: 'skyblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 120,
    marginBottom: 20,
  },
  checkOUTButton: {
    backgroundColor: 'skyblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 120,
    marginBottom: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 120,
    paddingBottom: 100,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
});
export default Attendence;
