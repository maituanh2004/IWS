const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { generateSeats } = require('../utils/seatUtils');

exports.createBooking = async (req, res) => {
    try {
        const {showtimeId, seats} = req.body;

        if (!seats || seats.length === 0){
            return res.status(400).json({message: 'No seats seleted'});
        }

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        const allSeats = generateSeats();

        
        //Validate seats exist
        const invalidSeats = seats.filter(seat => !allSeats.includes(seat));
        if (invalidSeats.length > 0){
            return res.status(400).json({ message: 'Invalid seats', invalidSeats});
        }
        
        //Duplicate check
        const uniqueSeats = [...new Set(seats)];
        if (uniqueSeats.length !== seats.length) {
            return res.status(400).json({message: 'Duplicate seats in request'});
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
            totalPrice,
            status: 'CONFIRMED'
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate({
                path: 'showtime',
                populate: { path: 'movie' }
            });

        res.status(201).json(populatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate({
                path: 'showtime',
                populate: {
                    path: 'movie'
                }
            });

        res.json(bookings);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const bookings = await Booking.find({ user: userId })
            .populate('showtime');

        res.json(bookings);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // check permission
        if (
            req.user.role !== 'admin' &&
            booking.user.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        res.json({
            message: 'Booking cancelled successfully',
            booking
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};