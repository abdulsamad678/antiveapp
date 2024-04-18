import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Button,
  Modal,
  Alert,
  Header,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
const getColorByLeaveType = (leaveType, index) => {
  switch (leaveType.toLowerCase()) {
    case 'sick leave':
      return '#87CEEB'; // Yellow for sick leave
    case 'casual leave':
      return '#a8df8e'; // Orange for casual leave
    case 'annual leave':
      return '#FFA07A'; // Green for annual leave
    default:
      return colors[index % colors.length]; // Default color if leave type is not recognized
  }
};

const ViewleaveApplication = ({onLogout}) => {
  const {user} = useSelector(state => state.authSlice);
  console.log('user22222222', user);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  useEffect(() => {
    const obj = {
      applicantID: user.id,
    };
    const fetchLeavesData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('token', obj);
        setAccessToken(token);
        console.log('applayleavetoken');
        const response = await fetch(
          'https://hrbackend.vercel.app/api/employee/view-leave-applications',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(obj),
          },
        );
        console.log('res' + JSON.stringify(response));

        const data = await response.json();

        if (data.success == true) {
          setLeaveApplications(data.data);
          console.log('leaveApplications' + JSON.stringify(leaveApplications));
        } else {
          if (response.status === 401) {
            Alert.alert('Unauthorized', 'Please log in again');
          } else {
            Alert.alert(
              'Failed to fetch leave applications',
              'Please try again later',
            );
          }
        }
      } catch (error) {
        console.error('Error fetching leaves data:', error);
      }
    };

    fetchLeavesData();
  }, []);
  const handleSignOut = () => {
    onLogout();
  };
  const getColor = index => {
    const colors = ['#FFC0CB', '#87CEEB', '#98FB98', '#FFD700', '#FFA07A']; // Example colors, you can add more
    return colors[index % colors.length];
  };
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Leave Application Status</Text>
      </View>
      <FlatList
        data={leaveApplications}
        keyExtractor={item => item._id}
        
        renderItem={({item, index}) => (
          
          <View
            style={[styles.itemContainer, {backgroundColor: getColorByLeaveType(item.type, index) }]}>
            {/* <Text style={styles.itemTexts}>Title: {item.title}</Text> */}
            <Text style={styles.itemTexts}>{item.type}</Text>
            <Text style={styles.itemText}> {item.reason}</Text>
            <Text style={styles.itemText}>
              appliedDate: {item.appliedDate.join(', ')}
            </Text>
            {!(
              user.type === 'Leader' && user.roleType === 'Line 2 Manager'
            ) && (
              <>
                {item.adminResponse !== 'Pending' ? (
                  <Text style={styles.itemTextlead}>
                    Lead: {item.leadReason ? item.leadReason : 'No Reason'}
                  </Text>
                ) : (
                  <Text style={styles.itemTextlead}>
                    Lead: Not yet responded
                  </Text>
                )}
              </>
            )}

            {item.hrResponse !== 'Pending' ? (
              <Text style={styles.itemTexthr}>
                Hr :{item.hrReason ? item.hrReason : 'No Reason'}
              </Text>
            ) : (
              <Text style={styles.itemTexthr}>Hr : Not yet responded</Text>
            )}

            <Text style={[styles.statusContainer, {color: 'black'}]}>
              <Text
                style={[
                  styles.itemTextstatus,

                  item.hrResponse === 'Pending'
                    ? {color: 'blue'}
                    : item.hrResponse === 'Rejected'
                    ? {color: 'red'}
                    : item.hrResponse === 'Approved'
                    ? {color: 'green'}
                    : null,
                ]}>
                {item.hrResponse}
              </Text>
            </Text>
          </View>
        )}
      />
      {leaveApplications.length === 0 && (
        <Text style={styles.noDataText}>No leave applications found</Text>
      )}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  headerContainer: {
    // backgroundColor: '#E0B0FF',
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: '100%',
    height: 'auto',
    marginBottom: 20,
  },
  logo: {
    position: 'absolute',
    left: -45,
  },
  itemText: {
    color: 'black',
    fontSize: 17,
    bottom: 14,
  },
 
  itemTextlead: {
    flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'lightgray',
  borderRadius: 10,
  borderColor: 'black', // Add this line to set the border color
  borderWidth: 1, // Add this line to set the border width
  paddingHorizontal: 10,
  paddingVertical: 5,
  marginTop: 20,
  marginBottom: 5,
  fontSize: 12,
  color: 'black',
  },
  itemTexthr: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: 'lightgray',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 5, // Adjust the marginTop as needed
    fontSize: 12,
    color: 'black',
  },

  statusContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7F7F',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  itemTextstatus: {
    color: 'black',
  },
  itemTexts: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 15,
    bottom: 14,
  },

  itemContainer: {
    padding: 25, // Increase the padding to increase the size
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    marginBottom: 20, // You might need to adjust this margin as well
    backgroundColor: 'skyblue',
  },

  header: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 40,

    color: 'black',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default ViewleaveApplication;
