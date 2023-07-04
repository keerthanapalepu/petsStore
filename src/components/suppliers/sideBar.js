import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { MdCalendarToday } from 'react-icons/md';
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
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Orders')}>
          <ListItemIcon className={classes.listItemIcon}>
            <MdCalendarToday />
          </ListItemIcon>
          <ListItemText primary="Orders" className={classes.listItemText}  />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Add Products')}>
          <ListItemIcon className={classes.listItemIcon}>
            <BsFillBoxFill />
          </ListItemIcon>
          <ListItemText primary="Add Products" className={classes.listItemText}  />
        </ListItem>
      </List>
    </div>
  );
}

export default SideBar;
