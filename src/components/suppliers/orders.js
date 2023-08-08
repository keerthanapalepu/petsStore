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
import { collection, query, orderBy, doc, getDocs,addDoc,  getDoc, deleteDoc, serverTimestamp, setDoc, startAfter } from 'firebase/firestore';
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

const Orders = () => {
  const classes = useStyles();
  const { currentUser } = useAuth();
  const [orderedProducts, setOrderedProducts] = useState([]);

  useEffect(() => {

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, `supplier/${currentUser.uid}/Orders`);
      const q = query(ordersRef, orderBy("addedOn"));
      const querySnapshot = await getDocs(q);
    
      const newDocs = await Promise.all(querySnapshot.docs.map(async (item) => {
        const order = item.data();
        const productRef = doc(db, 'product', order.productId);
        const productSnapshot = await getDoc(productRef);
        const customerRef = doc(db, 'customer', order.userId);
        const customerSnapshot = await getDoc(customerRef);
        return {date: order.addedOn, id : item.id, userName : customerSnapshot.data().name,
           phoneNumber:  customerSnapshot.data().phoneNumber, productName: productSnapshot.data().name,
            price : productSnapshot.data().price, pet : productSnapshot.data().pet , category: productSnapshot.data().category}
       }))
       setOrderedProducts((prevDocs) => [...prevDocs, ...newDocs]);
       console.log(newDocs);
    } catch (error) {
      console.error('Error fetching orders ', error);
    }
  }


  return (
    <div className={`${classes.container} ${classes.scrollbar}`}>
      <Typography variant="h4" component="h1" align="center">
        Ordered Products  
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>ordered By</TableCell> 
              <TableCell>Phone</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Pet</TableCell>
              <TableCell>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
             {orderedProducts.map((product, index) => (
                <TableRow key={product.id}>
                    <TableCell>{product.date.toDate().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}</TableCell>
                <TableCell>{product.userName}</TableCell>
                <TableCell>{product.phoneNumber}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.pet}</TableCell>
                <TableCell>{product.category}</TableCell>
              </TableRow>
              ))}
             
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Orders;
