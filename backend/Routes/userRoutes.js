const express = require("express");
const {
  getUserData,
  Location,
  Register,
  Login,
  OTPLoginGenerator,
  verifyLoginOTP,
  OrderData,
  MyOrderDate,
  FoodData,
} = require("../Controller/User");

const router = express.Router();

router.route("/register").post(Register);
router.route("/login").post(Login);
router.route("/generateloginotp").post(OTPLoginGenerator);
router.route("/verifyloginotp").post(verifyLoginOTP);
router.route("/userdata").post(getUserData);
router.route("/location").post(Location);
router.route("/fooddata").post(FoodData);
router.route("/orderdata").post(OrderData);
router.route("/myorderdata").post(MyOrderDate);

module.exports = router;
