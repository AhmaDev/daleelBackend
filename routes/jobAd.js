var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");

const tableName = path.basename(__filename).split(".")[0];

router.get(`/${tableName}s`, function (req, res, next) {
  connection.query(`SELECT * FROM ${tableName}`, (err, result) => {
    res.send(result);
  });
});

router.get(`/sliderAds`, function (req, res, next) {
  connection.query(
    `SELECT job.* FROM ${tableName} LEFT JOIN job ON jobAd.jobId = job.idJob WHERE jobAd.status = 'active' AND jobAd.adTypeId = 1 AND DATE(NOW()) BETWEEN jobAd.startDate AND jobAd.endDate`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    },
  );
});
router.get(`/searchAds`, function (req, res, next) {
  connection.query(
    `SELECT job.*, province.provinceName ,(SELECT username FROM user WHERE user.idUser = job.createdBy) As username FROM ${tableName} LEFT JOIN job ON jobAd.jobId = job.idJob LEFT JOIN province ON job.provinceId = province.idProvince WHERE jobAd.status = 'active' AND jobAd.adTypeId = 3 AND DATE(NOW()) BETWEEN jobAd.startDate AND jobAd.endDate`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    },
  );
});
router.get(`/popupAds`, function (req, res, next) {
  connection.query(
    `SELECT job.*, province.provinceName ,(SELECT username FROM user WHERE user.idUser = job.createdBy) As username FROM ${tableName} LEFT JOIN job ON jobAd.jobId = job.idJob LEFT JOIN province ON job.provinceId = province.idProvince WHERE jobAd.status = 'active' AND jobAd.adTypeId = 2 AND DATE(NOW()) BETWEEN jobAd.startDate AND jobAd.endDate`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
    },
  );
});

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
