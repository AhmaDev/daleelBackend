var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");

const tableName = path.basename(__filename).split(".")[0];

router.get(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `SELECT * FROM ${tableName} WHERE id${capitalize(tableName)} = ${
      req.params.id
    }`,
    (err, result) => {
      if (result.length > 0) {
        res.send(result[0]);
      } else {
        res.sendStatus(404);
      }
    },
  );
});

router.get(`/cvAdByUser/:id`, function (req, res, next) {
  connection.query(
    `SELECT cvAd.* FROM cvAd LEFT JOIN cv ON cv.idCv = cvAd.cvId WHERE cv.userId = ${req.params.id} AND cvAd.status != 'ended' ORDER BY cvAd.idCvAd DESC`,
    (err, result) => {
      if (result.length > 0) {
        res.send(result[0]);
      } else {
        res.sendStatus(404);
      }
    },
  );
});

router.get(`/cvAds`, function (req, res, next) {
  connection.query(
    `SELECT cv.*, user.username, user.image FROM cvAd LEFT JOIN cv ON cvAd.cvId = cv.idCv LEFT JOIN user ON user.idUser = cv.userId WHERE cvAd.status = 'active'  AND DATE(NOW()) BETWEEN cvAd.startDate AND cvAd.endDate`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    },
  );
});
router.get(`/allCvAds`, function (req, res, next) {
  connection.query(
    `SELECT cvAd.*, user.idUser, user.username, user.image FROM cvAd LEFT JOIN cv ON cvAd.cvId = cv.idCv LEFT JOIN user ON user.idUser = cv.userId`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    },
  );
});

router.post(`/add${capitalize(tableName)}`, function (req, res, next) {
  connection.query(
    `INSERT INTO ${tableName} SET ?`,
    req.body,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    },
  );
});

router.put(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `UPDATE ${tableName} SET ? WHERE id${capitalize(tableName)} = ${
      req.params.id
    }`,
    req.body,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    },
  );
});

router.delete(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `DELETE FROM ${tableName} WHERE id${capitalize(tableName)} = ${
      req.params.id
    }`,
    (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    },
  );
});

module.exports = router;
