var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");
const auth = require("../middleware/auth.middlewares");
const jwt = require("jsonwebtoken");

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

router.get(`/jobApplications/:id`, function (req, res, next) {
  connection.query(
    `SELECT jobApplication.*, user.username, user.image As userImage FROM ${tableName} LEFT JOIN user ON jobApplication.userId = user.idUser WHERE jobId = ${req.params.id}`,
    (err, result) => {
      res.send(result);
    },
  );
});
router.get(`/userApplications/:id`, function (req, res, next) {
  connection.query(
    `SELECT jobApplication.*, user.username, user.image As userImage FROM ${tableName} LEFT JOIN user ON jobApplication.userId = user.idUser WHERE user.idUser = ${req.params.id}`,
    (err, result) => {
      res.send(result);
    },
  );
});

router.get(
  `/checkIfApplied/:jobId`,
  auth.roles("all"),
  function (req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    connection.query(
      `SELECT * FROM ${tableName} WHERE jobId = ${req.params.jobId} AND userId = ${decoded.idUser}`,
      (err, result) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          if (result.length > 0) {
            res.send({ applied: true });
          } else {
            res.send({ applied: false });
          }
        }
      },
    );
  },
);

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
