import React, {useEffect, useState} from 'react';
import { Card, CardContent, Typography, CardMedia,CardActions, IconButton, Button } from '@mui/material';
import {AiFillHeart, AiFillDelete } from 'react-icons/ai';
import { makeStyles } from "@material-ui/core/styles";
import {  collection, query, orderBy,addDoc, doc, startAfter, getDocs, getDoc, deleteDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage, httpsCallable, functions } from '../../services/firebase';
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
  const [amount, setAmount] = useState(0);
  useEffect( () => {
    fetchProducts();
  }, []);
  
  
  const handleFav = async(fav, index, favoriteId) => {
  const updatedItems = [...products];
  updatedItems[index].fav = !fav;
  setProducts([...updatedItems]);
  const favoriteRef = doc(db, `customer/${currentUser.uid}/Favourite`, favoriteId);
  if(fav){
    try {
      
      await deleteDoc(favoriteRef);
    } catch (error) {
      console.error('Error deleting favorite:', error);
    }
  }
  else{
    try {
      const updatedFav = {
        uid : favoriteId,
        addedOn : serverTimestamp()
      };
      
      await setDoc(favoriteRef, updatedFav);
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  }

  }

   
const initPayment = (data) => {
  return new Promise((resolve, reject) => {
    const options = {
      key: "rzp_test_i10pSJmi7llEqT",
      amount: data.amount,
      currency: data.currency,
      name: "Buy Products",
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
  const handleCart = async( index, productId, price) => {
    const updatedItems = [...products];
  updatedItems.splice(index, 1);
  setProducts([...updatedItems]);
  setAmount((prev) => prev - price);
  const CartRef = doc(db, `customer/${currentUser.uid}/Cart`, productId);
  try {
    await deleteDoc(CartRef);
  } catch (error) {
    console.error('Error deleting Cart:', error);
  }

  }
  const fetchProducts = async () => {
    try {
      const CartRef = collection(db, `customer/${currentUser.uid}/Cart`);
      const q = query(CartRef);
      const querySnapshot = await getDocs(q);
      
      const CartData = await Promise.all(querySnapshot.docs.map((doc) => ({
        ...doc.data()
      })));
      const newDocs = await Promise.all(CartData.map(async (item) => {
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
            var Fav = false;
            const docRef1 = doc(db, `customer/${currentUser.uid}/Favourite`, item.uid);
            const documentSnapshot1 = await getDoc(docRef1);
            if(documentSnapshot1.exists()){
              Fav = true;
            }
            setAmount((prev) => prev + product.price);
          return {...product, imageUrl: imageUrl, fav: Fav};
        }
       }))
       setProducts((prevDocs) => [...prevDocs, ...newDocs]);
    } catch (error) {
      console.error('Error fetching cart products:', error);
    }
  }
  const buyProducts = async (amount) => {
    try {
      await handlePayment(amount); 
  
      await Promise.all(products.map(async (item) => {
        const CartRef = doc(db, `customer/${currentUser.uid}/Cart`, item.uid);
        const customerOrdersRef = doc(db, `customer`, currentUser.uid);
        const supplierOrdersRef = doc(db, `supplier`, item.supplierId);
        const supplierRef = doc(db, `supplier`, item.supplierId);
        const productRef = doc(db, `product`, item.uid);
  
        try {
          await deleteDoc(CartRef);
        } catch (error) {
          console.error('Error deleting Cart:', error);
        }
  
        try {
          const documentSnapshot = await getDoc(supplierRef);
          let activeOrders = documentSnapshot.data().activeOrders + 1;
          let totalAmount = documentSnapshot.data().totalAmount + item.price;
          await updateDoc(supplierRef, { activeOrders: activeOrders, totalAmount: totalAmount });
        } catch (error) {
          console.error('Error updating supplier:', error);
        }
  
        try {
          await updateDoc(productRef, { quantity: item.quantity - 1 });
        } catch (error) {
          console.error('Error updating product:', error);
        }
  
        try {
          const updatedOrder = {
            productId: item.uid,
            userId: currentUser.uid,
            addedOn: serverTimestamp(),
            price: item.price
          };
          await addDoc(
            collection(customerOrdersRef, "Orders"),
            updatedOrder
          );
          await addDoc(
            collection(supplierOrdersRef, "Orders"),
            updatedOrder
          );
        } catch (error) {
          console.error('Error updating Orders:', error);
        }
      }));
  
      setProducts([]);
    } catch (error) {
      console.error('Error during payment:', error);
    }
  };
  
  return (
    <div  className={`${classes.container} ${classes.scrollbar}`}>
      <div className={classes.cardsContainer}>
        {products.map((product, index) => (
          <Card key={index} className={classes.card}>
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
            <IconButton aria-label="Add to Wishlist" onClick={() => handleFav(product.fav, index, product.uid)}  style={product.fav ? { color: '#0C364F' } : {}}>
              <AiFillHeart />
            </IconButton>
            <IconButton aria-label="Add to Cart"   onClick={() => handleCart(index, product.uid, product.price)}>
              <AiFillDelete />
            </IconButton>
          </CardActions>

          </Card>
        ))}
      </div>
      <Button  onClick={() => buyProducts(amount)}  style={{ marginLeft: "auto", background: "black", color: "white" }} >
      Buy {amount}/-
    </Button>
    </div>
  );
};

export default App;