import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CardHeader
} from '@material-ui/core';
import {  collection, query, orderBy, doc, startAfter, getDocs, addDoc, getDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from "../../context/authContext";
import {
    getDownloadURL,
    ref,
  } from "firebase/storage";
  import { makeStyles } from "@material-ui/core/styles";
  const useStyles = makeStyles((theme) => ({
    container: {
      height: '100vh',
      overflowY: 'scroll',
      padding: theme.spacing(2),
    },
    card: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      margin: theme.spacing(2),
      padding: theme.spacing(2),
    },
    image: {
      width: '200px',
      marginRight: theme.spacing(2),
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
    },
    textField: {
      margin: theme.spacing(2),
    },
    commentsContainer: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
  }));
const ProductDetails = ({productId}) => {
    const { currentUser } = useAuth();
    const classes = useStyles();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [product, setProduct] = useState({});


  useEffect( () => {
    if(productId){
        fetchProducts();
    }
  }, [productId]);

  const fetchComments = async () => {
    const CommentRef = collection(db, `product/${productId}/Comment`);
      const q = query(CommentRef, orderBy("addedOn", 'desc'));
      const querySnapshot = await getDocs(q);
      
      const CommentData = await Promise.all(querySnapshot.docs.map((doc) => ({
        ...doc.data()
      })));
      setComments([...CommentData]);
  }

  const fetchProducts = async () => {
    const product = doc(db, `product`, productId);
    const productSnapshot = await getDoc(product);
    const brand = doc(db, `brand`, productSnapshot.data().brandId);
    const brandSnapshot = await getDoc(brand);
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
    setProduct({...productSnapshot.data(), brandDescription: brandSnapshot.data().description, imageUrl: imageUrl});
    fetchComments();
    
  }
  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleAddComment = async () => {
    if (newComment.trim() !== '') {
      
      const productDetails = doc(db, "product", productId);
    let name = currentUser.displayName;
    if(!name){
        const docRef = doc(db, 'customer',currentUser.uid);
        const documentSnapshot = await getDoc(docRef);
        name = documentSnapshot.data().name;
    }
    try {
      const updated = {
        userUid: currentUser.uid,
        userName: name,
        comment: newComment,
        addedOn: serverTimestamp()
      };
      setComments([...comments, updated]);
      const userAppRef = await addDoc(
        collection(productDetails, "Comment"),
        updated
      );
    } catch (error) {
      console.error('Error updating comment:', error);
    }
      setNewComment('');
    }
  };

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <img src={product.imageUrl} alt={product.name} className={classes.image} />
        <CardContent className={classes.content}>
          <CardHeader title={product.name} subheader={product.brand} />
          <Typography variant="body2">{product.description}</Typography>
          <Typography variant="body2">{product.brandDescription}</Typography>
          <Typography variant="body1">Price: {product.price}</Typography>
          <Typography variant="body1">Pet: {product.pet}</Typography>
          <Typography variant="body1">Category: {product.Category}</Typography>
          <Typography variant="body1">Supplier: {product.supplierName}</Typography>
        </CardContent>
      </Card>

      <div>
        <TextField
          label="Leave a comment"
          variant="outlined"
          value={newComment}
          onChange={handleCommentChange}
          className={classes.textField}
        />
        <Button variant="contained" color="primary" onClick={handleAddComment}>
          Submit
        </Button>
      </div>

      <div className={classes.commentsContainer}>
        <Typography variant="h5">Comments</Typography>
        <List>
          {comments.map((comment, index) => (
            <ListItem key={index}>
              <ListItemText primary={comment.userName} secondary={comment.comment} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default ProductDetails;
