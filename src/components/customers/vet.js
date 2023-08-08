import React, { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Button, TextField, Typography, Container } from '@mui/material';
import { collection, query, orderBy, doc, getDocs,addDoc,  getDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, storage, httpsCallable, functions } from '../../services/firebase';
import { makeStyles } from "@material-ui/core/styles";
import { useAuth } from "../../context/authContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  getDownloadURL,
  ref,
} from "firebase/storage";

const useStyles = makeStyles((theme) => ({
  container: {
    maxHeight: 'calc(100vh - 80px)',
    overflowY: 'auto',
  },
  scrollbar: {
    scrollbarWidth: 'thin',
    scrollbarColor: 'transparent transparent', /* Set the desired color */
    '&::-webkit-scrollbar': {
      width: '8px', /* Adjust the width as needed */
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  },
  container2: {
    background: '',
    textAlign: 'center',
    width: "50%",
    padding: '5px'
  },
  heading: {
    color: "black",
    marginBottom: theme.spacing(2),
  },
  timeRange: {
    fontSize: '1rem',
    marginBottom: theme.spacing(1),
  },
}));

function DoctorCards() {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDates, setSelectedDates] = useState(new Map());
  const [reservedDates, setReservedDates] = useState(new Map());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const times = [];
  for (let i = 0; i < 12; i++) {
    times.push(`${i}:00`);
    times.push(`${i}:30`);
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISOString = tomorrow.toISOString().split('T')[0];

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
    console.log(event.target.value)
  };

  const handleEndTimeChange = (event) => {
    setEndTime(event.target.value);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      let queryRef = query(collection(db, 'doctor'), orderBy('name'));
      const snapshot = await getDocs(queryRef);
      const doctorList = [];

      await Promise.all(snapshot.docs.map(async (document) => {
        const doctorData = document.data();
        var imageUrl = "";
        const storageRef = ref(storage, `/doctorImages/${document.id}.jpg`);

        try {
          const url = await getDownloadURL(storageRef);
          imageUrl = url;
        } catch (error) {
          switch (error.code) {
            case "storage/object-not-found":
              console.log("File doesn't exist");
              imageUrl = "";
              break;
            default:
              imageUrl = "";
              break;
          }
        }

        doctorList.push({ ...doctorData, imageUrl: imageUrl });
      }));

      setDoctors((prevProducts) => [...prevProducts, ...doctorList]);

    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDateChange = async (value, doctorId) => {
    let  allSlots =  [[1 , 6], [9, 12]];
    const newSelectedDates = new Map(selectedDates);
    newSelectedDates.set(doctorId, value);
    setSelectedDates(newSelectedDates);
    console.log(value)
    const appointmentRef = doc(db, `doctor/${doctorId}/Appointment`, value);
    const documentSnapshot = await getDoc(appointmentRef);
        if (documentSnapshot.exists()) {
          const obj = {...documentSnapshot.data()};
          const arrays = Object.values(obj).map(array => Array.isArray(array) ? array : []);
          arrays.sort((a, b) => a[0] - b[0]);
          console.log(arrays);
          allSlots = fetchSlots(arrays);

        }
        const newReservedTime = new Map(reservedDates);
        newReservedTime.set(doctorId, allSlots);
        setReservedDates(newReservedTime);
        console.log(newReservedTime);
  };


  const fetchSlots =  (reservedSlots) => {
    const allSlots = [[1 , 6], [9, 12]]

    reservedSlots.map((Rslot) => {
      const [Rstart, Rend, status, fee, id] = Rslot;
      if(status === "active" || status === "unavaliable"){
        for (let index = 0; index < allSlots.length; index++) {
          const [Astart, Aend] = allSlots[index];
          if (Aend >= Rend) {
            console.log('hello');
            allSlots.splice(index, 1);
            if (Aend !== Rend) {
              allSlots.splice(index, 0, [Rend, Aend]);
            }
            if (Astart !== Rstart) {
              allSlots.splice(index, 0, [Astart, Rstart]);
            }
            break;
          }
        }
      }
      

    })
    allSlots.sort((a, b) => b[0] - a[0]);
    console.log(allSlots);
    return allSlots;
  };
  const convertTimeToFloat = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) + parseInt(minutes) / 60;
  };

  const checkTimings = (doctorId) => {
    const startFloat = convertTimeToFloat(startTime);
    const endFloat = convertTimeToFloat(endTime);
    const intervals = reservedDates.get(doctorId);
    if(startFloat >= endFloat){
      toast.error("select valid time");
    }
    else{
      for(var i = 0; i < intervals.length; i ++ ){
        const [Astart, Aend] = intervals[i];
        if(Astart <= startFloat && Aend >=  endFloat) {
          handleAppointmentBooking(startFloat, endFloat, doctorId);
          
          break;
        }
        if(i === intervals.length -1 ){
          toast.error("select valid time");
        }
      }
    }
  }
 
const initPayment = (data) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: "rzp_test_i10pSJmi7llEqT",
      amount: data.amount,
      currency: data.currency,
      name: "Book Appointment",
      description: "Test Transaction",
      order_id: data.id,
      handler: async (response) => {
        try {
          const verifyPayment = httpsCallable(functions, 'paymentVerification');
          await verifyPayment(response);
          console.log(response); // Payment was successful
          resolve();
        } catch (error) {
          console.error('Error:', error);
          reject(error);
        }
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  });
};

