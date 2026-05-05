import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Hotels from './pages/hotel-accommodation-management/Hotels';
import HotelDetail from './pages/hotel-accommodation-management/HotelDetail';
import UserLogin from './pages/user-management/auth/UserLogin';
import Register from './pages/user-management/auth/Register';
import AdminLogin from './pages/user-management/auth/AdminLogin';
import ForgotPassword from './pages/user-management/auth/ForgotPassword';
import Profile from './pages/user-management/profile/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHotels from './pages/admin/hotel-accommodation-management/AdminHotels';
import AdminAddHotel from './pages/admin/hotel-accommodation-management/AdminAddHotel';
import AdminEditHotel from './pages/admin/hotel-accommodation-management/AdminEditHotel';

import Destinations from './pages/destination-management/Destinations';
import DestinationDetail from './pages/destination-management/DestinationDetail';
import LifestyleDetail from './pages/destination-management/LifestyleDetail';
import AdminDestinations from './pages/admin/destination-management/AdminDestinations';
import AdminAddDestination from './pages/admin/destination-management/AdminAddDestination';
import AdminEditDestination from './pages/admin/destination-management/AdminEditDestination';
import AdminLifestyles from './pages/admin/destination-management/AdminLifestyles';
import AdminAddLifestyle from './pages/admin/destination-management/AdminAddLifestyle';
import AdminEditLifestyle from './pages/admin/destination-management/AdminEditLifestyle';

import BudgetPlanner from './pages/budget-planner-management/BudgetPlanner';
import BudgetPlanDetail from './pages/budget-planner-management/BudgetPlanDetail';
import AdminBudgets from './pages/admin/budget-planner-management/AdminBudgets';

import Cart from './pages/review-management/Cart';
import Orders from './pages/review-management/Orders';
import MyReviews from './pages/review-management/MyReviews';
import AdminOrders from './pages/admin/review-management/AdminOrders';
import AdminUsers from './pages/admin/user-management/AdminUsers';

import Transport from './pages/driver-management/Transport';
import TransportDetail from './pages/driver-management/TransportDetail';
import DriverApply from './pages/driver-management/DriverApply';
import DriverDashboard from './pages/driver-management/DriverDashboard';
import MyVehicleBookings from './pages/driver-management/MyVehicleBookings';
import AdminDrivers from './pages/admin/driver-management/AdminDrivers';

import ChatBot from './components/shared/ChatBot';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';
import { AuthProvider } from './context/AuthContext';

const AppRoutes = () => {
  const location = useLocation();
  const hideChatBot =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/profile' ||
    ['/userlogin', '/register', '/userregister', '/adminlogin', '/forgot-password'].some((path) =>
      location.pathname.startsWith(path)
    );

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />

        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetail />} />
        <Route path="/lifestyle/:id" element={<LifestyleDetail />} />

        <Route path="/transport" element={<Transport />} />
        <Route path="/transport/:id" element={<TransportDetail />} />

        <Route
          path="/userlogin"
          element={
            <GuestRoute>
              <UserLogin />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/userregister"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/adminlogin"
          element={
            <GuestRoute>
              <AdminLogin />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dev/hotels"
          element={
            <ProtectedRoute role="admin">
              <AdminHotels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/hotels/add"
          element={
            <ProtectedRoute role="admin">
              <AdminAddHotel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/hotels/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminEditHotel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dev/destinations"
          element={
            <ProtectedRoute role="admin">
              <AdminDestinations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/destinations/add"
          element={
            <ProtectedRoute role="admin">
              <AdminAddDestination />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/destinations/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminEditDestination />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dev/lifestyles"
          element={
            <ProtectedRoute role="admin">
              <AdminLifestyles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/lifestyles/add"
          element={
            <ProtectedRoute role="admin">
              <AdminAddLifestyle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/lifestyles/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminEditLifestyle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <BudgetPlanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget/:id"
          element={
            <ProtectedRoute>
              <BudgetPlanDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dev/budget"
          element={
            <ProtectedRoute role="admin">
              <AdminBudgets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <MyReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/apply"
          element={
            <ProtectedRoute>
              <DriverApply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicle-bookings"
          element={
            <ProtectedRoute>
              <MyVehicleBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dev/drivers"
          element={
            <ProtectedRoute role="admin">
              <AdminDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/orders"
          element={
            <ProtectedRoute role="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dev/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Navigate to="/userlogin" replace />} />
        <Route
          path="*"
          element={
            <div style={{ padding: '8rem 2rem 4rem', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
              <a href="/" style={{ color: '#ff6b35', fontWeight: 600 }}>
                Go Home
              </a>
            </div>
          }
        />
      </Routes>

      {!hideChatBot ? <ChatBot /> : null}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
