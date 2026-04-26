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

// GET SINGLE SHOWTIME
exports.getShowtime = async (req, res) => {
  try {
    const showtime = await showtimeService.getShowtimeById(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    res.status(200).json({
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

// UPDATE SHOWTIME
exports.updateShowtime = async (req, res) => {
  try {
    const showtime = await showtimeService.updateShowtime(
      req.params.id,
      req.body
    );

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    res.status(200).json({
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

// DELETE SHOWTIME
exports.deleteShowtime = async (req, res) => {
  try {
    const showtime = await showtimeService.deleteShowtime(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Showtime deleted',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// GET SEATS
exports.getSeats = async (req, res) => {
  const showtimeId = req.params.showtimeId || req.params.id;
  try {
    const data = await showtimeService.getSeatAvailability(showtimeId);

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