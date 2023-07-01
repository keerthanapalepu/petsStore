import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from "./context/privateRoute";
import { AuthProvider } from "./context/authContext";
import CustomerHomePage from "./components/customers/home.js";
import DoctorHomePage from "./components/doctors/home";
import SupplierHomePage from "./components/suppliers/home";
import Login from "./components/login.js";

function App() {
  return (<>
    <Router >
      <AuthProvider>
        <Routes>
        <Route
            path="/customer"
            element={<PrivateRoute routeRole={"customer"} component=<CustomerHomePage /> />}
          />
          <Route
            path="/doctor"
            element={<PrivateRoute routeRole={"doctor"} component=<DoctorHomePage /> />}
          />
          <Route
            path="/supplier"
            element={<PrivateRoute routeRole={"supplier"} component=<SupplierHomePage /> />}
          />
          <Route path="/" element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router>
    <ToastContainer />
    </>
  );
}

export default App;
