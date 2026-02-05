import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useRole } from '@/components/RoleContext';

export default function Verify() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { user, isVerified, checkAuth, loading: roleLoading } = useRole();

    const [status, setStatus] = useState('Click the button below to verify your account.');
    const [loading, setLoading] = useState(false);
    const [localVerified, setLocalVerified] = useState(false);

    // For Resend
    const [resendLoading, setResendLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [manualEmail, setManualEmail] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);

    // Dev Mode
    const [devToken, setDevToken] = useState(null);

    // Cooldown timer
    useEffect(() => {
        let interval;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);

    useEffect(() => {
        if (isVerified || (user?.is_verified)) {
            // Optional: Auto redirect
        }
    }, [isVerified, user]);

    const handleVerify = async () => {
        if (!token) return;
        setLoading(true);
        try {
            await api.post('/auth/verify', { token });
            setStatus('Account verified! Redirecting to dashboard...');
            setLocalVerified(true);
            if (checkAuth) await checkAuth();
            setTimeout(() => navigate('/organizer'), 1500);
        } catch (err) {
            setStatus(err.response?.data?.message || 'Verification failed. Token might be expired.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async (e) => {
        if (e) e.preventDefault();

        // If checking auth or cooldown active, ignore
        if (roleLoading || cooldown > 0) return;

        const emailToUse = user?.email || manualEmail;

        if (!emailToUse) {
            setShowEmailInput(true);
            return;
        }

        setResendLoading(true);
        setResendStatus(''); // Clear previous status

        try {
            const response = await api.post('/auth/resend-verification', { email: emailToUse });
            setResendStatus(response.data.message);
            setCooldown(60);
            setShowEmailInput(false); // Hide input on success

            if (response.data.dev_verification_token) {
                setDevToken(response.data.dev_verification_token);
            }
        } catch (err) {
            setResendStatus(err.response?.data?.message || 'Failed to resend verification.');
        } finally {
            setResendLoading(false);
        }
    };

    if (roleLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-gray-50">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:32px_32px]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl translate-y-1/2" />

            <div className="relative w-full max-w-md p-8 sm:p-10 mx-4 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Account Verification</h2>
                    <p className="text-gray-500 font-medium">Secure your Organizer account</p>
                </div>

                {/* CASE 1: Token Present - Ready to Verify */}
                {token && !localVerified && (
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 text-blue-900 text-sm text-center font-medium">
                            {status}
                        </div>
                        <button
                            onClick={handleVerify}
                            disabled={loading}
                            className={`w-full h-12 rounded-xl font-semibold text-white transition-all duration-200 
                                ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-black hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Verifying...
                                </span>
                            ) : 'Verify My Account'}
                        </button>
                    </div>
                )}

                {/* CASE 2: No Token - Message & Manual Entry */}
                {!token && !localVerified && (
                    <div className="space-y-8">
                        <div className="p-6 rounded-2xl bg-gray-50/80 border border-gray-100 text-center">
                            <p className="text-gray-600 leading-relaxed">
                                {status === 'Click the button below to verify your account.'
                                    ? (user ? <>A verification email has been sent to <br /><span className="font-semibold text-gray-900">{user.email}</span></> : 'Please check your inbox for the verification link.')
                                    : status}
                            </p>
                        </div>

                        {/* Manual Code Entry */}
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white/50 backdrop-blur px-2 text-gray-500 font-medium">Or enter code manually</span>
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const form = e.target;
                                    const manualToken = form.token.value;
                                    if (manualToken) {
                                        setLoading(true);
                                        api.post('/auth/verify', { token: manualToken })
                                            .then(() => {
                                                setStatus('Account verified! Redirecting...');
                                                setLocalVerified(true);
                                                if (checkAuth) checkAuth();
                                                setTimeout(() => navigate('/organizer'), 1500);
                                                setLoading(false);
                                            })
                                            .catch((err) => {
                                                setStatus(err.response?.data?.message || 'Invalid verification token.');
                                                setLoading(false);
                                            });
                                    }
                                }}
                                className="space-y-3"
                            >
                                <div className="space-y-2">
                                    <input
                                        name="token"
                                        type="text"
                                        placeholder="Paste verification code"
                                        className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full h-12 rounded-xl font-medium text-white transition-all duration-200
                                        ${loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99]'}
                                    `}
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {(localVerified || isVerified) && (
                    <div className="py-8 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Verified!</h3>
                        <p className="text-gray-500">Your account is now fully active.</p>
                        <button
                            onClick={() => navigate('/organizer')}
                            className="w-full h-12 bg-black text-white rounded-xl font-medium hover:bg-gray-800 hover:scale-[1.02] transition-all"
                        >
                            Continue to Organizer Dashboard
                        </button>
                    </div>
                )}

                {/* Footer Actions */}
                {!localVerified && !isVerified && !token && (
                    <div className="space-y-4 pt-2">
                        {/* Resend Logic */}
                        {!showEmailInput ? (
                            <button
                                onClick={handleResend}
                                disabled={resendLoading || cooldown > 0}
                                className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendLoading ? 'Sending email...' : cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Verification Email'}
                            </button>
                        ) : (
                            <form onSubmit={handleResend} className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-black"
                                    value={manualEmail}
                                    onChange={(e) => setManualEmail(e.target.value)}
                                    autoFocus
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={resendLoading}
                                    className="h-10 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    {resendLoading ? '...' : 'Send'}
                                </button>
                            </form>
                        )}

                        {resendStatus && (
                            <p className={`text-xs text-center font-medium ${resendStatus.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                                {resendStatus}
                            </p>
                        )}

                        {devToken && (
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs break-all animate-in zoom-in-95">
                                <span className="font-bold text-indigo-900 block mb-1">DEV MODE TOKEN:</span>
                                <span className="font-mono text-indigo-700 select-all">{devToken}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-6 border-t border-gray-100 text-center">
                    {(user) ? (
                        <div className="text-xs text-gray-400 mb-2">Logged in as {user.email}</div>
                    ) : null}
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        {user ? 'Sign Out' : 'Back to Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
