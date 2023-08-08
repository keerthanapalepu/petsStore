import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Grid, IconButton, Card} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import SideBar from './sideBar';
import {FiLogOut} from "react-icons/fi";
import { MdCalendarToday } from 'react-icons/md';
import {BsFillBoxFill} from 'react-icons/bs'
import Orders from './orders';
import AddProduct from './addProduct';
import{auth} from "../../services/firebase"
const theme = createMuiTheme({
  overrides: {
    MuiPaper: {
      root: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    MuiCard: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
      },
    },
  },
});

const useStyles = makeStyles((theme) => ({
  iconButton: {
    marginLeft: theme.spacing(1),
    color: "#0C364F"
  },
  root: {
    flexGrow: 1,
    height: '100vh',
  },
  gridContainer: {
    height: '100%',
  },
  gridItem: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      backgroundColor: 'transparent',
      zIndex: -1,
      backdropFilter: 'blur',
    },
  },
  card1: {
    height: 'calc(100% - 20px)',
    width: 'calc(100% - 20px)',
  },
  card2: {
    height: 'calc(100% - 20px)',
    width: 'calc(100% - 20px)',
    '&.MuiPaper-elevation1' : {
      boxShadow: '0px 0px 0px 0px'
    },
    backgroundColor: 'white'
  },
}));

function HomePage() {
  const classes = useStyles();
  const [activeButton, setActiveButton] = useState('Orders');
  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <Grid container className={classes.gridContainer}>
          <Grid item xs={2} md={2} className={classes.gridItem} style={{ backgroundColor: '#42779A' }}>
            <Card className={classes.card1}>
            <SideBar handleButtonClick={handleButtonClick} />
            </Card>
          </Grid>
          <Grid item xs={10} md={10} className={classes.gridItem} style={{ backgroundColor: 'white' }}>
            <Card className={classes.card2}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton className={classes.iconButton} onClick={() => {setActiveButton("Add Products")}}>
                <BsFillBoxFill />
              </IconButton>
              <IconButton className={classes.iconButton} onClick={() => {setActiveButton("Orders")}}>
                <MdCalendarToday />
              </IconButton>
              <IconButton className={classes.iconButton} onClick={() => auth.signOut()}>
                <FiLogOut />
              </IconButton>
              
            </div>
            {activeButton==="Add Products" && <AddProduct />}
            {activeButton==="Orders" && <Orders /> }
            </Card>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
}

export default HomePage;
