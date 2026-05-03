# Movie Booking System - Fullstack Setup Guide

A fullstack movie ticket booking system including:

- **Backend API**: Node.js, Express, MongoDB, Mongoose, JWT
- **Customer App**: React Native with Expo
- **Admin App**: React Native with Expo
- **Payment**: VNPay integration using ngrok for return URL testing

---

## 1. Project Structure

```txt
IWS/
├── package.json                 # Root package.json
├── movie-booking-backend/       # Backend API
│   ├── package.json
│   ├── .env
│   └── seed.js
├── movie-booking-customer/      # Customer mobile app
│   ├── package.json
│   └── src/services/api.js
└── movie-booking-admin/         # Admin mobile app
    ├── package.json
    └── src/services/api.js
```

> Important: This project has multiple `package.json` files. You should install dependencies in each folder.

---

## 2. Install Dependencies

Run `npm install` in the root folder and inside each project folder.

```bash
# Root folder
cd IWS
npm install
```

```bash
# Backend
cd movie-booking-backend
npm install
```

```bash
# Customer app
cd ../movie-booking-customer
npm install --legacy-peer-deps
npm install lucide-react-native --legacy-peer-deps
npx expo install expo-blur
```

```bash
# Admin app
cd ../movie-booking-admin
npm install --legacy-peer-deps
npx expo install @react-native-community/datetimepicker
npm install lucide-react-native --legacy-peer-deps
```

---

## 3. Backend Setup

Go to the backend folder:

```bash
cd movie-booking-backend
```

Create or update the `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mobile_movie_app
JWT_SECRET=whatdadogdoin
VNP_TMNCODE=H4LXWGZX
VNP_HASHSECRET=3KO4CTBJF8XKYFUJPFXKJ1CVGWH050XK
VNP_RETURN_URL=https://overlabor-capably-vastness.ngrok-free.dev/api/payments/vnpay-return
```

Start the backend:

```bash
npm run dev
```

or:

```bash
npm start
```

The backend should run on:

```txt
http://localhost:5000
```

---

## 4. Seed Sample Data

To create sample movies, users, and initial data:

```bash
cd movie-booking-backend
node seed.js
```

---

## 5. Run Customer App

```bash
cd movie-booking-customer
npm start
```

Then choose:

- Press `a` for Android emulator
- Scan QR code using Expo Go for physical device
- Press `w` for web if supported

---

## 6. Run Admin App

```bash
cd movie-booking-admin
npm start
```

Then choose the same Expo options:

- Android emulator
- Physical device with Expo Go
- Web if supported

---

## 7. Local IP Setup

When testing on a real phone, the phone cannot use `localhost` to access the backend.

Find your computer IP address:

```bash
ipconfig
```

Example:

```txt
192.168.1.7
```

Update this value in both files:

```txt
movie-booking-customer/src/services/api.js
movie-booking-admin/src/services/api.js
```

Example:

```js
const LOCAL_IP = "192.168.1.7";
```

Make sure:

- Phone and computer are connected to the same WiFi
- Backend is running on port `5000`
- Firewall allows local network access

---

## 8. Ngrok Setup for VNPay

VNPay needs a public return URL. Use ngrok to expose your local backend.

### Install ngrok

```bash
npm install -g ngrok
```

### Start ngrok

Make sure backend is running first, then run:

```bash
ngrok http 5000
```

Ngrok will return a URL like:

```txt
https://abc123.ngrok-free.app
```

---

## 9. Configure VNPay Return URL

Update the backend VNPay return URL to use your ngrok URL.

Example:

```env
VNP_RETURN_URL=https://abc123.ngrok-free.app/api/payments/vnpay-return
```

If your backend uses a hardcoded base URL, update it too:

```js
const BASE_URL = "https://abc123.ngrok-free.app";
```

After changing ngrok URL, restart the backend:

```bash
npm run dev
```

---

## 10. Configure Frontend API URL

If you are testing payment return or using public ngrok API, update the frontend API config.

In:

```txt
movie-booking-customer/src/services/api.js
movie-booking-admin/src/services/api.js
```

Use:

```js
const PUBLIC_URL = "https://abc123.ngrok-free.app";
```

Or for local WiFi testing:

```js
const LOCAL_IP = "192.168.1.7";
const PUBLIC_URL = "";
```

---

## 11. Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin123` |
| Customer | `customer@example.com` | `customer123` |

---

## 12. Payment Flow

Normal VNPay flow:

```txt
Customer selects seats
→ Confirm booking
→ Backend creates bookingGroupId
→ Backend creates VNPay payment URL
→ Customer pays on VNPay
→ VNPay calls backend return URL
→ Backend updates paymentStatus
→ App checks bookingGroupId
→ Navigate to PaymentSuccess or PaymentFail
```

Important fields:

```txt
bookingGroupId
paymentStatus
showtime
movie
seats
totalPrice
```

The frontend should use `bookingGroupId`, not a single `bookingId`.

---

## 13. Common Git Commands

After editing code:

```bash
git add .
git commit -m "describe your changes"
git push
```

Example:

```bash
git add .
git commit -m "fix payment success screen and booking group data"
git push
```

---

## 14. Troubleshooting

### Backend cannot connect to MongoDB

Make sure MongoDB is running locally.

Default MongoDB URL:

```txt
mongodb://127.0.0.1:27017/movie-booking
```

---

### App cannot connect to backend

Check:

- Backend is running
- Phone and computer are on the same WiFi
- `LOCAL_IP` is correct
- Port `5000` is not blocked
- `PUBLIC_URL` is empty when using local IP

---

### VNPay does not return to backend

Check:

- ngrok is running
- `VNP_RETURN_URL` is correct
- Backend has been restarted after changing URL
- VNPay sandbox credentials are correct

---

### Payment success screen does not show booking data

Check that `getBookingByGroupId` returns grouped data:

```js
{
  bookingGroupId,
  seats: ["E4", "E5"],
  totalPrice,
  paymentStatus,
  showtime: {
    movie: {
      title
    }
  },
  user
}
```

The backend should populate:

```js
.populate({
  path: "showtime",
  populate: {
    path: "movie",
    model: "Movie"
  }
})
```

---

### Showtime filter shows wrong default date

Default selected date should be today:

```js
const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
```

Do not set default selected date from the first showtime if showtimes can be outside the next 7 days.

---

## 15. Notes for Development

- Always install dependencies in all project folders.
- Always restart backend after changing `.env`.
- Update ngrok URL every time ngrok restarts.
- Use `bookingGroupId` for payment and ticket confirmation.
- Keep backend running before starting mobile apps.
- Avoid using expired showtimes for payment testing.

---

## 16. Recommended Startup Order

Start services in this order:

```txt
1. MongoDB
2. Backend
3. ngrok
4. Customer app / Admin app
```

Example:

```bash
cd movie-booking-backend
npm run dev
```

Then in another terminal:

```bash
ngrok http 5000
```

Then in another terminal:

```bash
cd movie-booking-customer
npm start
```

Or:

```bash
cd movie-booking-admin
npm start
```
