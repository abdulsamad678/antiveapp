/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import React, { useState } from 'react';
import LoginForm from './components/Login';
import ApplyForLeave from './components/ApplayforLeave';
import Attendence from './components/Attendence';
import ViewleaveApplication from './components/ViewleaveApplication';
import {Provider} from 'react-redux';
import store from './store/index';
type SectionProps = PropsWithChildren<{
  title: string;
}>;


function App(): React.JSX.Element {
  const [loggedIn, setLoggedIn] = useState(false);
  const handleLoginSuccess = () => {
    setLoggedIn(true); 
  };
  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <Provider store={store}>
    <View style={{ flex: 1 }}>
      {loggedIn ? (
       <ApplyForLeave onLogout={handleLogout} />
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </View>
    </Provider>
);
  }
export default App;
