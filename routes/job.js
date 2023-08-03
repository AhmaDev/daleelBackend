var express = require("express");
const capitalize = require("../helpers/capitalize");
const connection = require("../helpers/db");
var router = express.Router();
var path = require("path");
const upload = require("../middleware/upload.middleware");
const auth = require("../middleware/auth.middlewares");
const jwt = require("jsonwebtoken");
const request = require("request");
const tableName = path.basename(__filename).split(".")[0];
var axios = require("axios");

let initUrl = "https://test.zaincash.iq/transaction/init";
let requestUrl = "https://test.zaincash.iq/transaction/pay?id=";

if (process.env.PRODUCTION === "true") {
  initUrl = "https://api.zaincash.iq/transaction/init";
  requestUrl = "https://api.zaincash.iq/transaction/pay?id=";
}

router.get(`/${tableName}s`, function (req, res, next) {
  let query = "";
  let order = "";
  let limit = "";

  if (req.query.id != undefined) {
    query = query + ` AND idJob IN (${req.query.id})`;
  }
  if (req.query.user != undefined) {
    query = query + ` AND createdBy IN (${req.query.user})`;
  }
  if (req.query.title != undefined) {
    query = query + ` AND jobTitle LIKE '%${req.query.title}%'`;
  }
  if (req.query.provinceId != undefined) {
    query = query + ` AND provinceId = ${req.query.provinceId}`;
  }
  if (req.query.salary != undefined) {
    query = query + ` AND  ${req.query.salary} BETWEEN salaryFrom AND salaryTo`;
  }
  if (req.query.age != undefined) {
    query = query + ` AND  ${req.query.age} BETWEEN ageFrom AND ageTo`;
  }
  if (req.query.gender != undefined) {
    query = query + ` AND gender = '${req.query.gender}'`;
  }
  if (req.query.categoryId != undefined) {
    query =
      query +
      ` AND (SELECT COUNT(idJobCategories) FROM jobCategories WHERE jobId = job.idJob AND categoryId = ${req.query.categoryId}) > 0`;
  }
  if (req.query.order != undefined) {
    order = "ORDER BY " + req.query.order + " " + req.query.sort;
  }

  if (req.query.limit != undefined) {
    limit = `LIMIT ${req.query.limit}`;
  }

  connection.query(
    `SELECT *, (SELECT username FROM user WHERE user.idUser = job.createdBy) As username, (SELECT COUNT(idJobApplication) FROM jobApplication WHERE jobId = job.idJob) As totalApplied FROM ${tableName} LEFT JOIN province ON job.provinceId = province.idProvince WHERE 1=1 ${query} ${order} ${limit}`,
    (err, result) => {
      res.send(result);
    },
  );
});

router.get("/myJobs", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  connection.query(
    `SELECT *, (SELECT username FROM user WHERE user.idUser = job.createdBy) As username, (SELECT COUNT(idJobApplication) FROM jobApplication WHERE jobId = job.idJob) As totalApplied FROM ${tableName} LEFT JOIN province ON job.provinceId = province.idProvince WHERE job.createdBy = ${decoded.idUser} ORDER BY idJob DESC`,
    (err, result) => {
      res.send(result);
    },
  );
});

router.get(`/myAds`, function (req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  connection.query(
    `SELECT * FROM jobAd LEFT JOIN adType ON jobAd.adTypeId = adType.idAdType WHERE createdBy = ${decoded.idUser}`,
    (err, result) => {
      res.send(result);
    },
  );
});

router.get(`/${tableName}/:id`, function (req, res, next) {
  connection.query(
    `SELECT *, (SELECT username FROM user WHERE user.idUser = job.createdBy) As username, (SELECT COUNT(idJobApplication) FROM jobApplication WHERE jobId = job.idJob) As totalApplied FROM ${tableName} LEFT JOIN province ON job.provinceId = province.idProvince WHERE id${capitalize(
      tableName,
    )} = ${req.params.id}`,
    (err, result) => {
      if (result.length > 0) {
        connection.query(
          `SELECT * FROM jobCategories LEFT JOIN category ON jobCategories.categoryId = category.idCategory WHERE jobId = ${req.params.id}`,
          (catErr, catResult) => {
            result[0].categories = catResult;
            res.send(result[0]);
            connection.query(
              `UPDATE job SET views = ? WHERE idJob = ${req.params.id}`,
              [result[0].views + 1],
              (viewsErr, viewsResult) => {},
            );
          },
        );
      } else {
        res.sendStatus(404);
      }
    },
  );
});

router.post(
  `/add${capitalize(tableName)}`,
  auth.roles("all"),
  upload.single("file"),
  function (req, res, next) {
    var filepath;
    if (req.file) {
      filepath = req.file.filename;
    } else {
      filepath = "defualt.jpg";
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    let job = JSON.parse(req.body.job);
    job.image = "uploads/job/" + filepath;
    job.createdBy = decoded.idUser;
    connection.query(`INSERT INTO ${tableName} SET ?`, job, (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        var categories = JSON.parse(req.body.skills).map((e) => [
          result.insertId,
          e.idCategory,
        ]);
        connection.query(
          `INSERT INTO jobCategories (jobId,categoryId) VALUES ?`,
          [categories],
          (skillsErr, skillsResult) => {
            if (skillsErr) {
              console.log(skillsErr);
              res.sendStatus(500);
            } else {
              res.send({ jobId: result.insertId });
            }
          },
        );
      }
    });
  },
);

router.post(
  `/editJobImage/:jobId`,
  auth.roles("all"),
  upload.single("file"),
  function (req, res, next) {
    var filepath;
    if (req.file) {
      filepath = req.file.filename;
    } else {
      filepath = "defualt.jpg";
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    var imagePath = "uploads/job/" + filepath;
    connection.query(
      `UPDATE job SET image = '${imagePath}' WHERE idJob = ${req.params.jobId}`,
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

router.post("/ad/zaincash/request", function (req, res) {
  const time = Date.now();
  const data = {
    amount: req.body.price,
    serviceType: req.body.serviceName,
    msisdn: process.env.MSISDN,
    orderId: "ORDER_1",
    redirectUrl: "https://api.al-daleel.app/payment",
    iat: time,
    exp: time + 60 * 60 * 4,
  };
  const token = jwt.sign(data, process.env.SECRET);
  const postData = {
    token: token,
    merchantId: process.env.MERCHANTID,
    lang: "ar",
  };
  var stringfiedData = JSON.stringify(postData);

  var config = {
    method: "post",
    url: "https://api.zaincash.iq/transaction/init",
    headers: {
      "Content-Type": "application/json",
    },
    data: stringfiedData,
  };

  axios(config)
    .then(function (response) {
      res.send(response.data);
    })
    .catch(function (error) {
      res.status(500).send(error);
    });
});

module.exports = router;
