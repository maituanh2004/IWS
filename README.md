# Movie Booking System - Unified Workspace

A fullstack movie ticket booking system with a consolidated dependency structure for reduced disk occupancy.

## Project Structure

This project uses **npm workspaces** to manage dependencies in a single `node_modules` folder at the root.

```
d:/IWS/
├── package.json               # Root manifest with workspace configuration
├── node_modules/              # Unified dependencies for ALL projects
├── movie-booking-backend/     # NodeJS + Express + MongoDB API
├── movie-booking-customer/    # React Native customer app
└── movie-booking-admin/       # React Native admin app
```

## Setup & Quick Start

### 1. Installation
Install all dependencies for all projects from the root directory:
```bash
npm install
```

### 2. Run Projects
You can run all components directly from the root:

| Command | Action |
|---------|--------|
| `npm run backend` | Starts the Backend API (port 5000) |
| `npm run admin` | Starts the Admin Expo App |
| `npm run customer` | Starts the Customer Expo App |

### 3. Initialize Data
To create sample movies and users, run the seed script:
```bash
cd movie-booking-backend
node seed.js
```

## Development & Testing

### Testing on Physical Device
The mobile apps are configured to connect to the backend via your local IP. 
Current IP: `192.168.1.7`

If your IP changes, update the return value in:
- `movie-booking-admin/src/services/api.js`
- `movie-booking-customer/src/services/api.js`

### Authentication Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@example.com` | `admin123` |
| **Customer** | `customer@example.com` | `customer123` |

## Technical Details

- **Backend**: NodeJS, Express, MongoDB, Mongoose, JWT.
- **Frontend**: React Native (Expo), React Navigation, Axios.
- **Management**: Unified `node_modules` via npm workspaces at root.

## Troubleshooting

- **MongoDB**: Ensure MongoDB is running locally on port `27017` or update the `.env` in `movie-booking-backend`.
- **Network Error**: Ensure your phone and computer are on the same WiFi network and use the correct local IP.
- **Port 5000**: Required for the backend API.
