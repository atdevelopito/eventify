import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '@/pages/Home';
import Auth from '@/pages/AnimatedAuth';
import Dashboard from '@/pages/Dashboard';
import Verify from '@/pages/Verify';
import Discover from '@/pages/Discover';
import Activities from '@/pages/Activities';
import Merch from '@/pages/Merch';
import Checkout from '@/pages/Checkout';
import Contact from '@/pages/Contact';
import CreateEvent from '@/pages/CreateEvent';
import EditEvent from '@/pages/EditEvent';
import MyTickets from '@/pages/MyTickets';
import ToastDemo from '@/pages/ToastDemo';
import TourDemo from '@/pages/TourDemo';
import DrawerDemo from '@/components/DrawerDemo';
import TableDemo from '@/components/TableDemo';
import AlertDemo from '@/components/AlertDemo';
import TicketConfirmationDemo from '@/components/TicketConfirmationDemo';
import NotFound from '@/pages/NotFound';
import ResetPassword from '@/pages/ResetPassword';
import OrderSuccess from '@/pages/OrderSuccess';
import Blog from '@/pages/Blog';
import Cookies from '@/pages/Cookies';
import FAQs from '@/pages/FAQs';
import HelpCenter from '@/pages/HelpCenter';
import Legal from '@/pages/Legal';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import AdminDashboard from '@/pages/AdminDashboard';

// import EventDetailPage from '@/components/EventDetailPage'; // It was in components
// We need to check if EventDetailPage is exported correctly. It was a .tsx file.
// Assuming it is default export.
import { EventDetailPage } from '@/components/EventDetailPage';
import TicketDetail from '@/pages/TicketDetail';

import { RoleProvider, useRole } from '@/components/RoleContext';
import { CartProvider } from '@/components/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import Toaster from "@/components/ui/toast"
import { ProtectedRoute } from '@/components/ProtectedRoute'; // Use the robust component
import { PageTransitionLoader } from '@/components/PageTransitionLoader';

function PrivateRoute({ children }) {
  const { user, loading, isVerified } = useRole();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isVerified) return <Navigate to="/verify" />;

  return children;
}

function AuthRoute({ children }) {
  const { user, loading, isVerified } = useRole();

  if (loading) return <div>Loading...</div>;
  if (user) {
    if (isVerified) {
      return <Navigate to="/dashboard" />;
    } else {
      // If logged in but not verify, let them go to verify, or stay in auth? 
      // Redirect to verify usually
      return <Navigate to="/verify" />;
    }
  }

  return children;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <RoleProvider>
        <CartProvider>
          <PageTransitionLoader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/merch" element={<Merch />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/order-success" element={<OrderSuccess />} />


            {/* Auth Routes */}
            <Route path="/login" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/signup" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />

            <Route path="/verify" element={<Verify />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-event"
              element={
                <PrivateRoute>
                  <CreateEvent />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-event/:id"
              element={
                <PrivateRoute>
                  <EditEvent />
                </PrivateRoute>
              }
            />

            {/* Event Detail */}
            {/* Event Detail - Support both plural and singular */}
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />

            <Route
              path="/my-tickets"
              element={
                <PrivateRoute>
                  <MyTickets />
                </PrivateRoute>
              }
            />

            <Route
              path="/ticket/:ticketId"
              element={
                <PrivateRoute>
                  <TicketDetail />
                </PrivateRoute>
              }
            />

            <Route path="/toast-demo" element={<ToastDemo />} />
            <Route path="/tour-demo" element={<TourDemo />} />
            <Route path="/drawer-demo" element={<DrawerDemo />} />
            <Route path="/table-demo" element={<TableDemo />} />
            <Route path="/alert-demo" element={<AlertDemo />} />
            <Route path="/ticket-confirmation-demo" element={<TicketConfirmationDemo />} />
            <Route path="/reset-password" element={<ResetPassword />} />


            {/* Static Pages */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <CartDrawer />
          <Toaster /> {/* This is the new custom one because we will update the import */}
        </CartProvider>
      </RoleProvider>
    </ErrorBoundary>
  );
}

export default App;
