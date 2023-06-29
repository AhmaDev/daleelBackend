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

router.get(`/userSavedJobs/:id`, function (req, res, next) {
  connection.query(
    `SELECT * FROM ${tableName} LEFT JOIN job ON job.idJob = savedJob.jobId WHERE userId = ${req.params.id}`,
    (err, result) => {
      res.send(result);
    },
  );
});

router.get(`/savedJobByUser/:jobId/:userId`, function (req, res, next) {
  connection.query(
    `SELECT * FROM ${tableName} WHERE jobId = ${req.params.jobId} AND userId = ${req.params.userId}`,
    (err, result) => {
      if (result.length > 0) {
        res.send({ saved: true });
      } else {
        res.send({ saved: false });
      }
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

router.delete(`/${tableName}/:jobId/:userId`, function (req, res, next) {
  connection.query(
    `DELETE FROM ${tableName} WHERE jobId = ${req.params.jobId} AND userId = ${req.params.userId}`,
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
