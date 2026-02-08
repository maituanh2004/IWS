# Movie Booking - Admin App

React Native (Expo) admin panel for managing movies and showtimes.

## Features

- Admin authentication
- Movie CRUD operations
- Showtime CRUD operations
- Dark theme UI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API

Update the API URL in `src/services/api.js`:

```javascript
// For physical device testing, use your computer's IP address
const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';

// For emulator
const API_URL = 'http://localhost:5000/api';
```

### 3. Run App

```bash
npx expo start
```

## Admin Login

Use an admin account created on the backend. If you don't have one:

1. Use the backend API to register with role "admin"
2. Or create via backend directly

## Screens

1. **Login** - Admin authentication (admin role required)
2. **Movie Management** - List, create, edit, delete movies
3. **Add/Edit Movie** - Movie form
4. **Showtime Management** - List, create, edit, delete showtimes
5. **Add/Edit Showtime** - Showtime form with movie picker

## Usage

### Managing Movies

1. Login with admin credentials
2. View all movies on the main screen
3. Tap "+" to add a new movie
4. Tap "Edit" to modify a movie
5. Tap "Delete" to remove a movie

### Managing Showtimes

1. From Movie Management, tap "Showtimes"
2. View all showtimes
3. Tap "+" to add a new showtime
4. Select movie, date/time, room, and price
5. Edit or delete existing showtimes
