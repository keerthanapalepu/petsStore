import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography, CardMedia,CardActions, IconButton, Button } from '@mui/material';
import {TextField} from '@material-ui/core';
import { getFirestore, collection, query, orderBy, doc, limit, startAfter, getDocs, getDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {AiFillHeart } from 'react-icons/ai';
import {HiShoppingCart} from 'react-icons/hi';
import {
    getDownloadURL,
    ref,
  } from "firebase/storage";
import { db, storage } from '../../services/firebase';
import { makeStyles } from "@material-ui/core/styles";
import ProductFilter from './filters';
import { useAuth } from "../../context/authContext";
const PAGE_SIZE = 8; // Number of products to load per page
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
    heading: {
      position: 'sticky',
      top: 0,
      backgroundColor: '#fff',
      padding: '1rem',
      zIndex: 1,
      color: "black"
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
    floatRight: {
      float: 'right',

    },
    searchBox: {
      margin: '2px',
    },
  });
  
function ProductList({setActiveButton, setProductId}) {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [brand, setBrand] = useState([]);
  const [category, setCategory] = useState([]);
  const [pet, setPet] = useState([]);
  const [supplier, setSupplier] = useState([]);
  
  useEffect( () => {
    fetchProducts();
  }, []);
  
  
  

  const handleFav = async(fav, index, favoriteId) => {
    const updatedItems = [...products];
    const updatedFilterItems = [...filteredProducts];
  updatedItems[index].fav = !fav;
  updatedFilterItems[index].fav = !fav;
  setProducts([...updatedItems]);
  setFilteredProducts([...updatedFilterItems]);
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
  const handleCart = async(cart, index, productId) => {
    const updatedItems = [...products];
    const updatedFilterItems = [...filteredProducts];
  updatedItems[index].cart = !cart;
  updatedFilterItems[index].cart = !cart;
  setProducts([...updatedItems]);
  setFilteredProducts([...updatedFilterItems]);
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
        let queryRef = query(collection(db, 'product'), orderBy('name'), limit(PAGE_SIZE));

        if (lastVisible) {
          queryRef = query(collection(db, 'product'), orderBy('name'), startAfter(lastVisible), limit(PAGE_SIZE));
        }
  

      const snapshot = await getDocs(queryRef);
      const newProducts = [];

      await Promise.all(snapshot.docs.map(async (document) => {
        const product = document.data();
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
          const docRef1 = doc(db, `customer/${currentUser.uid}/Favourite`, document.id);
          const documentSnapshot1 = await getDoc(docRef1);
          if(documentSnapshot1.exists()){
            Fav = true;
          }
          var Cart = false;
          const docRef2 = doc(db, `customer/${currentUser.uid}/Cart`, document.id);
          const documentSnapshot2 = await getDoc(docRef2);
          if(documentSnapshot2.exists()){
            Cart = true;
          }
          
          
        newProducts.push({...product, imageUrl: imageUrl, fav: Fav, cart: Cart});
      }));

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      setFilteredProducts((prevProducts) => [...prevProducts, ...newProducts])
      newProducts.map((product) => {
        setBrand((prevProducts) =>
          prevProducts.includes(product.brand) ? prevProducts : [...prevProducts, product.brand]
        );

        setCategory((prevProducts) =>
          prevProducts.includes(product.category) ? prevProducts : [...prevProducts, product.category]
        );

        setPet((prevProducts) =>
          prevProducts.includes(product.pet) ? prevProducts : [...prevProducts, product.pet]
        );

        setSupplier((prevProducts) =>
          prevProducts.includes(product.supplierName) ? prevProducts : [...prevProducts, product.supplierName]
        );

      })
      
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleLoadMore = () => {
    fetchProducts();
  };
  const handleSearchChange = (event) => {
    const searchText = event.target.value;
    setSearchText(searchText);
  };
  const classes = useStyles();

  return (
    <div className={`${classes.container} ${classes.scrollbar}`} >
     
      <div  className={classes.heading} style={{display:"flex", justifyContent: "space-evenly", alignItems: "center",}}>
      <TextField
      className={classes.searchBox}
      label="Search"
      variant="outlined"
      onChange={handleSearchChange}
    />
    <ProductFilter suppliers={supplier} pets={pet} categories={category} brands={brand} products={products} setFilteredProducts={setFilteredProducts} />
      </div>

      <div className={classes.cardsContainer} >
        {filteredProducts.map((product, index) => (
          <Card key={index} className={classes.card}>
            <CardMedia component="img" height="140" image={product.imageUrl} alt={product.name} onClick={() => {setActiveButton("ProductPage"); setProductId(product.uid)}} />
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
            <IconButton aria-label="Add to Cart"   onClick={() => handleCart(product.cart, index, product.uid)} style={product.cart ? { color: '#0C364F' } : {}}>
              <HiShoppingCart />
            </IconButton>
          </CardActions>

          </Card>
        ))}
      </div>
      <Button  onClick={handleLoadMore}  style={{ marginLeft: "auto", background: "black", color: "white" }} >
      Load More
    </Button>
    </div>
  );
}

export default ProductList;
