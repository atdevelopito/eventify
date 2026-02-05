"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useRole } from "@/components/RoleContext";
import { toast } from "@/components/ui/toast";
import { SEOHead } from "@/components/SEOHead";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface PupilProps {
    size?: number;
    maxDistance?: number;
    pupilColor?: string;
    forceLookX?: number;
    forceLookY?: number;
}

const Pupil = ({
    size = 12,
    maxDistance = 5,
    pupilColor = "black",
    forceLookX,
    forceLookY
}: PupilProps) => {
    const [mouseX, setMouseX] = useState<number>(0);
    const [mouseY, setMouseY] = useState<number>(0);
    const pupilRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const calculatePupilPosition = () => {
        if (!pupilRef.current) return { x: 0, y: 0 };

        if (forceLookX !== undefined && forceLookY !== undefined) {
            return { x: forceLookX, y: forceLookY };
        }

        const pupil = pupilRef.current.getBoundingClientRect();
        const pupilCenterX = pupil.left + pupil.width / 2;
        const pupilCenterY = pupil.top + pupil.height / 2;

        const deltaX = mouseX - pupilCenterX;
        const deltaY = mouseY - pupilCenterY;
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

        const angle = Math.atan2(deltaY, deltaX);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return { x, y };
    };

    const pupilPosition = calculatePupilPosition();

    return (
        <div
            ref={pupilRef}
            className="rounded-full"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: pupilColor,
                transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
                transition: 'transform 0.1s ease-out',
            }}
        />
    );
};

interface EyeBallProps {
    size?: number;
    pupilSize?: number;
    maxDistance?: number;
    eyeColor?: string;
    pupilColor?: string;
    isBlinking?: boolean;
    forceLookX?: number;
    forceLookY?: number;
}

const EyeBall = ({
    size = 48,
    pupilSize = 16,
    maxDistance = 10,
    eyeColor = "white",
    pupilColor = "black",
    isBlinking = false,
    forceLookX,
    forceLookY
}: EyeBallProps) => {
    const [mouseX, setMouseX] = useState<number>(0);
    const [mouseY, setMouseY] = useState<number>(0);
    const eyeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const calculatePupilPosition = () => {
        if (!eyeRef.current) return { x: 0, y: 0 };

        if (forceLookX !== undefined && forceLookY !== undefined) {
            return { x: forceLookX, y: forceLookY };
        }

        const eye = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = eye.left + eye.width / 2;
        const eyeCenterY = eye.top + eye.height / 2;

        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

        const angle = Math.atan2(deltaY, deltaX);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return { x, y };
    };

    const pupilPosition = calculatePupilPosition();

    return (
        <div
            ref={eyeRef}
            className="rounded-full flex items-center justify-center transition-all duration-150"
            style={{
                width: `${size}px`,
                height: isBlinking ? '2px' : `${size}px`,
                backgroundColor: eyeColor,
                overflow: 'hidden',
            }}
        >
            {!isBlinking && (
                <div
                    className="rounded-full"
                    style={{
                        width: `${pupilSize}px`,
                        height: `${pupilSize}px`,
                        backgroundColor: pupilColor,
                        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
                        transition: 'transform 0.1s ease-out',
                    }}
                />
            )}
        </div>
    );
};

