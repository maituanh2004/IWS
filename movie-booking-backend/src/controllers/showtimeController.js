const showtimeService = require('../services/showtimeService');

// GET ALL SHOWTIMES
exports.getShowtimes = async (req, res) => {
  try {
    const showtimes = await showtimeService.getAllShowtimes();

    res.status(200).json({
      success: true,
      count: showtimes.length,
      data: showtimes,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// CREATE SHOWTIME
exports.createShowtime = async (req, res) => {
  try {
    const showtime = await showtimeService.createShowtime(req.body);

    res.status(201).json({
      success: true,
      data: showtime,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET SHOWTIMES BY MOVIE
exports.getShowtimesByMovie = async (req, res) => {
  try {
    const showtimes = await showtimeService.getShowtimesByMovie(
      req.params.movieId
    );

    res.status(200).json({
      success: true,
      data: showtimes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET SEATS
exports.getSeats = async (req, res) => {
  try {
    const data = await showtimeService.getSeatAvailability(
      req.params.showtimeId
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};