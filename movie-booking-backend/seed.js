require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Showtime = require('./src/models/Showtime');
const connectDB = require('./src/config/database');
const Discount = require('./src/models/Discount');
const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Movie.deleteMany({});
        await Showtime.deleteMany({});
        await Discount.deleteMany({});

        // Create Admin User
        console.log('Creating admin user...');
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('✅ Admin created: admin@example.com / admin123');

        // Create Customer User
        console.log('Creating customer user...');
        const customer = await User.create({
            name: 'John Doe',
            email: 'customer@example.com',
            password: 'customer123',
            role: 'customer'
        });
        console.log('✅ Customer created: customer@example.com / customer123');

        // Create Sample Movies
        console.log('Creating sample movies...');
        const movies = await Movie.create([
            {
                title: 'Avengers: Endgame',
                description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos\' actions and restore balance to the universe.',
                poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
                duration: 181,
                genre: 'Action, Adventure, Sci-Fi',
                releaseDate: new Date('2019-04-26')
            },
            {
                title: 'The Shawshank Redemption',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
                duration: 142,
                genre: 'Drama',
                releaseDate: new Date('1994-09-23')
            },
            {
                title: 'Inception',
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
                duration: 148,
                genre: 'Action, Sci-Fi, Thriller',
                releaseDate: new Date('2010-07-16')
            }
        ]);
        console.log(`✅ Created ${movies.length} movies`);

        // Create Sample Showtimes
        console.log('Creating sample showtimes...');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const showtimes = [];
        for (const movie of movies) {
            // 2 showtimes per movie
            showtimes.push({
                movie: movie._id,
                startTime: new Date(today.setHours(14, 0, 0, 0)),
                endTime: new Date(today.getTime() + movie.duration * 60000),
                room: '1',
                totalSeats: 80,
                price: 12.50
            });

            showtimes.push({
                movie: movie._id,
                startTime: new Date(tomorrow.setHours(19, 30, 0, 0)),
                endTime: new Date(tomorrow.getTime() + movie.duration * 60000),
                room: '2',
                totalSeats: 100,
                price: 15.00
            });
        }

        await Showtime.create(showtimes);
        console.log(`✅ Created ${showtimes.length} showtimes`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin: admin@example.com / admin123');
        console.log('   Customer: customer@example.com / customer123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
