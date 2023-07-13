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

router.get("/reports", function (req, res) {
  connection.query(
    `SELECT 
(SELECT COUNT(idUser) FROM user WHERE roleId = 2 AND createdAt BETWEEN '2023-01-01 00:00:00' AND '2023-09-01 23:59:59') AS employees,
(SELECT COUNT(idUser) FROM user WHERE roleId = 3 AND createdAt BETWEEN '2023-01-01 00:00:00' AND '2023-09-01 23:59:59') AS companies,
(SELECT COUNT(idJob) FROM job WHERE createdAt BETWEEN '2023-01-01 00:00:00' AND '2023-09-01 23:59:59') AS jobs,
(SELECT COUNT(idJobAd) FROM jobAd WHERE status = 'active' AND adTypeId = 1) AS totalJobSlider,
(SELECT COUNT(idJobAd) FROM jobAd WHERE status = 'active' AND adTypeId = 2) AS totalJobSplash,
(SELECT COUNT(idJobAd) FROM jobAd WHERE status = 'active' AND adTypeId = 3) AS totalJobSearch,
(SELECT COUNT(idJobAd) FROM jobAd WHERE status = 'approved') AS approvedAds,
(SELECT COUNT(idJobAd) FROM jobAd WHERE status = 'pending') AS pendingAds,
(SELECT COUNT(idJobApplication) FROM jobApplication WHERE status = 'pending') AS pendingApplications,
(SELECT COUNT(idJobApplication) FROM jobApplication WHERE status = 'approved') AS approvedApplications,
(SELECT COUNT(idJobApplication) FROM jobApplication WHERE status = 'declined') AS declinedApplications,
(SELECT COUNT(idCvAd) FROM cvAd WHERE status = 'active') AS activeCvAds`,
    (err, result) => {
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
