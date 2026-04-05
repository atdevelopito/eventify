import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading for pages
const Home = lazy(() => import('@/pages/Home'));
const Auth = lazy(() => import('@/pages/AnimatedAuth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Verify = lazy(() => import('@/pages/Verify'));
const Discover = lazy(() => import('@/pages/Discover'));
const Activities = lazy(() => import('@/pages/Activities'));
const Merch = lazy(() => import('@/pages/Merch'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Contact = lazy(() => import('@/pages/Contact'));
const CreateEvent = lazy(() => import('@/pages/CreateEvent'));
const EditEvent = lazy(() => import('@/pages/EditEvent'));
const MyTickets = lazy(() => import('@/pages/MyTickets'));
const ToastDemo = lazy(() => import('@/pages/ToastDemo'));
const TourDemo = lazy(() => import('@/pages/TourDemo'));
const DrawerDemo = lazy(() => import('@/components/DrawerDemo'));
const TableDemo = lazy(() => import('@/components/TableDemo'));
const AlertDemo = lazy(() => import('@/components/AlertDemo'));
const TicketConfirmationDemo = lazy(() => import('@/components/TicketConfirmationDemo'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const Blog = lazy(() => import('@/pages/Blog'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const FAQs = lazy(() => import('@/pages/FAQs'));
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const Legal = lazy(() => import('@/pages/Legal'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const TicketDetail = lazy(() => import('@/pages/TicketDetail'));

// components that might be needed immediately
import { RoleProvider, useRole } from '@/components/RoleContext';
import { CartProvider } from '@/components/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import Toaster from "@/components/ui/toast"
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageTransitionLoader } from '@/components/PageTransitionLoader';
import { EventDetailPage } from '@/components/EventDetailPage';

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
  </div>
);

function RedirectToOrganizer() {
  React.useEffect(() => {
    window.location.href = import.meta.env.VITE_ORGANIZER_URL || 'http://localhost:5174';
  }, []);
  return <div className="flex h-screen items-center justify-center font-bold">Redirecting to Organizer Portal...</div>;
}

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
          <Suspense fallback={<PageLoader />}>
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

              <Route path="/organizer-landing" element={<RedirectToOrganizer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CartDrawer />
          <Toaster /> {/* This is the new custom one because we will update the import */}
        </CartProvider>
      </RoleProvider>
    </ErrorBoundary>
  );
}

export default App;
