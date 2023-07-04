import React, {useEffect, useState} from 'react';
import { Card, CardContent, Typography, CardMedia,CardActions, IconButton, Button } from '@mui/material';
import { AiFillDelete } from 'react-icons/ai';
import { makeStyles } from "@material-ui/core/styles";
import {  collection, query, orderBy, doc, startAfter, getDocs, getDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from "../../context/authContext";
import {HiShoppingCart} from 'react-icons/hi';
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
  
  
  
  const handleFav = async( index, productId) => {
    const updatedItems = [...products];
  updatedItems.splice(index, 1);
  setProducts([...updatedItems]);
  const FavouriteRef = doc(db, `customer/${currentUser.uid}/Favourite`, productId);
  try {
    await deleteDoc(FavouriteRef);
  } catch (error) {
    console.error('Error deleting Favourite:', error);
  }

  }
  const handleCart = async(cart, index, productId) => {
    const updatedItems = [...products];
  updatedItems[index].cart = !cart;
  setProducts([...updatedItems]);
  const CartRef = doc(db, `customer/${currentUser.uid}/Cart`, productId);
  if(cart){
    try {
      await deleteDoc(CartRef);
    } catch (error) {
      console.error('Error deleting Cart:', error);
    }
  }
  else{
    try {
      const updatedFav = {
        uid : productId,
        addedOn : serverTimestamp(),
      };
      
      await setDoc(CartRef, updatedFav);
    } catch (error) {
      console.error('Error updating Cart:', error);
    }
  }

  }
  const fetchProducts = async () => {
    try {
      const FavRef = collection(db, `customer/${currentUser.uid}/Favourite`);
      const q = query(FavRef);
      const querySnapshot = await getDocs(q);
      
      const FavData = await Promise.all(querySnapshot.docs.map((doc) => ({
        ...doc.data()
        
      })));
      const newDocs = await Promise.all(FavData.map(async (item) => {
        const docRef = doc(db, 'product', item.uid);
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
            var Cart = false;
          const docRef2 = doc(db, `customer/${currentUser.uid}/Cart`, item.uid);
          const documentSnapshot2 = await getDoc(docRef2);
          if(documentSnapshot2.exists()){
            Cart = true;
          }
          return {...product, imageUrl: imageUrl, cart: Cart};
        }
       }))
       setProducts((prevDocs) => [...prevDocs, ...newDocs]);
    } catch (error) {
      console.error('Error fetching Fav products:', error);
    }
  }
  return (
    <div  className={`${classes.container} ${classes.scrollbar}`}>
      <div className={classes.cardsContainer}>
        {products.map((product, index) => (
          <Card key={index} className={classes.card} >
            <CardMedia component="img" height="140" image={product.imageUrl} alt={product.name} onClick={() =>{setActiveButton("ProductPage"); setProductId(product.uid)}}/>
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
            <IconButton aria-label="Add to Wishlist" onClick={() => handleFav( index, product.uid)} >
            <AiFillDelete />
            </IconButton>
            <IconButton aria-label="Add to Cart"   onClick={() => handleCart(product.cart, index, product.uid)} style={product.cart ? { color: '#0C364F' } : {}}>
              <HiShoppingCart />
            </IconButton>
          </CardActions>

          </Card>
        ))}
      </div>
    </div>
  );
};

export default App;