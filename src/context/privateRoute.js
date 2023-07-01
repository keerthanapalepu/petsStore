import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const PrivateRoute = ({ component, routeRole}) => {
    const { currentUser } = useAuth();
    const role = localStorage.getItem('role');
    console.log(role, routeRole);
    const sameUser =  routeRole === role? true : false;
    console.log(sameUser);
    console.log(currentUser);
    const location = useLocation();
  return (
    <>
    {
        currentUser && sameUser? <>{component}</> : <Navigate to="/" replace state={{ from: location }} />
    }
    </>
);
};

export default PrivateRoute;