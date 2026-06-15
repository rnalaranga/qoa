import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import FleetStatus from './pages/FleetStatus';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import PrinterDetails from './pages/PrinterDetails';
import PrinterCalendar from './pages/PrinterCalendar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="fleet" element={<FleetStatus />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
          <Route path="printer/:ip" element={<PrinterDetails />} />
          <Route path="printer/:ip/calendar" element={<PrinterCalendar />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
