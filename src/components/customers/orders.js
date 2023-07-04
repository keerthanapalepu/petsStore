import React, {useEffect, useState} from 'react';
import { Card, CardContent, Typography, CardMedia,CardActions, IconButton, Button } from '@mui/material';
import {AiFillHeart, AiFillDelete } from 'react-icons/ai';
import { makeStyles } from "@material-ui/core/styles";
import {  collection, query, orderBy, doc, startAfter, getDocs, getDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from "../../context/authContext";
import {
  getDownloadURL,
  ref,
} from "firebase/storage";
const useStyles = makeStyles({
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2px',
  },
    container: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      maxHeight: 'calc(100vh - 80px)', /* Adjust the height as needed */
    },
    cardsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      margin: '1rem 0',
      gap: '1rem',
    },
    card: {
      cursor: "pointer",
      flex: '0 0 300px',
      transition: 'box-shadow 0.3s',
      '&:hover': {
        boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.3)',
        transform: 'translateY(-2px)',
      },
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
const App = ({setActiveButton, setProductId}) => {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  useEffect( () => {
    fetchProducts();
  }, []);
  
  
  
  const fetchProducts = async () => {
    try {
      const OrdersRef = collection(db, `customer/${currentUser.uid}/Orders`);
      const q = query(OrdersRef);
      const querySnapshot = await getDocs(q);
      
      const OrdersData = await Promise.all(querySnapshot.docs.map((doc) => ({
        ...doc.data()
      })));
      const newDocs = await Promise.all(OrdersData.map(async (item) => {
        const docRef = doc(db, 'product', item.productId);
        const documentSnapshot = await getDoc(docRef);
        if (documentSnapshot.exists()) {
          const product = documentSnapshot.data();
          var imageUrl = "";
          const storageRef = ref(storage, `/productImages/brandUID/productID/productId.jpg`);
  
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
            
          return {...product, imageUrl: imageUrl};
        }
       }))
       setProducts((prevDocs) => [...prevDocs, ...newDocs]);
    } catch (error) {
      console.error('Error fetching Orders products:', error);
    }
  }
  return (
    <div  className={`${classes.container} ${classes.scrollbar}`}>
      <div className={classes.cardsContainer}>
        {products.map((product, index) => (
          <Card key={index} className={classes.card} >
            <CardMedia component="img" height="140" image={product.imageUrl} alt={product.name} onClick={() => {setActiveButton("ProductPage"); setProductId(product.uid)}}/>
            <CardContent>
              <Typography variant="h5" component="div">
              {index + 1}  { product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price: {product.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: {product.quantity}
              </Typography>
            </CardContent>
            <CardActions className={classes.actions}>
            
          </CardActions>

          </Card>
        ))}
        {/* paymnets will be implemented here */}
      </div>
    </div>
  );
};

export default App;