import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple script to generate a QR code for mobile access
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = 'http://192.168.68.14:5174/organizer/scan'; // IP found from ipconfig

// Save to the artifacts directory so we can embed it
// Using a relative path that we'll copy later, or just save locally first
const outputPath = 'mobile-access-qr.png';

QRCode.toFile(outputPath, url, {
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    },
    width: 400
}, function (err) {
    if (err) throw err;
    console.log('QR code generated!');
});
