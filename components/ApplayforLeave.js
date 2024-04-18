import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Modal,
  Alert,
} from 'react-native';

import {applyForLeave, getAllLeaves} from '../../http'; // Assuming you have http functions
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

import DropDownPicker from 'react-native-dropdown-picker';
const ApplyForLeave = ({onLogout}) => {
  const {user} = useSelector(state => state.authSlice);
  const initialState = {
    title: '',
    type: '',
    appliedDate: [],
    reason: '',
  };
  const [formData, setFormData] = useState(initialState);
  const [data, setData] = useState(null); // Assuming you have data from getAllLeaves
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState({});
  const [selected, setSelected] = React.useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const format = 'MM/DD/YYYY';
  const [accessToken, setAccessToken] = useState(null);
  const inputRef = useRef(null);
  const [dates, setDates] = useState([]);
  const [leavesData, setLeavesData] = useState(null);
  const [items, setItems] = useState([
    {label: 'Sick Leave', value: 'Sick Leave'},
    {label: 'Casual Leave', value: 'Casual Leave'},
    {label: 'Annual Leave', value: 'Annual Leave'},
  ]);
  const currentDate = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  useEffect(() => {
    const fetchLeavesData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('token', token);
        setAccessToken(token);
        console.log('applayleavetoken', accessToken);
        const response = await fetch(
          'https://hrbackend.vercel.app/api/employee/view-leaves',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Leaves data:', data);
          setLeavesData(data);
        } else {
          console.error('Failed to fetch leaves data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching leaves data:', error);
      }
    };

    fetchLeavesData();
  }, []);

  const handleValueChange = itemValue => {
    setValue(itemValue);
    console.log('Selected value:', itemValue);
  };

  const handleDateSelect = date => {
    const updatedDates = {...selectedDates};

    if (updatedDates[date]) {
      delete updatedDates[date];
    } else {
      updatedDates[date] = {selected: true, selectedColor: 'blue'};
    }

    setSelectedDates(updatedDates);
  };
  const handleInputFocus = () => {
    setShowCalendar(false);
  };
  const handleApplyLeave = async () => {
    try {
      const {title, reason} = formData;
      const appliedDate = Object.keys(selectedDates);
      const type = value;

      formData['applicantID'] = user.id;
      formData['appliedDate'] = appliedDate;
      formData['type'] = type;

      const response = await fetch(
        'https://hrbackend.vercel.app/api/employee/apply-leave-application',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        },
      );
      if (!title || !type || !reason || appliedDate.length === 0) {
        throw new Error('Please fill in all required fields');
      }
      const data = await response.json();
      console.log('cccccccccccccccc', data);
      if (!response.ok) {
        if (data.data && data.data.message) {
          throw new Error(data.data.message);
        } else {
          throw new Error('Failed to apply leave');
        }
      }

      setFormData(initialState);
      setSelectedDates({});
      setShowCalendar(false);
      Alert.alert('Success', 'Leave application sent successfully');
    } catch (error) {
      if (error.message === 'Leave Already Applied') {
        Alert.alert('Error', 'Leave already applied');
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to apply leave. Please try again.',
        );
      }
    }
  };

  const handleSignOut = () => {
    onLogout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNavBar}>
        <Text style={styles.header}>Apply for Leave</Text>
        <Text style={styles.leavesDetails}>
          Consumed Leaves Details - Sick Leaves: {leavesData?.data?.sickLeaves}
          /5, Casual Leaves: {leavesData?.data?.casualLeaves}/5, Annual Leaves:{' '}
          {leavesData?.data?.annualLeaves}/15
        </Text>
      </View>

      <Text style={styles.label}>Enter Title</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={text => setFormData({...formData, title: text})}
      />
      <View style={styles.section}>
        <Text style={styles.label}>Leave Type</Text>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          onChangeValue={handleValueChange}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Applied Date</Text>
        <View>
          <Button
            title="Select Dates"
            color="lightgray"
            onPress={() => setShowCalendar(!showCalendar)}
          />
        </View>
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              style={styles.calendar}
              markedDates={selectedDates}
              minDate={thirtyDaysAgo.toISOString()} // Set minimum selectable date
              onDayPress={day => handleDateSelect(day.dateString)}
            />
          </View>
        )}
      </View>

      {/* Display selected dates as buttons */}
      <View style={styles.selectedDatesContainer}>
        {Object.keys(selectedDates).map(dateString => (
          <Button
            key={dateString}
            title={dateString}
            onPress={() => handleDateSelect(dateString)}
            style={styles.selectedDateButton}
          />
        ))}
      </View>
      <Text style={styles.label}>Enter Reason</Text>
      <TextInput
        style={styles.input}
        value={formData.reason}
        onChangeText={text => setFormData({...formData, reason: text})}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleApplyLeave}>
        <Text style={styles.submitText}>Apply Leave</Text>
      </TouchableOpacity>
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
  calendarContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    top: -310, 
    zIndex: 9999, 
    width: '90%', 
    alignSelf: 'center', 
  },
  calendar: {
    marginTop: 10,
  },
  selectedDatesContainer: {},
  closeButtonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },

  selectedDateButton: {},
  leavesDetails: {
    textAlign: 'center',
    marginBottom: 15,
    color: 'black',
  },
  closeButtonContainer: {
    position: 'absolute',
    bottom: 400, 
    left: 0,
    right: 0,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 20,
  },
  section: {
    marginBottom: 20,
    position: 'relative',
  },
  appliedate: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    backgroundColor: 'lightgray',
    color: 'black',
  },
  topNavBar: {
    height: 70,
    marginBottom: 70, 
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    color: 'black',
    marginRight: 260,
  },
  labels: {
    marginBottom: 5,
    color: 'black',
    marginRight: 260,
    backgroundColor: 'lightgray',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: 'black',
    marginTop: 10, 
  },
  submitButton: {
    backgroundColor: 'skyblue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ApplyForLeave;
