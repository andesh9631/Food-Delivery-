if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ExpressError = require("./utility/ExpressError");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const UserRoute = require("./Routes/userRoutes")
const cors = require("cors");
const morgan = require("morgan");
const Port = process.env.PORT || 2020;


const connectMongo = async () => {
  await mongoose.connect(`${process.env.ATLUS_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
connectMongo()
  .then(() => {
    console.log("Yes I can establish the connection");
  })
  .catch((error) => {
    console.log("OH NO WHAT I MAKE MISTAKE MONGOOES IS NOT WORKING");
    console.log(error);
  });

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL ||
        process.env.PROVIDER_URL ||
        "http//localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("tiny"));
app.disable("x-powered-by");
app.use("/api/auth/fooddelivery", UserRoute);
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong";
  res.status(statusCode).json(err);
});
app.listen(Port, () => {
  console.log(`Listening on port ${Port}`);
});
