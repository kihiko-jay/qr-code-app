import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PaymentPage from "./components/PaymentPage";
import Header from "./components/Header";
import QrGenerator from "./components/QrGenerator";
import MyQrCodes from "./components/MyQrcodes";
import AdminUsers from "./pages/AdminUsers";
import AdminQrCodes from "./pages/AdminQrCodes";
import CombinedQrGenerator from "./components/CombinedQrGenerator";
// Private route component
const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }>
          <Route index element={
            <>
              <QrGenerator />
              <MyQrCodes />
              <CombinedQrGenerator/>
            </>
          } />
          <Route path="combined" element={<CombinedQrGenerator/>}/>
          <Route path="generate" element={<QrGenerator />} />
          <Route path="my-qrcodes" element={<MyQrCodes />} />
        </Route>

        {/* Admin protected routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }>
          <Route path="users" element={<AdminUsers />} />
          <Route path="qrcodes" element={<AdminQrCodes />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
