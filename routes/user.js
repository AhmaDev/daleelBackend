var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
var bcrypt = require("bcryptjs");
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth.middlewares");

const tableName = path.basename(__filename).split(".")[0];

router.get(`/${tableName}s`, function (req, res, next) {
  connection.query(
    `SELECT *, '******' AS password FROM ${tableName} LEFT JOIN role ON role.idRole = ${tableName}.roleId`,
    (err, result) => {
      res.send(result);
    },
  );
});

router.get(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `SELECT *, '******' AS password FROM ${tableName} LEFT JOIN role ON role.idRole = ${tableName}.roleId WHERE id${capitalize(
      tableName,
    )} = ${req.params.id}`,
    (err, result) => {
      if (result.length > 0) {
        res.send(result[0]);
      } else {
        res.sendStatus(404);
      }
    },
  );
});
router.post(`/login`, function (req, res, next) {
  connection.query(
    `SELECT * FROM ${tableName} LEFT JOIN role ON role.idRole = ${tableName}.roleId WHERE phone = '${req.body.phone}'`,
    (err, result) => {
      if (result.length > 0) {
        let databasePassword = result[0].password;
        if (bcrypt.compareSync(req.body.password, databasePassword)) {
          const token = jwt.sign(
            JSON.parse(JSON.stringify(result[0])),
            process.env.SECRET_KEY,
            {
              expiresIn: "90d",
            },
          );
          if (result[0].isBanned == 1) {
            res.status(500).send("BANNED");
          } else {
            res.send({ token: token });
          }
        } else {
          res.status(500).send("INVALID_LOGIN_INFO");
        }
      } else {
        res.status(404).send("INVALID_LOGIN_INFO");
      }
    },
  );
});

router.post("/auth", function (req, res, next) {
  var token = req.body.token;
  if (token) {
    // CHECK TOKEN
    var decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded) {
      connection.query(
        `SELECT * FROM user WHERE idUser = ${decoded.idUser}`,
        (err, result) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            if (result.length > 0) {
              res.send(result[0]);
            } else {
              res.sendStatus(404);
            }
          }
        },
      );
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(404);
  }
});

router.post(`/add${capitalize(tableName)}`, function (req, res, next) {
  let userData = req.body;
  let hashedPassword = bcrypt.hashSync(
    req.body.password,
    bcrypt.genSaltSync(10),
  );
  userData.password = hashedPassword;
  connection.query(
    `INSERT INTO ${tableName} SET ?`,
    userData,
    (err, result) => {
      if (err) {
        console.log(err);
        if (err.code == "ER_DUP_ENTRY") {
          res.sendStatus(409);
        } else {
          res.sendStatus(500);
        }
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
router.put(`/updatePassword`, function (req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  connection.query(
    `UPDATE user SET password = ? WHERE idUser = ${decoded.idUser}`,
    [bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))],
    (err, result) => {
      if (err) {
        console.log("Error while editing a user", err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    },
  );
});
router.put(
  `/updatePasswordAdmin/:userId`,
  auth.roles("Admin"),
  function (req, res, next) {
    connection.query(
      `UPDATE user SET password = ? WHERE idUser = ${req.params.userId}`,
      [bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))],
      (err, result) => {
        if (err) {
          console.log("Error while editing a user", err);
          res.sendStatus(500);
          return;
        }
        res.sendStatus(200);
      },
    );
  },
);

router.put(
  `/updateUserProfilePicture`,
  upload.single("file"),
  auth.roles("all"),
  function (req, res, next) {
    var filepath = req.file.filename;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    connection.query(
      `UPDATE ${tableName} SET ? WHERE id${capitalize(tableName)} = ${
        decoded.idUser
      }`,
      { image: "uploads/profile/" + filepath },
      (err, result) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      },
    );
  },
);

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