const handlePayment = async (fee) => {
  try {
    const createOrder = httpsCallable(functions, 'createOrder');
    const response = await createOrder({ amount: fee });
    await initPayment(response.data.data);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const handleAppointmentBooking = async (start, end, doctorId) => {
  const selectedDate = selectedDates.get(doctorId);
  const DoctorRef = doc(db, `doctor/${doctorId}/Appointment`, selectedDate);
  const documentSnapshot = await getDoc(DoctorRef);
  let dayFee = documentSnapshot.exists() ? documentSnapshot.data().dayFee : 0;
  let fee = dayFee + (end - start) * 200;

  try {
    await handlePayment((end - start) * 200); // Payment is processed here

    const Doctor = doc(db, `doctor`, doctorId);
    const DoctorSnapshot = await getDoc(Doctor);
    let totalFee = DoctorSnapshot.data().totalFee ? DoctorSnapshot.data().totalFee : 0;
    let activeAppointments = DoctorSnapshot.data().activeAppointments ? DoctorSnapshot.data().activeAppointments : 0;

    const updatedDoctorData = {
      activeAppointments: activeAppointments + 1,
      totalFee: totalFee + (end - start) * 200,
    };

    await setDoc(Doctor, updatedDoctorData, { merge: true });

    const currentUserDetails = doc(db, "customer", currentUser.uid);

    const newAppointmentData = {
      timeRange: [start, end],
      paid: (end - start) * 200,
      doctorId: doctorId,
      date: selectedDate,
      status: "active",
      uid: "",
    };

    const userAppRef = await addDoc(collection(currentUserDetails, "Appointment"), newAppointmentData);
    const Ref = doc(db, `customer/${currentUser.uid}/Appointment`, userAppRef.id);
    await setDoc(Ref, { uid: userAppRef.id }, { merge: true });

    const updatedDoctorAppointmentData = {
      [`${currentUser.uid}_${start}`]: [start, end, "active", (end - start) * 200, userAppRef.id],
      dayFee: fee,
      date: selectedDate,
    };

    await setDoc(DoctorRef, updatedDoctorAppointmentData, { merge: true });

    handleDateChange(selectedDates.get(doctorId), doctorId);
  } catch (error) {
    console.error('Error handling appointment booking:', error);
  }
};


  return (
    <Container className={`${classes.container} ${classes.scrollbar}`}>
      <Grid container spacing={1}>
        {doctors.map((doctor) => (
          <Grid item xs={12} sm={12} md={12} key={doctor.uid}>
            <Card style={{ marginBottom: '20px' }}>
              <CardContent>
                <div style={{ display: 'flex' }}>
                  <div>
                    <img
                      src={doctor.imageUrl}
                      alt="Doctor"
                      style={{ height: '200px', width: '180px' }}
                    />
                  </div>
                  <div style={{ marginLeft: '20px' }}>
                    <Typography variant="h6">{doctor.name}</Typography>
                    <Typography variant="body1">Email: {doctor.email}</Typography>
                    <Typography variant="body1">Phone: {doctor.phoneNumber}</Typography>
                  </div>
                  <div className={classes.container2}>
                  {reservedDates.get(doctor.uid) && (<Typography variant="h4" className={classes.heading}>
                  Available timings
                      </Typography>)}
                      {reservedDates.get(doctor.uid) &&
                        reservedDates.get(doctor.uid).map((range, index) => (
                          <Typography
                            key={index}
                            variant="body1"
                            className={classes.timeRange}
                          >
                            {`${Math.floor(range[0])}:${String(range[0] % 1 * 60).padStart(2, '0')} ${
                                range[0] < 9 || range[0] === 12 ? 'pm' : 'am'
                              } - ${Math.floor(range[1])}:${String(range[1] % 1 * 60).padStart(2, '0')} ${
                                range[1] < 9 || range[1] === 12 ? 'pm' : 'am'
                              }`}
                          </Typography>
                        ))}

                        {reservedDates.get(doctor.uid)  && (<><div>
                            <label>
                              Start Time:
                              <select value={startTime} onChange={e => handleStartTimeChange(e)}>
                                {times.map(time => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              End Time:
                              <select value={endTime} onChange={e => setEndTime(e.target.value)}>
                                {times.map(time => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <div style={{ marginTop: '20px' }}>
                          <Button variant="contained" color="primary" onClick={() => checkTimings(doctor.uid)}>
                            Book Appointment
                          </Button>
                        </div>
                          </>
                          )}
                    </div>
                </div>
                <div style={{ marginTop: '20px', display: "flex", alignItems: "center" }}>
                  <Typography variant="h6">Check availability</Typography>
                  <div style={{width : "30px"}}/>
                  <TextField
                    required
                    label="Date"
                    type="date"
                    value={selectedDates.get(doctor.uid) || ''}
                    onChange={(event) => handleDateChange(event.target.value, doctor.uid)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: tomorrowISOString,
                    }}
                  />
                </div>
                
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default DoctorCards;
