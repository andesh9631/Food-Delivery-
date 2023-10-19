const jwt = require("jsonwebtoken");
module.exports.createProviderSecretToken = (username) => {
  return jwt.sign({ username }, `${process.env.PROVIDER_KEY}`, {
    expiresIn: 24 * 60 * 60,
  });
};
