const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const homeRoutes = require("./routes/index");
const userRoutes = require("./routes/user");
const walletRoutes = require("./routes/wallet");
const bcRoutes = require("./routes/bc");
const { checkUser } = require("./middlewares/authMiddleware");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/pdf", express.static(path.join(__dirname, "/temp/pdf")));

app.use(cookieParser());

app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/birth-certificate")
  .then(() => console.log("Connected to DB!"))
  .catch((err) => console.log(err));

app.use("*", checkUser);
app.use("/", homeRoutes);
app.use("/users", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/birth-certificate", bcRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000...");
});
