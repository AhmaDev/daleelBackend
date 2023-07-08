var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");
const { sendNotification } = require("../helpers/fcm");
const jwt = require("jsonwebtoken");
const tableName = path.basename(__filename).split(".")[0];

router.get(`/${tableName}s`, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    connection.query(
      `SELECT * FROM ${tableName} WHERE userId = ${
        decoded.idUser
      } ORDER BY id${capitalize(tableName)} DESC`,
      (err, result) => {
        if (err) {
          console.log(err);
        }
        res.send(result);
      },
    );
  } catch (error) {
    res.sendStatus(404);
  }
});

router.post("/notifications/seen", function (req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    connection.query(
      `UPDATE notification SET seen = 1 WHERE userId = ${decoded.idUser}`,
      (err, response) => {
        res.sendStatus(200);
      },
    );
  } catch (error) {
    res.sendStatus(404);
  }
});

router.post("/notifications/send", function (req, res) {
  res.send(sendNotification(req.body.title, req.body.body, req.body.users));
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
    `INSERT INTO ${tableName} (userId,notificationTitle,notificationBody,notificationType) VALUES ?`,
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
