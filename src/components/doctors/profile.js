import React, { useContext, useEffect, useState } from "react";
import {TextField, Grid, Button, Typography } from '@material-ui/core';
import { collection, query, orderBy, doc, getDocs,addDoc,  getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { makeStyles } from '@material-ui/core/styles';
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  listAll,
  getBlob,
} from "firebase/storage";
import { useAuth } from "../../context/authContext";
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
const App = () => {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    specialization: '',
    description: '',
    email: '',
    location: {
      city: '',
      country: '',
      pinCode: '',
      landMark: ''
    },
    profilePic: '',
    organisation: '',
    name: '',
    yrsOfExperience: 0,
    achievements: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  
  useEffect(() => {
    getDetails();
   }, []);
   const getDetails = async () => {
    const Doctor = doc(db, `doctor`, currentUser.uid);
    const DoctorSnapshot = await getDoc(Doctor);
    setFormData(DoctorSnapshot.data());
   }
  function UNuploadAlert() {
    alert("Upload Failed!");
  }

  const uploadFiles = (file, name) => {
    if (!file) return;
    const storageRef = ref(storage, `/doctorImages/${name}.jpg`);

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
      },
      (err) => {
        console.log(err);
        UNuploadAlert();
      },
      () => {
      }
    );
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prevFormData) => ({
        ...prevFormData,
        [parent]: {
          ...prevFormData[parent],
          [child]: value? isNaN(value) ? value : Number(value) : '',
        },
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value? isNaN(value) ? value : Number(value): '',
      }));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  const Doctor = doc(db, `doctor`, currentUser.uid);
  await setDoc(Doctor, formData, {merge : true});
  if(selectedFile){
    const RT = await uploadFiles(selectedFile, currentUser.uid);
  }
}
  return (
    <div className={`${classes.container} ${classes.scrollbar}`}>
    <Grid item xs={6} style={{ display: "flex", margin: "auto" }}>
      <form onSubmit={(e) => {handleSubmit(e)}}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />

        <div style={{ display: "flex" }}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <div style={{ width: "16px" }} />
          <TextField
            label="Years of Experience"
            name="yrsOfExperience"
            type="number"
            value={formData.yrsOfExperience}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
          multiline
          minRows={4}
        />

        <div style={{ display: "flex" }}>
          <TextField
            label="City"
            name="location.city"
            value={formData.location && formData.location.city? formData.location.city : ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        <div style={{ width: "16px" }} />
          <TextField
            label="Country"
            name="location.country"
            value={formData.location && formData.location.country? formData.location.country : ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
        <div style={{ display: "flex" }}>
          <TextField
            label="PinCode"
            name="location.pinCode"
            value={formData.location && formData.location.pinCode? formData.location.pinCode : ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        <div style={{ width: "16px" }} />
          <TextField
            label="LandMark"
            name="location.landmark"
            value={formData.location && formData.location.landmark? formData.location.landmark : ''}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>


        <div style={{ display: "flex" }}>
          <TextField
            label="Organisation"
            name="organisation"
            value={formData.organisation}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        <div style={{ width: "16px" }} />
          <TextField
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>

        <TextField
          label="Achievements"
          name="achievements"
          value={formData.achievements}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
          minRows={3}
        />

        

      <div style={{display: "flex", alignItems: "center"}}>
      <Typography variant="subtitle1" color="textSecondary">
              Profile Pic
            </Typography>
            <div style={{ width: "16px" }} />
      <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(event) => {
              setSelectedFile(event.target.files[0]);
            }}
          />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span">
              Upload File
            </Button>
          </label>
          <div style={{ width: "16px" }} />
          {selectedFile && (
            <Typography variant="subtitle1" color="textSecondary">
              Selected file: {selectedFile.name}
            </Typography>
          )}
      </div>

        <Button type="submit" variant="contained" style={{ display: 'flex', float: "right", background: "black", color: "white" }} >
          { "UPDATE"}
        </Button>
      </form>
    </Grid>
    </div>
  );
};

export default App;