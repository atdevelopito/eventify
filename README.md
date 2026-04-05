# Eventify: Production-Grade Event Management Platform

Eventify is a high-performance, secure, and scalable event management solution. This repository contains the unified codebase for the backend API and the frontend application.

## 🔗 Official Repositories
*   **Backend API**: [https://github.com/eventifyfun/eventify-backend](https://github.com/eventifyfun/eventify-backend)
*   **Frontend Web**: [https://github.com/eventifyfun/eventify-frontend](https://github.com/eventifyfun/eventify-frontend)

---

## 🏛️ Architecture Overview

### Backend ([`/api`](./api))
Built with **Python + Flask**, featuring a clean service-oriented architecture:
*   **Secure QR Ticketing**: Zero-Trust HMAC-SHA256 signed payloads.
*   **Performance Cache**: Distributed **Redis** layer for sub-10ms response times.
*   **Async Workflows**: **Celery + Redis** for background email and ticket generation.
*   **Scalable Storage**: MongoDB with strategic compound indexing.
*   **Safety**: **Flask-Talisman** for CSP/HSTS and **Sentry** for crash reporting.
*   **Governance**: Shared rate-limiting across distributed clusters.

### Frontend ([`/eventify`](./eventify))
Built with **React + Vite + Tailwind CSS**:
*   **Route Splitting**: `React.lazy` implementation for fast initial paints.
*   **Animation Efficiency**: Framer Motion with `prefers-reduced-motion` detection.
*   **Responsive UX**: Premium, high-fidelity dark/light mode UI.

---

## 🚀 One-Click Deployment (Render)
The project includes a [**`render.yaml`**](./render.yaml) Blueprint.
1.  Connect your GitHub repository to Render.
2.  Enable the Blueprint.
3.  Render will automatically provision:
    *   **Web Service**: Flask API + Gunicorn.
    *   **Worker Service**: Celery background processors.
    *   **Redis**: Managed cache and message broker.

---

## 🛡️ Security Requirements
Ensure the following **Environment Variables** are set in production:
*   `MONGODB_URI`: Atlas connection string.
*   `JWT_SECRET`: Secure token signing key.
*   `QR_SECRET`: HMAC ticket signing key.
*   `REDIS_URL`: Connection string provided by Render Redis.
*   `SENTRY_DSN`: Client API key for monitoring.
*   `RESEND_SMTP_PASS`: API key for email delivery via Resend.

---

© 2026 Eventify Team. All Rights Reserved.
