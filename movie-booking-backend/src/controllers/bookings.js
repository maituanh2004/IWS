const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

exports.createBooking = async (req, res) => {
    try {
        const {showtimeId, seats} = req.body;

        if (!seats || seats.length === 0){
            return res.status(400).json({message: 'No seats seleted'});
        }

        //Remove duplicate seats in request
        const uniqueSeats = [...new Set(seats)];
        if (uniqueSeats.length !== seats.length) {
            return res.status(400).json({message: 'Duplicate seats in request'});
        }

        const showtime = await Showtime.findById(showtimeId);

        //Generate all seats (A1 -> H10)
        const allSeats = [];
        const rows = 'ABCDEFGH';
        for (let i = 0; i < rows.length; i++) {
            for(let j = 1; j <= 10; j++) {
                allSeats.push(`${rows[i]}${j}`);
            }
        }

        //Validate seats exist
        const invalidSeats = seats.filter(seat => !allSeats.includes(seat));
        if (invalidSeats.length > 0){
            return res.status(400).json({ message: 'Invalid seats', invalidSeats});
        }

        //Get booked seats
        const bookings = await Booking.find({
            showtime: showtimeId,
            status: 'CONFIRMED'
        });

        const bookedSeats = bookings.flatMap(b => b.seats);

        //Check conflict
        const conflict = seats.filter(seat => bookedSeats.includes(seat));
        if (conflict.length > 0){
            return res.status(400).json({
                message: 'Seats already booked',
                conflict
            });
        }

        const totalPrice = seats.length * showtime.price;

        const booking = await Booking.create ({
            user: req.user.id,
            showtime: showtimeId,
            seats,
            totalPrice
        });

        res.status(201).json({
            bookingId: booking._id,
            status: booking.status,
            totalPrice
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id })
        .populate('showtime');

    res.json(bookings);
};