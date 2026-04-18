require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Showtime = require('./src/models/Showtime');
const Discount = require('./src/models/Discount');
const connectDB = require('./src/config/database');

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Movie.deleteMany({});
        await Showtime.deleteMany({});
        await Discount.deleteMany({});

        console.log('Creating admin user...');
        await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log(' Admin created: admin@example.com / admin123');

        console.log('Creating customer user...');
        await User.create({
            name: 'John Doe',
            email: 'customer@example.com',
            password: 'customer123',
            role: 'customer'
        });
        console.log(' Customer created: customer@example.com / customer123');

        console.log('Creating sample discounts...');
        const discounts = await Discount.create([
            {
                code: 'SILVER15',
                percentage: 15,
                minPrice: 100000,
                type: 'silver',
                expiryDate: new Date(Date.now() + 10 * 86400000)
            },
            {
                code: 'GOLD50',
                percentage: 50,
                minPrice: 200000,
                type: 'gold',
                expiryDate: new Date(Date.now() + 30 * 86400000)
            },
            {
                code: 'STUDENT20',
                percentage: 20,
                minPrice: 0,
                type: 'custom',
                expiryDate: new Date(Date.now() + 5 * 86400000)
            },
            {
                code: 'EXPIRED10',
                percentage: 10,
                minPrice: 0,
                type: 'custom',
                expiryDate: new Date(Date.now() - 5 * 86400000)
            }
        ]);

        console.log('Creating sample movies...');
        const movies = await Movie.create([
            {
                title: 'Avengers: Endgame',
                description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos actions and restore balance to the universe.',
                poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                duration: 181,
                genre: 'Action, Adventure, Sci-Fi',
                releaseDate: new Date('2019-04-26'),
                price: 120000,
                voucherCode: discounts[0].code
            },
            {
                title: 'The Shawshank Redemption',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                duration: 142,
                genre: 'Drama',
                releaseDate: new Date('1994-09-23'),
                price: 90000,
                voucherCode: 'none'
            },
            {
                title: 'Inception',
                description: 'A thief who steals corporate secrets through use of dream-sharing technology is given the inverse task of planting an idea.',
                poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                duration: 148,
                genre: 'Action, Sci-Fi, Thriller',
                releaseDate: new Date('2010-07-16'),
                price: 110000,
                voucherCode: discounts[2].code
            }
        ]);

        console.log('Creating sample showtimes...');
        await Showtime.create([
            {
                movie: movies[0]._id,
                startTime: new Date(Date.now() + 86400000),
                endTime: new Date(Date.now() + 86400000 + 181 * 60000),
                room: '1',
                totalSeats: 50,
                price: 120000
            },
            {
                movie: movies[1]._id,
                startTime: new Date(Date.now() + 2 * 86400000),
                endTime: new Date(Date.now() + 2 * 86400000 + 142 * 60000),
                room: '2',
                totalSeats: 40,
                price: 90000
            },
            {
                movie: movies[2]._id,
                startTime: new Date(Date.now() + 3 * 86400000),
                endTime: new Date(Date.now() + 3 * 86400000 + 148 * 60000),
                room: '3',
                totalSeats: 60,
                price: 110000
            }
        ]);

        console.log('✅ Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();