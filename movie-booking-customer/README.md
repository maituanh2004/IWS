# Movie Booking - Customer App

React Native (Expo) mobile app for customers to browse movies and book tickets.

## Features

- Browse available movies
- View movie details
- Select showtimes
- Interactive seat selection
- Book tickets
- View booking history
- User authentication

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

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

## Screens

1. **Login** - User authentication
2. **Register** - New user registration  
3. **Movie List** - Browse all movies
4. **Movie Detail** - View movie information
5. **Showtime List** - Available showtimes for a movie
6. **Seat Selection** - Interactive seat grid
7. **Booking History** - User's past bookings

## Usage

1. Register a new account or login
2. Browse movies on the home screen
3. Tap a movie to view details
4. Select "View Showtimes"
5. Choose a showtime
6. Select your seats on the seat grid
7. Confirm booking
8. View your bookings in History
