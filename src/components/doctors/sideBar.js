import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { MdCalendarToday } from 'react-icons/md';
import {FaUserDoctor, FaClipboardList} from 'react-icons/fa6'
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
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Profile')}>
          <ListItemIcon className={classes.listItemIcon}>
            <FaUserDoctor />
          </ListItemIcon>
          <ListItemText primary="Profile" className={classes.listItemText}  />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('Appointment')}>
          <ListItemIcon className={classes.listItemIcon}>
            <MdCalendarToday />
          </ListItemIcon>
          <ListItemText primary="Appointment" className={classes.listItemText}  />
        </ListItem>
        <ListItem button className={classes.listItem} onClick={() => handleButtonClick('PrevAppointment')}>
          <ListItemIcon className={classes.listItemIcon}>
            <FaClipboardList />
          </ListItemIcon>
          <ListItemText primary="PrevAppointment" className={classes.listItemText}  />
        </ListItem>
      </List>
    </div>
  );
}

export default SideBar;
