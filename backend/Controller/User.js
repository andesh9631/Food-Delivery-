const { createSecretToken } = require("../utility/JwtTokenGenerator");
const bcrypt = require("bcryptjs");
const otpGenerator = require("otp-generator");
const UserOTPVerification = require("../models/userOTPVerification");
const User = require("../models/User");
const { RegisterMail } = require("../GenratorOTP/OTPMailer");
const Orders = require("../models/Orders");
const FoodData = require("../models/foodData");
const FoodCategory = require("../models/foodCategory");

module.exports.Register = async (req, res) => {
  try {
    const { email, password, mobilenumber,name,location} = req.body;
    console.log(req.body)
    const existingUser = await User.findOne({
      $or: [
        {
          email,
        },
        {
          mobilenumber,
        },
      ],
    });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }
    const username =
      name.trim().charAt(0).toUpperCase() +
      name.trim().slice(1).toLowerCase() +
      "_" +
      mobilenumber.trim().slice(5, 11);
    const user = await User.create({
      email,
      password,
      mobilenumber,
      name,
      username,
      location,  
    });
    console.log("hello")
    const token = createSecretToken(user.username);
    res.cookie("userjwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 3600 * 1000,
      sameSite: "none",
      secure: true,
    });
    // await RegisterMail({
    //   username: username,
    //   text: `Thanks for Choosing Food Delivery for order the Food.`,
    //   subject: "Successfully Registration",
    //   userEmail: email,
    // });
    res.status(201).json({
      message: "User signed in successfully",
      success: true,
      token,
    });
  } catch (error) {
    console.log(error.message)
    res
      .status(401)
      .json({ success: false, message: error.message + " " + "user error" });
  }
};

module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    if (!email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({
          success: false,
          message: "Incorrect password ",
        });
      }
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        return res.json({
          success: false,
          message: "Incorrect password or email",
        });
      }
      const token = createSecretToken(user.username);
      res.cookie("userjwt", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 3600 * 1000,
        sameSite: "none",
        secure: true,
      });

      res.status(201).json({
        message: "User logged in successfully",
        success: true,
        token,
      });
    } catch (err) {
      res
        .status(401)
        .json({ message: "User Not Found!" + err.message, success: false });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something Else Went Wrong!" + err.message,
      success: false,
    });
  }
};
module.exports.OTPLoginGenerator = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: "All fields are required" });
    }
    try {
      const user = await User.findOne({
        email,
      });
      if (!user) {
        return res.json({
          success: false,
          message: "Incorrect password or email",
        });
      }
      const otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      const existingOTPUser = await UserOTPVerification.findOne({
        email,
      });
      if (existingOTPUser) {
        const hashPassword = await bcrypt.hash(otp, 12);
        await UserOTPVerification.findOneAndUpdate(
          { email },
          {
            otp: hashPassword,
          }
        );
      } else {
        await UserOTPVerification.create({
          email,

          otp,
        });
      }

      await RegisterMail({
        username: user.username,
        text: `Your account login code is ${otp}. Verify and login to your account and do not these code to anyone.`,
        subject: "Account Login OTP",
        userEmail: email,
      });

      res.status(201).json({
        success: true,
        message: `OTP Send successfuly to ${email}`,
      });
    } catch (err) {
      res.json({ message: "User Not Found!" + err.message, success: false });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something Else Went Wrong!" + err.message,
      success: false,
    });
  }
};
module.exports.verifyLoginOTP = async (req, res) => {
  try {
    const { code, email } = req.body;
    try {
      const user = await User.findOne({
        $or: [
          {
            email,
          },
        ],
      });
      if (!user) {
        return res.json({
          success: false,
          message: "Incorrect password or email",
        });
      }
      const otpHolder = await UserOTPVerification.findOne({
        email,
      });
      if (!otpHolder) {
        return res
          .status(401)
          .json({ success: false, message: "You have used Expired OTP" });
      }
      const validOTP = await bcrypt.compare(code, otpHolder.otp);
      if (!validOTP) {
        return res.json({ success: false, message: "Invalid OTP Code" });
      }
      if (otpHolder.email === email && validOTP) {
        await UserOTPVerification.findByIdAndDelete(otpHolder._id);
      }
      const token = createSecretToken(user.username);
      res.cookie("userjwt", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 3600 * 1000,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        message: "User logged in successfully",
        success: true,
        token: token,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "User Not Found " + error.message });
    }
  } catch (err) {
    res.status(500).json({
      message: "Something Else Went Wrong!" + err.message,
      success: false,
    });
  }
};
module.exports.getUserData = async (req, res) => {
  try {
    const { username } = req.user;
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(501)
        .json({ success: false, message: "Couldn't find the User" });
    }
    const { password, ...userData } = Object.assign({}, user.toJSON());
    return res.status(200).json({ success: true, userData });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Can not find the User Data" });
  }
};

module.exports.Location = async (req, res) => {
  try {
    const { lat,long} = req.body;
    let location = await axios
      .get(
        "https://api.opencagedata.com/geocode/v1/json?q=" +
          lat +
          "+" +
          long +
          "&key=74c89b3be64946ac96d777d08b878d43"
      )
      .then(async (res) => {
        console.log(res.data.results);
        let response = res.data.results[0].components;
        console.log(response);
        let { village, county, state_district, state, postcode } = response;
        return String(
          village +
            "," +
            county +
            "," +
            state_district +
            "," +
            state +
            "\n" +
            postcode
        );
      })
      .catch((error) => {
        res.json({ success: false, message: error.message });
      });
    res.status(201).json({ success: true, location });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

module.exports.FoodData = async (req, res) => {
  try {
    const foodData = await FoodData.find({});
    const foodCategory = await FoodCategory.find({});
    res.json({ success: true, foodData, foodCategory });
  } catch (error) {
    // console.error(error.message);
    res.send({ success: false, message: "Server Error" });
  }
};
module.exports.OrderData = async (req, res) => {
  try {
    const { userEmail, order_data } = req.body;
    const order = await Orders.findOne({ email: userEmail });
    if (!order) {
      await Orders.create({ email: userEmail, order_data: [...order_data] });
    } else {
      await Orders.findOneAndUpdate(
        { email: userEmail },
        { $push: { order_data: data } }
      );
    }
    res.status(201).json({ success: true });
  } catch (error) {
    res
      .state(501)
      .json({ success: false, message: "Server Error" + error.message });
  }
};

module.exports.MyOrderDate = async (req, res) => {
  try {
    const { email } = req.body;
    const orderData = await Orders.findOne({ email });
    if (!orderData) {
      res.status(301).json({ success: true, message: "Your Order is Empty" });
    }
    res.state(201).json({ success: true, orderData });
  } catch (error) {
    res
      .status(501)
      .json({ success: false, message: "Server Error" + error.message });
  }
};
