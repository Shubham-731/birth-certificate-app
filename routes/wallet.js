const express = require("express");
const Razorpay = require("razorpay");
const shortId = require("shortid");
const crypto = require("crypto");
require("dotenv/config");
const User = require("../models/User");

const router = express();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

// Razorpay instance
const instance = new Razorpay({ key_id, key_secret });

// Create order
router.post("/create/orderId", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: shortId.generate(),
      payment_capture: 1,
    };

    const response = await instance.orders.create(options);
    res.status(200).json({ orderId: response["id"] });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Verify payment signature
router.post("/payment/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body;
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");
    const razorpaySignature = req.body.razorpay_signature;

    if (expectedSignature === razorpaySignature) {
      const payment = await instance.payments.fetch(razorpay_payment_id);
      const balance = payment.amount / 100;

      if (payment.captured) {
        const userEmail = req.user.email;

        const user = await User.findOne({ email: userEmail });
        user.wallet += balance;
        user.save();
      }

      res.status(200).json({
        status: "ok",
      });
    } else {
      res
        .status(409)
        .json({ status: "error", msg: "Payment signature not verified!" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
