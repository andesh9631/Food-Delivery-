var jwt = require("jsonwebtoken");
module.exports.fetch = (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      res.status(401).send({ error: "Invalid Auth Token" });
    }

    const data = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = data.user;
    next();
  } catch (error) {
    res
      .status(401)
      .send({ success: false, message: "Invalid Auth Token" + error.message });
  }
};

