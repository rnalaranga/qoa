import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import FleetStatus from './pages/FleetStatus';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import PrinterDetails from './pages/PrinterDetails';
import PrinterCalendar from './pages/PrinterCalendar';
import PrintUsers from './pages/PrintUsers';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="fleet" element={<FleetStatus />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="printer/:ip" element={<PrinterDetails />} />
              <Route path="printer/:ip/calendar" element={<PrinterCalendar />} />
              <Route path="users" element={<PrintUsers />} />
              
              {/* Admin Only Routes */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="customers" element={<Customers />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
