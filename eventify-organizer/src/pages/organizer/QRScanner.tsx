import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scanner } from '@yudiel/react-qr-scanner';
import api from "@/lib/api";
import {
    Camera,
    CheckCircle2,
    XCircle,
    User,
    Ticket,
    Calendar,
    MapPin,
    Clock,
    Zap,
    ScanLine,
    FlashlightOff,
    Flashlight,
    RotateCcw,
    History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ScanResult {
    id: string;
    status: "success" | "error" | "already_scanned";
    attendee: {
        name: string;
        email: string;
        ticketType: string;
        eventName: string;
        eventDate: string;
        eventLocation: string;
        seat?: string;
    };
    scannedAt: Date;
}

export function ScannerPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
    const [manualCode, setManualCode] = useState("");
    const [processing, setProcessing] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Validate Ticket against Backend
    const validateTicket = async (code: string) => {
        if (processing) return;
        setProcessing(true);
        setIsScanning(false); // Stop scanning immediately

        try {
            const token = localStorage.getItem('token');
            // Assume api.js might handle it, but being explicit is safer for now
            const { data } = await api.post('/tickets/validate',
                { qr_token: code },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Validation Res:", data);

            if (data.valid) {
                // Success
                const result: ScanResult = {
                    id: data.ticket_id || code,
                    status: "success",
                    attendee: {
                        name: "Attendee", // Backend doesn't send name in validate response yet? I saw it returns ticket_id.
                        // Backend 'validate' response (Line 207 in ticket_routes.py) sends: valid, message, ticket_id, ticket_type.
                        // It does NOT send name/email. I might want to fetch details or just show "Verified".
                        // I'll show "Verified" for now.
                        email: "Verified Ticket",
                        ticketType: data.ticket_type || "Standard",
                        eventName: "Event",
                        eventDate: new Date().toLocaleDateString(),
                        eventLocation: "Venue"
                    },
                    scannedAt: new Date()
                };
                setScanResult(result);
                setRecentScans(prev => [result, ...prev].slice(0, 10));
                toast.success("Ticket Verified Successfully!");
            } else {
                // Invalid or Already Used
                let status: "error" | "already_scanned" = "error";
                if (data.message && data.message.includes("already used")) {
                    status = "already_scanned";
                }

                const result: ScanResult = {
                    id: code,
                    status: status,
                    attendee: {
                        name: "Unknown",
                        email: "Unknown",
                        ticketType: "Unknown",
                        eventName: "-",
                        eventDate: "-",
                        eventLocation: "-"
                    },
                    scannedAt: new Date()
                };
                setScanResult(result);
                setRecentScans(prev => [result, ...prev].slice(0, 10));

                if (status === 'already_scanned') toast.warning("Ticket Already Used");
                else toast.error(data.message || "Invalid Ticket");
            }

        } catch (err: any) {
            console.error("Scan Error:", err);
            const result: ScanResult = {
                id: code,
                status: "error",
                attendee: { name: "Error", email: "-", ticketType: "-", eventName: "-", eventDate: "-", eventLocation: "-" },
                scannedAt: new Date()
            };
            setScanResult(result);
            toast.error("Failed to validate ticket");
        } finally {
            setProcessing(false);
            setManualCode("");
        }
    };

    const clearResult = () => {
        setScanResult(null);
    };

    const getStatusConfig = (status: ScanResult["status"]) => {
        switch (status) {
            case "success":
                return {
                    icon: CheckCircle2,
                    color: "text-success",
                    bg: "bg-success/10",
                    border: "border-success/30",
                    title: "Check-in Successful",
                    subtitle: "Ticket valid & verified",
                };
            case "already_scanned":
                return {
                    icon: XCircle,
                    color: "text-warning",
                    bg: "bg-warning/10",
                    border: "border-warning/30",
                    title: "Already Checked In",
                    subtitle: "Ticket was scanned before",
                };
            case "error":
                return {
                    icon: XCircle,
                    color: "text-destructive",
                    bg: "bg-destructive/10",
                    border: "border-destructive/30",
                    title: "Invalid Ticket",
                    subtitle: "QR code not recognized",
                };
        }
    };

    return (
        <div className="space-y-6 pb-24 md:pb-0">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-foreground">QR Scanner</h1>
                        <p className="text-muted-foreground">Scan attendee tickets for quick check-in</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                            <Zap className="w-4 h-4" />
                            <span>{recentScans.filter(s => s.status === "success").length} checked in</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Scanner View */}
                    <Card className="overflow-hidden flex flex-col min-h-[400px]">
                        <CardContent className="p-0 flex-1 flex flex-col">
                            {isScanning ? (
                                <div className="w-full h-full relative bg-black">
                                    {!cameraError ? (
                                        <Scanner
                                            onScan={(results) => {
                                                if (results && results.length > 0) {
                                                    validateTicket(results[0].rawValue);
                                                }
                                            }}
                                            onError={(err: any) => {
                                                console.error(err);
                                                // Only show secure context error once
                                                const isSecureContextError = err?.name === 'NotAllowedError' || err?.message?.includes('secure context');
                                                setCameraError(isSecureContextError ? 'RUNNING_ON_INSECURE_ORIGIN' : (err?.message || "Camera failed"));
                                                setIsScanning(false);
                                            }}
                                            components={{
                                                finder: false,
                                            }}
                                            styles={{
                                                container: { width: '100%', height: '100%' },
                                                video: { width: '100%', height: '100%', objectFit: 'cover' }
                                            }}
                                        />
                                    ) : null}

                                    {/* Scanner Overlay - Only show if no error */}
                                    {!cameraError && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}

                                    {/* Scanner Frame - Only show if no error */}
                                    {!cameraError && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="relative w-64 h-64">
                                                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg" />
                                                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg" />
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg" />
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg" />

                                                <motion.div
                                                    className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                                                    animate={{ top: ["10%", "90%", "10%"] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Controls */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="rounded-full bg-background/90 backdrop-blur-sm"
                                            onClick={() => {
                                                setIsScanning(false);
                                                setCameraError(null);
                                            }}
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 p-8 text-center bg-white w-full h-full justify-center">
                                    {cameraError ? (
                                        <div className="max-w-md w-full bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                                            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                                                <FlashlightOff className="w-6 h-6 text-destructive" />
                                            </div>
                                            <h3 className="text-lg font-bold text-destructive mb-2">Camera Blocked</h3>

                                            {cameraError === 'RUNNING_ON_INSECURE_ORIGIN' ? (
                                                <div className="text-sm text-muted-foreground space-y-4">
                                                    <p>Broswers block camera access on local IP addresses for security.</p>

                                                    <div className="bg-background rounded-lg p-3 text-left text-xs border border-border">
                                                        <p className="font-semibold mb-1">To Fix (Chrome/Android):</p>
                                                        <ol className="list-decimal list-inside space-y-1">
                                                            <li>Go to <code className="bg-muted px-1 rounded">chrome://flags</code></li>
                                                            <li>Search "Insecure origins treated as secure"</li>
                                                            <li>Enable it and add: <code className="bg-muted px-1 rounded">{window.location.origin}</code></li>
                                                            <li>Relaunch Chrome</li>
                                                        </ol>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    {cameraError}
                                                </p>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="mt-6 w-full"
                                                onClick={() => {
                                                    setCameraError(null);
                                                    setIsScanning(true);
                                                }}
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <motion.div
                                                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Camera className="w-10 h-10 text-primary" />
                                            </motion.div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-foreground">Ready to Scan</h3>
                                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                    Point your camera at the attendee's QR code to verify their ticket
                                                </p>
                                            </div>
                                            <Button
                                                size="lg"
                                                onClick={() => setIsScanning(true)}
                                                className="rounded-full px-8 bg-[#E85A6B] hover:bg-[#d64d5e] text-white border-0"
                                            >
                                                <Camera className="w-5 h-5 mr-2" />
                                                Start Camera
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Manual Entry Footer */}
                            <div className="p-4 bg-background border-t border-border/40">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Enter ticket code manually"
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        onKeyDown={(e) => e.key === 'Enter' && validateTicket(manualCode)}
                                    />
                                    <Button
                                        onClick={() => validateTicket(manualCode)}
                                        disabled={processing || !manualCode}
                                        className="bg-[#E85A6B]/10 text-[#E85A6B] hover:bg-[#E85A6B]/20 border border-[#E85A6B]/20"
                                    >
                                        {processing ? <ScanLine className="w-4 h-4 mr-2 animate-spin" /> : <ScanLine className="w-4 h-4 mr-2" />}
                                        Scan
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Result / Recent Scans */}
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            {scanResult ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className={cn(
                                        "border-2",
                                        getStatusConfig(scanResult.status).border
                                    )}>
                                        <CardContent className="p-6">
                                            {/* Status Header */}
                                            <div className={cn(
                                                "flex items-center gap-4 p-4 rounded-lg mb-6",
                                                getStatusConfig(scanResult.status).bg
                                            )}>
                                                {(() => {
                                                    const StatusIcon = getStatusConfig(scanResult.status).icon;
                                                    return (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                        >
                                                            <StatusIcon className={cn(
                                                                "w-12 h-12",
                                                                getStatusConfig(scanResult.status).color
                                                            )} />
                                                        </motion.div>
                                                    );
                                                })()}
                                                <div>
                                                    <h3 className={cn(
                                                        "text-lg font-bold",
                                                        getStatusConfig(scanResult.status).color
                                                    )}>
                                                        {getStatusConfig(scanResult.status).title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getStatusConfig(scanResult.status).subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Attendee Info */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-7 h-7 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-foreground">{scanResult.attendee.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{scanResult.attendee.email}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                                        <Ticket className="w-4 h-4 text-primary" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Ticket Type</p>
                                                            <p className="text-sm font-medium text-foreground">{scanResult.attendee.ticketType}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                className="w-full mt-6"
                                                onClick={clearResult}
                                            >
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Scan Next Ticket
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="recent"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <History className="w-5 h-5 text-muted-foreground" />
                                                <h3 className="font-semibold text-foreground">Recent Scans</h3>
                                            </div>

                                            {recentScans.length > 0 ? (
                                                <div className="space-y-3">
                                                    {recentScans.slice(0, 5).map((scan, index) => (
                                                        <motion.div
                                                            key={`${scan.id}-${index}`}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                                                        >
                                                            {scan.status === "success" ? (
                                                                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-warning flex-shrink-0" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">
                                                                    {scan.id}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {scan.attendee.ticketType}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Clock className="w-3 h-3" />
                                                                {scan.scannedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                        <ScanLine className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        No scans yet. Start scanning to see results here.
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-foreground">{recentScans.length}</p>
                                    <p className="text-xs text-muted-foreground">Total Scans</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-success">
                                        {recentScans.filter(s => s.status === "success").length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Checked In</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <p className="text-2xl font-bold text-warning">
                                        {recentScans.filter(s => s.status === "already_scanned").length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Duplicates</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default ScannerPage;
