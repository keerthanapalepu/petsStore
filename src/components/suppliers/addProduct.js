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
    name : '',
    brand: '',
    category: '',
    description: '',
    pet: '',
    price: 0,
    quantity: 0,
    
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [brand, setBrand] = useState([]);
  const [category, setCategory] = useState([]);
  const [pet, setPet] = useState([]);

  useEffect(() => {
    // fetchOptions();
  }, [])
  
  const fetchOptions = async () => {
    let queryRef = query(collection(db, 'product'), orderBy('name'));
    const documentSnapshot = await getDoc(queryRef);
    await Promise.all(documentSnapshot.docs.map((doc) => {
      const product = doc.data();
      setBrand((prevProducts) =>
          prevProducts.includes(product.brand) ? prevProducts : [...prevProducts, product.brand]
        );

        setCategory((prevProducts) =>
          prevProducts.includes(product.category) ? prevProducts : [...prevProducts, product.category]
        );

        setPet((prevProducts) =>
          prevProducts.includes(product.pet) ? prevProducts : [...prevProducts, product.pet]
        );

    }))
  }
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
  return (
    <div className={`${classes.container} ${classes.scrollbar}`}>
    <Grid item xs={6} style={{ display: "flex", margin: "auto" }}>
      <form onSubmit={(e) => {}}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <TextField
          label="Brand Name"
          name="brand"
          value={formData.brand}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />

        <div style={{ display: "flex" }}>
        <TextField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <div style={{ width: "16px" }} />
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
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
            label="Pet"
            name="pet"
            value={formData.pet}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        <div style={{ width: "16px" }} />
          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>



      <div style={{display: "flex", alignItems: "center"}}>
      <Typography variant="subtitle1" color="textSecondary">
              Product Picture
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