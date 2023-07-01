import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { MdCalendarToday } from 'react-icons/md';
import {AiFillHeart,  AiFillHome, AiOutlineShoppingCart} from 'react-icons/ai';
import {FaUserDoctor} from 'react-icons/fa6'
import {BsFillBoxFill} from 'react-icons/bs'
const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: '50px',
    margin: 'auto',
    width: 'calc(100% - 20px)',
    maxWidth: 360,
    backgroundColor: 'transparent',
  },
  listItem: {
    backgroundColor: '#0C364F',
    marginBottom: '10px',
    borderRadius: '5px',
    color: '#A7A7A7',
    '&:hover': {
      backgroundColor: '#082534',
      color: '#333333',
    },
  },
  listItemIcon: {
    color: '#A7A7A7',
    fontSize: '30px'
  },
  listItemText: {
    color: '#A7A7A7',
    fontFamily: 'play-fair',
    fontWeight: 'bolder'
  },
}));

function SideBar({handleButtonClick}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="Main navigation">
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Home')}>
          <ListItemIcon className={classes.listItemIcon}>
            <AiFillHome />
          </ListItemIcon>
          <ListItemText primary="Home" className={classes.listItemText}  />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Vets')}>
          <ListItemIcon className={classes.listItemIcon}>
            <FaUserDoctor />
          </ListItemIcon>
          <ListItemText primary="Vets" className={classes.listItemText}  />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Appointment')}>
          <ListItemIcon className={classes.listItemIcon}>
            <MdCalendarToday />
          </ListItemIcon>
          <ListItemText primary="Appointment" className={classes.listItemText}  />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Wishlist')}>
          <ListItemIcon className={classes.listItemIcon}>
            <AiFillHeart />
          </ListItemIcon>
          <ListItemText primary="Wishlist" className={classes.listItemText} />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Cart')}>
          <ListItemIcon className={classes.listItemIcon}>
            <AiOutlineShoppingCart />
          </ListItemIcon>
          <ListItemText primary="Cart" className={classes.listItemText} />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Orders')}>
          <ListItemIcon className={classes.listItemIcon}>
            <BsFillBoxFill />
          </ListItemIcon>
          <ListItemText primary="Orders" className={classes.listItemText} />
        </ListItem>
      </List>
    </div>
  );
}

export default SideBar;
