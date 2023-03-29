// This author of this code is Jatan Shah.


const express = require('express');
const multer = require('multer');
const tesseract = require("node-tesseract-ocr");
const path = require('path');
const request = require('request-promise');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname + '/uploads')));
app.set('view engine', "ejs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({storage: storage});

app.get('/', (req, res) => {
    res.render('index',{data:''});
});

app.post('/extracttextfromimage', upload.single('file'), async (req, res) => {
    try {
        const imageUrl = req.body.imageUrl;
        const imageBuffer = await request.get({url: imageUrl, encoding: null});
        const tempImagePath = path.join(__dirname, 'uploads', 'temp-' + Date.now() + '.jpg');
        fs.writeFileSync(tempImagePath, imageBuffer);
        const config = {
            lang: "eng",
            oem: 1,
            psm: 3,
            tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        };
        const text = await tesseract.recognize(tempImagePath, config);
        console.log("Result:", text);
        res.render('index', {data: text});
        fs.unlinkSync(tempImagePath); // remove the temporary file
    } catch (error) {
        console.log(error.message);
        res.render('index', {data: ''});
    }
});

app.listen(7000, () => {
    console.log("App os listening on port 7000...");
});



