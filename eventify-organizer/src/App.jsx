import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OrganizerLanding } from '@/pages/OrganizerLanding';
import { DashboardHome } from '@/pages/organizer/DashboardHome';
import { EventsPage } from '@/pages/organizer/EventsPage';
import { CalendarsPage } from '@/pages/organizer/CalendarsPage';
import { CreateEventPage } from '@/pages/organizer/CreateEventPage';
import { RegistrationsPage } from '@/pages/organizer/RegistrationsPage';
import { TicketsPage } from '@/pages/organizer/TicketsPage';
import { AttendeesPage } from '@/pages/organizer/AttendeesPage';
import { EarningsPage } from '@/pages/organizer/EarningsPage';
import { PromotionsPage } from '@/pages/organizer/PromotionsPage';
import { ReviewsPage } from '@/pages/organizer/ReviewsPage';
import { FormsPage } from '@/pages/organizer/FormsPage';
import { FormBuilder } from '@/pages/organizer/FormBuilder';
import { MerchandisePage } from '@/pages/organizer/MerchandisePage';
import { ProfilePage } from '@/pages/organizer/ProfilePage';
import { ManagementPage } from '@/pages/organizer/ManagementPage';
import QRScanner from '@/pages/organizer/QRScanner';
import { DashboardLayout as OrganizerLayout } from '@/components/organizer/layout/DashboardLayout';
import { OrganizerVerification } from '@/pages/OrganizerVerification';
import Auth from '@/pages/AnimatedAuth';
import Verify from '@/pages/Verify';
import { RoleProvider, useRole } from '@/components/RoleContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Toaster from "@/components/ui/toast"
import { PageTransitionLoader } from '@/components/PageTransitionLoader';

function AuthRoute({ children }) {
    const { user, loading, isVerified } = useRole();

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (user) {
        if (isVerified) {
            return <Navigate to="/organizer" />;
        } else {
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
                <PageTransitionLoader />
                <Routes>
                    {/* Landing page for non-organizers */}
                    <Route path="/" element={<OrganizerLanding />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<AuthRoute><Auth /></AuthRoute>} />
                    <Route path="/signup" element={<AuthRoute><Auth /></AuthRoute>} />
                    <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />

                    {/* Verification */}
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/verification" element={<OrganizerVerification />} />

                    {/* Organizer Dashboard - Protected Routes */}
                    <Route
                        path="/organizer"
                        element={
                            <ProtectedRoute requireOrganizer>
                                <OrganizerLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardHome />} />
                        <Route path="events" element={<EventsPage />} />
                        <Route path="calendars" element={<CalendarsPage />} />
                        <Route path="events/create" element={<CreateEventPage />} />
                        <Route path="events/:eventId/edit" element={<CreateEventPage />} />
                        <Route path="registrations" element={<RegistrationsPage />} />
                        <Route path="tickets" element={<TicketsPage />} />
                        <Route path="attendees" element={<AttendeesPage />} />
                        <Route path="promotions" element={<PromotionsPage />} />
                        <Route path="earnings" element={<EarningsPage />} />
                        <Route path="reviews" element={<ReviewsPage />} />
                        <Route path="merchandise" element={<MerchandisePage />} />
                        <Route path="forms" element={<FormsPage />} />
                        <Route path="forms/:formId" element={<FormBuilder />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="management" element={<ManagementPage />} />
                        <Route path="scan" element={<QRScanner />} />
                    </Route>

                    {/* Redirect all other routes to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster />
            </RoleProvider>
        </ErrorBoundary>
    );
}

export default App;
