const express = require("express");
const User = require("../models/User");
const { requireAuth } = require("../middlewares/authMiddleware");
const { hospitalData } = require("../documents/sign");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  res.redirect("/dashboard");
});

router.get("/dashboard", requireAuth, async (req, res) => {
  let user = await User.findOne({ email: req.user.email });
  user = {
    firstName: user.firstName,
    lastName: user.lastName,
    wallet: user.wallet,
  };
  res.render("index", { user });
});

router.get("/wallet", requireAuth, async (req, res) => {
  const userEmail = req.user.email;
  const user = await User.findOne({ email: userEmail });
  const wallet = user.wallet;

  res.render("wallet", { wallet });
});

router.get("/create-birth-certificate", requireAuth, (req, res) => {
  const hospital = [];
  hospitalData.forEach((data) => {
    hospital.push({
      hospitalValue: data["hospitalValue"],
      hospitalName: data["Hospital Name (en)"],
      district: data["District (en)"],
    });
  });

  res.render("createBC", { hospital });
});
module.exports = router;