function AnimatedAuth() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, loading: authLoading, login } = useRole();

    // Route state
    const [isLogin, setIsLogin] = useState(() => {
        const params = new URLSearchParams(location.search);
        if (location.pathname.includes('/signup')) return false;
        if (location.pathname.includes('/login')) return true;
        return params.get('mode') !== 'signup';
    });

    // New state for forgot password view
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    useEffect(() => {
        if (location.pathname.includes('/signup')) {
            setIsLogin(false);
            setIsForgotPassword(false);
        } else if (location.pathname.includes('/login')) {
            setIsLogin(true);
            setIsForgotPassword(false);
        }
    }, [location.pathname]);

    // Auth Redirect Logic
    useEffect(() => {
        if (!authLoading && user) {
            if (!user.is_verified && !user.verified) {
                navigate('/verify');
                return;
            }
            const params = new URLSearchParams(location.search);
            const nextParam = params.get('next');
            const from = nextParam || (location.state as any)?.from?.pathname || (role === 'admin' ? '/organizer' : '/');
            navigate(from, { replace: true });
        }
    }, [user, role, authLoading, navigate, location]);


    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    // Animation State
    const [mouseX, setMouseX] = useState<number>(0);
    const [mouseY, setMouseY] = useState<number>(0);
    const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
    const [isBlackBlinking, setIsBlackBlinking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
    const [isPurplePeeking, setIsPurplePeeking] = useState(false);
    const purpleRef = useRef<HTMLDivElement>(null);
    const blackRef = useRef<HTMLDivElement>(null);
    const yellowRef = useRef<HTMLDivElement>(null);
    const orangeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX);
            setMouseY(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsPurpleBlinking(true);
                setTimeout(() => {
                    setIsPurpleBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());
            return blinkTimeout;
        };
        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
        const scheduleBlink = () => {
            const blinkTimeout = setTimeout(() => {
                setIsBlackBlinking(true);
                setTimeout(() => {
                    setIsBlackBlinking(false);
                    scheduleBlink();
                }, 150);
            }, getRandomBlinkInterval());
            return blinkTimeout;
        };
        const timeout = scheduleBlink();
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (isTyping) {
            setIsLookingAtEachOther(true);
            const timer = setTimeout(() => {
                setIsLookingAtEachOther(false);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsLookingAtEachOther(false);
        }
    }, [isTyping]);

    useEffect(() => {
        if (password.length > 0 && showPassword) {
            const schedulePeek = () => {
                const peekInterval = setTimeout(() => {
                    setIsPurplePeeking(true);
                    setTimeout(() => {
                        setIsPurplePeeking(false);
                        setIsPurpleBlinking(true);
                        setTimeout(() => setIsPurpleBlinking(false), 150);
                    }, 800);
                }, Math.random() * 3000 + 2000);
                return peekInterval;
            };
            const firstPeek = schedulePeek();
            return () => clearTimeout(firstPeek);
        } else {
            setIsPurplePeeking(false);
        }
    }, [password, showPassword, isPurplePeeking]);

    const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return { faceX: 0, faceY: 0, bodyRotation: 0 };
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        const faceX = Math.max(-15, Math.min(15, deltaX / 20));
        const faceY = Math.max(-10, Math.min(10, deltaY / 30));
        const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
        return { faceX, faceY, bodySkew };
    };

    const purplePos = calculatePosition(purpleRef);
    const blackPos = calculatePosition(blackRef);
    const yellowPos = calculatePosition(yellowRef);
    const orangePos = calculatePosition(orangeRef);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isForgotPassword) {
                // FORGOT PASSWORD
                await api.post('/auth/forgot-password', { email });
                toast.success('Check your email for password reset instructions.', { title: 'Reset Link Sent' });
                setIsForgotPassword(false);
                setIsLogin(true); // Back to login
            } else if (isLogin) {
                // LOGIN
                const { data } = await api.post('/auth/login', { email, password });
                login(data.token, data);
                toast.success('Logged in successfully', { title: 'Success' });
            } else {
                // SIGNUP
                const payload = { name, email, password };
                const { data } = await api.post('/auth/register', payload);
                login(data.token, data);
                toast.success('Account created successfully', { title: 'Success' });
                navigate('/verify');
            }
        } catch (error: any) {
            console.error("Auth Error:", error.response?.data);
            const msg = error.response?.data?.message || 'Something went wrong';
            setError(msg);
            toast.error(msg, { title: 'Error' });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        if (isForgotPassword) {
            setIsForgotPassword(false);
            setIsLogin(true);
        } else {
            setIsLogin(!isLogin);
        }
        setError("");
        // Optionally wipe form state or keep it
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <SEOHead
                title={isForgotPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Sign Up'}
                description={isLogin ? 'Sign in to manage your events' : 'Create an account to manage events'}
            />
            {/* Left Content Section */}
            <div className="relative hidden lg:flex flex-col justify-between bg-[#111] p-12 text-white overflow-hidden">
                <div className="relative z-20">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>Eventify</span>
                    </div>
                </div>

                <div className="relative z-20 flex-1 flex items-end justify-center pb-20">
                    {/* Cartoon characters container */}
                    <div className="relative" style={{ width: '550px', height: '400px' }}>
                        {/* Purple Character */}
                        <div
                            ref={purpleRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '70px',
                                width: '180px',
                                height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px',
                                backgroundColor: '#6C3FF5',
                                borderRadius: '10px 10px 0 0',
                                zIndex: 1,
                                transform: (password.length > 0 && showPassword)
                                    ? `skewX(0deg)`
                                    : (isTyping || (password.length > 0 && !showPassword))
                                        ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                                        : `skewX(${purplePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                                    top: (password.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                                }}
                            >
                                <EyeBall
                                    size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                                />
                                <EyeBall
                                    size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D"
                                    isBlinking={isPurpleBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Black Character */}
                        <div
                            ref={blackRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '240px',
                                width: '120px',
                                height: '310px',
                                backgroundColor: '#2D2D2D',
                                borderRadius: '8px 8px 0 0',
                                zIndex: 2,
                                transform: (password.length > 0 && showPassword)
                                    ? `skewX(0deg)`
                                    : isLookingAtEachOther
                                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                                        : (isTyping || (password.length > 0 && !showPassword))
                                            ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                                            : `skewX(${blackPos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                                    top: (password.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                                }}
                            >
                                <EyeBall
                                    size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                                />
                                <EyeBall
                                    size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D"
                                    isBlinking={isBlackBlinking}
                                    forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                                    forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                                />
                            </div>
                        </div>

                        {/* Orange Character */}
                        <div
                            ref={orangeRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '0px',
                                width: '240px',
                                height: '200px',
                                zIndex: 3,
                                backgroundColor: '#FF9B6B',
                                borderRadius: '120px 120px 0 0',
                                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-8 transition-all duration-200 ease-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${50}px` : `${82 + (orangePos.faceX || 0)}px`,
                                    top: (password.length > 0 && showPassword) ? `${85}px` : `${90 + (orangePos.faceY || 0)}px`,
                                }}
                            >
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                        </div>

                        {/* Yellow Character */}
                        <div
                            ref={yellowRef}
                            className="absolute bottom-0 transition-all duration-700 ease-in-out"
                            style={{
                                left: '310px',
                                width: '140px',
                                height: '230px',
                                backgroundColor: '#E8D754',
                                borderRadius: '70px 70px 0 0',
                                zIndex: 4,
                                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                                transformOrigin: 'bottom center',
                            }}
                        >
                            <div
                                className="absolute flex gap-6 transition-all duration-200 ease-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${20}px` : `${52 + (yellowPos.faceX || 0)}px`,
                                    top: (password.length > 0 && showPassword) ? `${35}px` : `${40 + (yellowPos.faceY || 0)}px`,
                                }}
                            >
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                            </div>
                            <div
                                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                                style={{
                                    left: (password.length > 0 && showPassword) ? `${10}px` : `${40 + (yellowPos.faceX || 0)}px`,
                                    top: (password.length > 0 && showPassword) ? `${88}px` : `${88 + (yellowPos.faceY || 0)}px`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="relative z-20 flex items-center gap-8 text-sm text-white/50">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>

                {/* Decorative elements */}
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="absolute top-1/4 right-1/4 size-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Right Login Section */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[420px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
                        <div className="size-8 rounded-lg bg-black text-white flex items-center justify-center">
                            <Sparkles className="size-4" />
                        </div>
                        <span>Eventify</span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            {isForgotPassword ? "Reset Password" : isLogin ? "Welcome back!" : "Create an account"}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isForgotPassword ? "Enter your email to receive a reset link" : isLogin ? "Please enter your details to sign in" : "Enter your info below to get started"}
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isForgotPassword ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        autoComplete="email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setIsTyping(true)}
                                        onBlur={() => setIsTyping(false)}
                                        required
                                        className="h-12 bg-background border-border/60 focus:border-black"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>
                                </div>
                            </div>
                        ) : !isLogin ? (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    autoComplete="name"
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={() => setIsTyping(true)}
                                    onBlur={() => setIsTyping(false)}
                                    required={!isLogin}
                                    className="h-12 bg-background border-border/60 focus:border-black"
                                />
                            </div>
                        ) : null}

                        {!isForgotPassword && (
                            <>
                                {isLogin && (
                                    // Only show email input if not already shown in forgot password block (which is exclusive)
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            autoComplete="email"
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setIsTyping(true)}
                                            onBlur={() => setIsTyping(false)}
                                            required
                                            className="h-12 bg-background border-border/60 focus:border-black"
                                        />
                                    </div>
                                )}
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            autoComplete="email"
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setIsTyping(true)}
                                            onBlur={() => setIsTyping(false)}
                                            required
                                            className="h-12 bg-background border-border/60 focus:border-black"
                                        />
                                    </div>
                                )}
                            </>
                        )}


                        {!isForgotPassword && (
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsTyping(true)}
                                        onBlur={() => setIsTyping(false)}
                                        required
                                        className="h-12 pr-10 bg-background border-border/60 focus:border-black"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-5" />
                                        ) : (
                                            <Eye className="size-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLogin && !isForgotPassword && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        Remember for 30 days
                                    </Label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPassword(true)}
                                    className="text-sm text-black hover:underline font-medium"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                                {error}
                            </div>
                        )}

                        <InteractiveHoverButton
                            type="submit"
                            className="w-full h-12 text-base font-medium"
                            disabled={isLoading}
                            text={isLoading ? "Please wait..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Log in" : "Sign up"}
                        />
                    </form>

                    {/* Social Login - Hide on forgot password */}
                    {!isForgotPassword && (
                        <div className="mt-6">
                            <InteractiveHoverButton
                                className="w-full h-12 bg-background border-border/60 hover:bg-accent text-black"
                                type="button"
                                text={isLogin ? "Log in with Google" : "Sign up with Google"}
                            />
                        </div>
                    )}

                    {/* Toggle Link */}
                    <div className="text-center text-sm text-muted-foreground mt-8">
                        {isForgotPassword ? (
                            <button onClick={() => { setIsForgotPassword(false); setIsLogin(true); }} className="text-foreground font-medium hover:underline flex items-center justify-center gap-1 mx-auto">
                                <ArrowRight className="rotate-180 size-3" /> Back to Login
                            </button>
                        ) : (
                            <>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button onClick={toggleMode} className="text-foreground font-medium hover:underline">
                                    {isLogin ? "Sign Up" : "Log In"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimatedAuth;
