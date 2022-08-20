const express = require("express");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const QRcode = require("qrcode");
const shortId = require("shortid");
const bwipjs = require("bwip-js");

const { getDates } = require("../utils");
const { hospitalData } = require("../documents/sign");
const User = require("../models/User");
const html = require("../documents/up-bc");

const NODE_ENV = express().get("env");

const router = express.Router();

// Configure domain
let domain = "";
if (NODE_ENV === "development") {
  domain = "http://127.0.0.1:3000";
} else {
  domain = "";
}

// Create Birth certificate
router.post("/create", async (req, res) => {
  try {
    // Getting hospital
    const hospital = hospitalData.find((data) => {
      return data.hospitalValue === req.body.hospital;
    });

    // Generating QR code
    const bcId = shortId.generate();

    const qrcode = await QRcode.toDataURL(
      `${domain}/birth-certificate/${bcId}`
    );

    // Generating Bar code
    const barcode = await textToBarCodeBase64(
      `${domain}/birth-certificate/${bcId}`
    );

    // Generating PDF
    const data = {
      name: `${req.body.firstName} ${req.body.lastName}`,
      gender: req.body.gender,
      birthDate: req.body.dob,
      birthDateWords: req.body.dobInWords,
      placeOfBirth: req.body.placeOfBirth,
      motherName: req.body.motherName,
      fatherName: req.body.fatherName,
      motherAadharNo: req.body.motherAadharNo,
      fatherAadharNo: req.body.fatherAadharNo,
      birthAddress: req.body.parentAddressAtBirth,
      parmanentAddress: req.body.permanentAddress,
      state: req.body.state,
      registrationNo: "B-238: 2938-238-39",
      registrationDate: req.body.registrationDate,
      remarks: "----",
      issueDate: getDates(),
      updatedDate: getDates(),
      qrcode,
      barcode,
      sign: hospital["Sign URL"],
      stampHi: hospital["Stamp (hi)"],
      stamp: hospital.Stamp,
      hospitalHi: hospital["Hospital Name (hi)"],
      hospitalEn: hospital["Hospital Name (en)"],
      districtHi: hospital["District (hi)"],
      districtEn: hospital["District (en)"],
    };

    const bc = html(data);

    pdf.create(bc).toStream(function (err, stream) {
      if (err) return console.log(err);
      stream.pipe(
        fs.createWriteStream(
          path.join(__dirname, `../temp/pdfs/bc-${bcId}.pdf`)
        )
      );
      setTimeout(async () => {
        // res.sendFile(path.join(__dirname, `../temp/pdfs/bc-${bcId}.pdf`));
        res.redirect(301, `/birth-certificate/${bcId}`);

        const userEmail = req.user.email;
        const user = await User.findOne({ email: userEmail });
        user.wallet -= 40;
        await user.save();
      }, 3000);
    });
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.get("/:bcId", (req, res) => {
  res.sendFile(path.join(__dirname, `../temp/pdfs/bc-${req.params.bcId}.pdf`));
});

// Generate barcode in base 64
function textToBarCodeBase64(text) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128",
        text: text,
        height: 10,
        includetext: false,
      },
      function (error, buffer) {
        if (error) {
          reject(error);
        } else {
          let barcodeBase64 = `data:image/png;base64,${buffer.toString(
            "base64"
          )}`;
          resolve(barcodeBase64);
        }
      }
    );
  });
}

module.exports = router;
