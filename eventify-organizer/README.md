# Eventify Organizer Dashboard

Standalone organizer panel for event management, ticket sales, analytics, and attendee management.

## Features

- **Event Management**: Create, edit, and manage events
- **Ticket Analytics**: Track ticket sales and revenue
- **Attendee Management**: View and manage event registrations
- **Earnings Dashboard**: Monitor revenue and payouts
- **Calendar View**: Visualize event schedules
- **QR Scanner**: Check-in attendees at events
- **Reviews & Ratings**: Manage event feedback
- **Promotions**: Create and manage discount codes
- **Forms**: Custom registration forms
- **Merchandise**: Manage event merchandise

## Setup

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see main eventify repository)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your backend URL
# VITE_BACKEND_URL=http://localhost:5000 (for local dev)
# VITE_BACKEND_URL=https://api.eventify.fun (for production)

# Start development server
npm run dev
```

The app will run on `http://localhost:5174`

### Build for Production

```bash
npm run build
```

## Environment Variables

- `VITE_BACKEND_URL`: Backend API URL
- `VITE_APP_NAME`: Application name (Eventify Organizer)
- `VITE_APP_URL`: Frontend URL (for production: https://organizer.eventify.fun)

## Deployment

### Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Configure your hosting to:
   - Serve from the `dist` directory
   - Redirect all routes to `index.html` (for client-side routing)
   - Set environment variables for production

### Recommended Hosting

- **Vercel**: Automatic deployments from Git
- **Netlify**: Easy setup with redirects
- **Cloudflare Pages**: Fast global CDN

## Architecture

This is a standalone React application that:
- Uses the same backend API as the main Eventify website
- Requires `is_organizer: true` flag on user accounts
- Enforces organizer-only access at both frontend and backend levels
- Shares UI components but maintains independent codebase

## Access Control

- Users must have `is_organizer: true` in their account
- Backend enforces role checks on all `/api/organizer/*` endpoints
- Frontend redirects non-organizers to landing page

## Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **React Router 7** - Routing
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Recharts** - Analytics charts
- **Axios** - API client
- **React Hook Form** - Form management
- **Zod** - Schema validation

## Support

For issues or questions, contact the Eventify development team.
