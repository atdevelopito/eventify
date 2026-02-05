import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from '@/components/ui/toast';
import api from '@/lib/api';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // const { toast } = useToast(); // Removed

    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Missing reset token.", { title: "Invalid Link" });
        }
    }, [token, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match", { title: "Error" });
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, new_password: password });
            setSuccess(true);
            toast.success("Your password has been reset.", { title: "Success" });

            // Redirect after a moment
            setTimeout(() => {
                navigate('/login'); // Or just to home, and they can login
            }, 3000);

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password.", { title: "Error" });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
                        <p className="text-gray-500 mb-8">This password reset link is invalid or has expired.</p>
                        <Link to="/" className="text-black underline font-medium">Return Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
            <SEOHead title="Reset Password" description="Reset your account password." />
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-24">
                <div className="w-full max-w-md">

                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-gray-900" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Set New Password</h1>
                        <p className="text-gray-500">Please enter a new password for your account.</p>
                    </div>

                    {success ? (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-green-900 mb-2">Password Reset!</h2>
                            <p className="text-green-700 mb-6">Your password has been successfully updated. You can now use it to sign in.</p>
                            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors w-full">
                                Continue to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>

                            <div className="text-center pt-2">
                                <Link to="/" className="text-gray-500 text-sm hover:text-black transition-colors flex items-center justify-center gap-1">
                                    <ArrowLeft className="w-3 h-3" /> Back to Home
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ResetPassword;
