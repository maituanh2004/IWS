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
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer'
      }
    ]);

    const user = users[1];

    // =============================
    // MOVIES
    // =============================
    console.log('🎬 Creating movies...');

    const movies = await Movie.create([
    {
        title: 'Avengers: Endgame',
        description: 'Superheroes unite to defeat Thanos.',
        duration: 181,
        genre: 'Action',
        releaseDate: new Date('2019-04-26'),
        price: 100000
    },
    {
        title: 'Inception',
        description: 'Dream within a dream.',
        duration: 148,
        genre: 'Sci-Fi',
        releaseDate: new Date('2010-07-16'),
        price: 95000
    },
    {
        title: 'Interstellar',
        description: 'Space exploration to save humanity.',
        duration: 169,
        genre: 'Sci-Fi',
        releaseDate: new Date('2014-11-07'),
        price: 110000
    },
    {
        title: 'The Dark Knight',
        description: 'Batman vs Joker.',
        duration: 152,
        genre: 'Action',
        releaseDate: new Date('2008-07-18'),
        price: 100000
    },
    {
        title: 'Parasite',
        description: 'A dark comedy thriller.',
        duration: 132,
        genre: 'Drama',
        releaseDate: new Date('2019-05-30'),
        price: 90000
    }
    ]);

    const avengers = movies[0];

    // =============================
    // SHOWTIME
    // =============================
    const now = new Date();

    const addHours = (hours) => {
        return new Date(now.getTime() + hours * 60 * 60 * 1000);
    };
    
    console.log('🕒 Creating showtimes...');

    const showtimes = await Showtime.create([
    // ROOM 1
    {
        movie: movies[0]._id,
        startTime: addHours(2),
        endTime: addHours(5),
        room: '1',
        totalSeats: getRoomCapacity('1'),
        basePrice: 100000
    },
    {
        movie: movies[1]._id,
        startTime: addHours(6),
        endTime: addHours(9),
        room: '1',
        totalSeats: getRoomCapacity('1'),
        basePrice: 100000
    },

    // ROOM 2
    {
        movie: movies[2]._id,
        startTime: addHours(2),
        endTime: addHours(5),
        room: '2',
        totalSeats: getRoomCapacity('2'),
        basePrice: 110000
    },
    {
        movie: movies[3]._id,
        startTime: addHours(6),
        endTime: addHours(9),
        room: '2',
        totalSeats: getRoomCapacity('2'),
        basePrice: 110000
    },

    // ROOM 6 (100 seats)
    {
        movie: movies[4]._id,
        startTime: addHours(3),
        endTime: addHours(6),
        room: '6',
        totalSeats: getRoomCapacity('6'),
        basePrice: 120000
    },

    // NEXT DAY
    {
        movie: movies[0]._id,
        startTime: addHours(24 + 2),
        endTime: addHours(24 + 5),
        room: '3',
        totalSeats: getRoomCapacity('3'),
        basePrice: 100000
    },
    {
        movie: movies[1]._id,
        startTime: addHours(24 + 6),
        endTime: addHours(24 + 9),
        room: '7',
        totalSeats: getRoomCapacity('7'),
        basePrice: 120000
    }
    ]);

    // =============================
    // DISCOUNT
    // =============================
    console.log('💸 Creating discounts...');

    await Discount.create({
      code: 'SALE10',
      percentage: 10,
      minPrice: 50000,
      expiryDate: new Date('2026-12-31')
    });

    // =============================
    // TEST BOOKINGS
    // =============================
    console.log('🎟 Creating test bookings...');

    const group1 = new mongoose.Types.ObjectId();
    const group2 = new mongoose.Types.ObjectId();

    const showtime = showtimes[0];

    // ❌ EXPIRED BOOKING
    await Booking.create({
        user: user._id,
        showtime: showtime._id,
        seat: 'A1',
        bookingGroupId: group1,
        totalPrice: 100000,
        originalPrice: 100000,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        expiresAt: new Date(Date.now() - 60 * 1000)
    });

    // ✔ VALID BOOKING
    await Booking.create({
        user: user._id,
        showtime: showtime._id,
        seat: 'A2',
        bookingGroupId: group2,
        totalPrice: 100000,
        originalPrice: 100000,
        status: 'CONFIRMED', // 🔥 FIX
        paymentStatus: 'SUCCESS',
        expiresAt: null
    });

    console.log('✅ Seed completed successfully!');

    console.log('\n📋 Test info:');
    console.log('A1 → expired (sẽ bị cleanup)');
    console.log('A2 → still locked');

    process.exit();

  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seedData();