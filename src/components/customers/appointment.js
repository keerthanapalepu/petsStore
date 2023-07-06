import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
} from '@material-ui/core';
import { collection, query, orderBy, doc, getDocs,addDoc,  getDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from "../../context/authContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const useStyles = makeStyles({

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
});

const Appointments = () => {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {

    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setAppointments([]);
    try {
      const AppointmentRef = collection(db, `customer/${currentUser.uid}/Appointment`);
      const q = query(AppointmentRef, orderBy("status"));
      const querySnapshot = await getDocs(q);
      
      const AppointmentData = await Promise.all(querySnapshot.docs.map((doc) => ({
        ...doc.data()
      })));
      const newDocs = await Promise.all(AppointmentData.map(async (item) => {
        const docRef = doc(db, 'doctor', item.doctorId);
        const documentSnapshot = await getDoc(docRef);
        if (documentSnapshot.exists()) {
          return {...item, doctorName: documentSnapshot.data().name, phoneNumber: documentSnapshot.data().phoneNumber};
        }
       }))
       setAppointments((prevDocs) => [...prevDocs, ...newDocs]);
    } catch (error) {
      console.error('Error fetching Appointment ', error);
    }
  }

  const handleCancelAppointment = async (appointmentId, selectedDate, start, doctorId) => {
    const DoctorRef = doc(db, `doctor/${doctorId}/Appointment`, selectedDate);
    const documentSnapshot = await getDoc(DoctorRef);
    let arrayData = documentSnapshot.data()[`${currentUser.uid}_${start}`];
    let fee =  (arrayData[1] - arrayData[0]) * 200;
    try {
      const updated = {
        [`${currentUser.uid}_${start}`] : [arrayData[0], arrayData[1], "cancelled", fee, appointmentId],
        dayFee :  documentSnapshot.data().dayFee - fee
      };
      
      await setDoc(DoctorRef, updated, {merge : true});
    } catch (error) {
      console.error('Error updating appointment:', error);
    }


    const Doctor = doc(db, `doctor`, doctorId);
    const DoctorSnapshot = await getDoc(Doctor);
    let totalFee =  DoctorSnapshot.data().totalFee;
    let activeAppointments =  DoctorSnapshot.data().activeAppointments;
    try {
      const updated = {
        activeAppointments: activeAppointments - 1,
        totalFee : totalFee - fee
      };
      
      await setDoc(Doctor, updated, {merge : true});
    } catch (error) {
      console.error('Error updating doctor:', error);
    }

    const refundRef = doc(db, `refund`, appointmentId);
    try {
      const updated = {
        uid : appointmentId,
        customer: currentUser.uid,
        doctor: doctorId,
        refundAmount: fee
      };
      
      await setDoc(refundRef, updated, {merge : true});
    } catch (error) {
      console.error('Error updating refund:', error);
    }

    const currentUserDetails = doc(db, `customer/${currentUser.uid}/Appointment`, appointmentId);
    try {
      const updated = {
        status: "cancelled",
      };
      
      await setDoc(currentUserDetails, updated, {merge : true});
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
    fetchAppointments();
  };

  return (
    <div className={`${classes.container} ${classes.scrollbar}`}>
      <Typography variant="h4" component="h1" align="center">
        Appointments with Doctor
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Doctor Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Time Range</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.uid}>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.doctorName}</TableCell>
                <TableCell>{appointment.phoneNumber}</TableCell>
                <TableCell>{`${Math.floor(appointment.timeRange[0])}:${String(appointment.timeRange[0] % 1 * 60).padStart(2, '0')} ${
                  appointment.timeRange[0] < 9 || appointment.timeRange[0] === 12 ? 'pm' : 'am'
                              } - ${Math.floor(appointment.timeRange[1])}:${String(appointment.timeRange[1] % 1 * 60).padStart(2, '0')} ${
                                appointment.timeRange[1] < 9 || appointment.timeRange[1] === 12 ? 'pm' : 'am'
                              }`}</TableCell>
                <TableCell>{appointment.paid}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={!(appointment.status === "active")}
                    onClick={() => handleCancelAppointment(appointment.uid, appointment.date, appointment.timeRange[0], appointment.doctorId)}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Appointments;
