import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface TicketQRCodeProps {
    ticketId: string;
    size?: number;
    className?: string;
}

/**
 * Production-ready QR Code component for Eventify tickets
 * Encodes: "EVENTIFY:TICKET:{ticketId}"
 * Uses qrcode library for reliable generation
 */
const TicketQRCode: React.FC<TicketQRCodeProps> = ({
    ticketId,
    size = 256,
    className = ''
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !ticketId) return;

        const qrData = `EVENTIFY:TICKET:${ticketId}`;

        QRCode.toCanvas(
            canvasRef.current,
            qrData,
            {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'H', // High error correction for better scanning
            },
            (error) => {
                if (error) {
                    console.error('QR Code generation error:', error);
                }
            }
        );
    }, [ticketId, size]);

    return (
        <div className={`inline-block ${className}`}>
            <canvas
                ref={canvasRef}
                className="border-2 border-black"
                aria-label={`QR Code for ticket ${ticketId}`}
            />
        </div>
    );
};

export default TicketQRCode;
