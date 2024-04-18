import React, {useState} from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setAuth} from '../store/auth-slice';
import {useDispatch} from 'react-redux';
const LoginForm = ({onLoginSuccess}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputEvent = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSubmit = async () => {
    const {email, password} = formData;
    if (!email || !password) {
    
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        'https://hrbackend.vercel.app/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();
      console.log('dddd' + JSON.stringify(data));
      setLoading(false);
      if (data.success == true) {
        Alert.alert('Success', 'Login successful');
        dispatch(setAuth(data.user));
        onLoginSuccess();
        await AsyncStorage.setItem('userResponse', JSON.stringify(data.user));
        await AsyncStorage.setItem('accessToken', data.token);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);

        console.log(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error logging in login :', error);
      setError('Error', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://www.pockethrms.com/wp-content/uploads/2022/01/Happy-Workforce.jpg',
        }}
        style={styles.logo}
      />
      <Text style={styles.title}>Login</Text>
      <Text style={styles.labels}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={text => inputEvent('email', text)}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={text => inputEvent('password', text)}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Login'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'black', 
  },
  input: {
    width: '80%',
    height: 50,
    borderRadius:10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white', // Set input background color to black
    color: 'black', // Set input text color to white
  },
  button: {
    backgroundColor: 'skyblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  label: {
    marginBottom: 5,
    color: 'black', 
    marginRight:260
  },
  labels: {
    marginBottom: 5,
    color: 'black', 
    marginRight:290
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
});

export default LoginForm;
