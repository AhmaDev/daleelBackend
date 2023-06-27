const jwt = require("jsonwebtoken");
const connection = require("../helpers/db");

module.exports.roles = function (role) {
  return function (req, res, next) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      connection.query(
        `SELECT * FROM userSession WHERE token = '${token}'`,
        (err, res) => {
          // if (res.length == 0) {
          //   throw Error("blocked");
          // }
          if (role == "all") {
            next();
          } else {
            if (decoded.roleName != role && decoded.roleName != "Admin") {
              throw new Error("no auth");
            } else {
              next();
            }
          }
        },
      );
    } catch (err) {
      if (err.message == "blocked") {
        return res.status(423).json({
          message: "locked",
        });
      }
      if (err)
        return res.status(401).json({
          message: "auth failed",
        });
    }
  };
};
