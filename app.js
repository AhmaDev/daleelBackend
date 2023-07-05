var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fs = require("fs");
var cors = require("cors");
const jwt = require("jsonwebtoken");
var cron = require("node-cron");

var indexRouter = require("./routes/index");
const connection = require("./helpers/db");

var app = express();
app.set("view engine", "html");

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const baseApi = "/api";

app.use(`/`, indexRouter);
app.use(baseApi, indexRouter);

var routes = fs.readdirSync("./routes/");
routes.forEach((route) => {
  app.use(baseApi, require("./routes/" + route));
});

app.get("/api/payment", (req, res) => {
  res.send("Please wait...");
});

app.get("/api/payment/success", (req, res) => {
  res.sendFile(path.join(__dirname, "html/payment.html"));
});

app.get("/api/uploads/:path/:file", function (request, response) {
  let file = request.params.file;
  var extension = file.split(".").pop();
  var tempFile = path.join(
    __dirname,
    "uploads/" + request.params.path + "/" + file,
  );
  fs.readFile(tempFile, function (err, data) {
    switch (extension) {
      case "jpg":
        contentType = "image/jpg";
        isImage = 1;
        break;
      case "png":
        contentType = "image/png";
        isImage = 1;
        break;
      case "pdf":
        contentType = "application/pdf";
        isImage = 2;
        break;
      case "jpeg":
        contentType = "image/jpeg";
        isImage = 1;
        break;
    }
    if (
      ["jpg", "jpeg", "png", "gif", "pdf", "mp4", "mp3"].includes(extension)
    ) {
      response.contentType(contentType);
      response.send(data);
    } else {
      response.download(tempFile);
    }
  });
});

cron.schedule("0 0 * * *", () => {
  // CRON JOB TO UPDATE ADS EVERY DAY
  connection.query(
    `UPDATE jobAd SET status = 'active' WHERE status = 'pending' AND DATE(NOW()) BETWEEN startDate AND endDate`,
  );
  connection.query(
    `UPDATE cvAd SET status = 'active' WHERE status = 'pending' AND DATE(NOW()) BETWEEN startDate AND endDate`,
  );
  connection.query(
    `UPDATE jobAd SET status = 'active' WHERE status = 'approved' AND DATE(NOW()) BETWEEN startDate AND endDate`,
  );
  connection.query(
    `UPDATE cvAd SET status = 'active' WHERE status = 'approved' AND DATE(NOW()) BETWEEN startDate AND endDate`,
  );
  connection.query(
    `UPDATE jobAd SET status = 'ended' WHERE status = 'active' AND DATE(NOW()) > endDate`,
  );
  connection.query(
    `UPDATE cvAd SET status = 'ended' WHERE status = 'active' AND DATE(NOW()) > endDate`,
  );
});

module.exports = app;
