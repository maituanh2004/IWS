exports.validateBooking = (req, res, next) => {
  const { showtimeId, seats } = req.body;

  if (!showtimeId || !Array.isArray(seats)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking data'
    });
  }

  if (seats.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Seats are required'
    });
  }

  next();
};