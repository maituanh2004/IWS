const Discount = require('../models/Discount');

exports.getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: discounts.length,
            data: discounts
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getDiscount = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);

        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'Discount not found'
            });
        }

        res.status(200).json({
            success: true,
            data: discount
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.createDiscount = async (req, res) => {
    try {
        const discount = await Discount.create(req.body);
        res.status(201).json({
            success: true,
            data: discount
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateDiscount = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'Discount not found'
            });
        }

        res.status(200).json({
            success: true,
            data: discount
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteDiscount = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndDelete(req.params.id);

        if (!discount) {
            return res.status(404).json({
                success: false,
                error: 'Discount not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Discount deleted'
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};