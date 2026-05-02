const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const connectDB = require('./src/config/database');

const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Showtime = require('./src/models/Showtime');
const Booking = require('./src/models/Booking');
const Discount = require('./src/models/Discount');

// =============================
// HELPER
// =============================
const getRoomCapacity = (room) => {
  return Number(room) <= 5 ? 80 : 100;
};

// =============================
// SEED DATA
// =============================
const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await Booking.deleteMany({});
    await Discount.deleteMany({});

    // =============================
    // USERS
    // =============================
    console.log('👤 Creating users...');

    const users = await User.create([
      { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { name: 'John Doe', email: 'customer@example.com', password: 'customer123', role: 'customer' },
      { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'customer' },
      { name: 'Bob Smith', email: 'bob@example.com', password: 'password123', role: 'customer' }
    ]);

    const admin = users[0];
    const customer = users[1];
    const otherCustomers = users.slice(2);

    // =============================
    // MOVIES
    // =============================
    console.log('🎬 Creating movies...');

    const movies = await Movie.create([
      {
        title: 'Avengers: Endgame',
        description: 'The Avengers assemble once more in order to restore balance to the universe.',
        duration: 181, genre: 'Action, Sci-Fi', releaseDate: new Date('2019-04-26'),
        price: 100000, poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', rating: 8.4
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology.',
        duration: 148, genre: 'Sci-Fi, Adventure', releaseDate: new Date('2010-07-16'),
        price: 95000, poster: 'https://media.themoviedb.org/t/p/w600_and_h900_face/eBtqGWtR5KUiNl6OXHLR3ri6nVm.jpg', rating: 8.8
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space.',
        duration: 169, genre: 'Sci-Fi, Drama', releaseDate: new Date('2014-11-07'),
        price: 110000, poster: 'https://media.themoviedb.org/t/p/w600_and_h900_face/if4TI9LbqNIrzkoOgWjX5PZYDYe.jpg', rating: 8.7
      }
    ]);

    // =============================
    // SHOWTIME
    // =============================
    console.log('🕒 Creating showtimes...');
    const now = new Date();
    const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    const showtimes = await Showtime.create([
      // Future Showtimes
      { movie: movies[0]._id, startTime: addDays(1), endTime: addDays(1.1), room: '1', totalSeats: 80, basePrice: 100000 },
      { movie: movies[1]._id, startTime: addDays(2), endTime: addDays(2.1), room: '2', totalSeats: 80, basePrice: 95000 },
      { movie: movies[2]._id, startTime: addDays(3), endTime: addDays(3.1), room: '5', totalSeats: 80, basePrice: 110000 },
      // Past Showtime (for history)
      { movie: movies[0]._id, startTime: addDays(-2), endTime: addDays(-1.9), room: '3', totalSeats: 80, basePrice: 100000 }
    ]);

    // =============================
    // BOOKINGS (The "Booked Data")
    // =============================
    console.log('🎟 Creating bookings...');

    const bookingsData = [];

    // 1. Confirmed Upcoming Booking for primary customer (John Doe)
    const group1 = new mongoose.Types.ObjectId();
    bookingsData.push(
      { user: customer._id, showtime: showtimes[0]._id, seat: 'A5', bookingGroupId: group1, totalPrice: 100000, status: 'CONFIRMED', paymentStatus: 'SUCCESS' },
      { user: customer._id, showtime: showtimes[0]._id, seat: 'A6', bookingGroupId: group1, totalPrice: 100000, status: 'CONFIRMED', paymentStatus: 'SUCCESS' }
    );

    // 2.  (Past) Booking for John Doe
    const group2 = new mongoose.Types.ObjectId();
    bookingsData.push(
      { user: customer._id, showtime: showtimes[3]._id, seat: 'C10', bookingGroupId: group2, totalPrice: 100000, status: 'CONFIRMED', paymentStatus: 'SUCCESS' }
    );

    // 3. Pending Booking for John Doe (to test countdown/expiry)
    const group3 = new mongoose.Types.ObjectId();
    bookingsData.push(
      { user: customer._id, showtime: showtimes[1]._id, seat: 'B1', bookingGroupId: group3, totalPrice: 95000, status: 'PENDING', paymentStatus: 'PENDING', expiresAt: new Date(now.getTime() + 10 * 60 * 1000) }
    );

    // 4. Some bookings for other customers to fill up Admin Occupancy
    for (let i = 0; i < 10; i++) {
      const c = otherCustomers[i % otherCustomers.length];
      const s = showtimes[i % 3];

      // 👉 xác định số ghế theo room
      const roomNumber = Number(s.room);
      const totalSeats = roomNumber <= 5 ? 80 : 100;

      const rowsCount = totalSeats === 80 ? 8 : 10;
      const colsCount = 10;

      const rows = Array.from({ length: rowsCount }, (_, idx) =>
        String.fromCharCode(65 + idx) // A, B, C...
      );

      const row = rows[i % rows.length];
      const col = (i % colsCount) + 1;

      bookingsData.push({
        user: c._id,
        showtime: s._id,
        seat: `${row}${col}`, // ✅ luôn hợp lệ theo room
        bookingGroupId: new mongoose.Types.ObjectId(),
        totalPrice: s.basePrice,
        status: 'CONFIRMED',
        paymentStatus: 'SUCCESS'
      });
    }

    await Booking.create(bookingsData);

    // =============================
    // DISCOUNT
    // =============================
    console.log('💸 Creating discounts...');
    await Discount.create([
      { code: 'WELCOME20', description: '20% off for first booking', percentage: 20, minPrice: 0, expiryDate: new Date('2026-12-31') },
      { code: 'MOVIE50', description: 'Save $50 on $200', percentage: 15, minPrice: 200000, expiryDate: new Date('2026-12-31') }
    ]);

    console.log('✅ Seed completed successfully!');
    console.log('-----------------------------------');
    console.log('Customer login: customer@example.com / customer123');
    console.log('Admin login: admin@example.com / admin123');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedData();