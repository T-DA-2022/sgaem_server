const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const nunjucks = require("nunjucks");
const dotenv = require("dotenv").config();
const passport = require("passport");
const passportConfig = require("./passport");
const connectDB = require("./schemas");
const cors = require("cors");
const multer = require("multer");
// middlewares

const indexRouter = require("./routes");
const authRouter = require("./routes/auth");
const newsRouter = require("./routes/news");
const compRouter = require("./routes/comp");
const recruitRouter = require("./routes/recruit");
// routers

const app = express();
app.set("view engine", "html");
nunjucks.configure("public", {
  express: app,
  watch: true,
});

passportConfig();
connectDB();

// const redisClient = redis.createClient({
//   //   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
//   //   password: process.env.REDIS_PASSWORD,
//   url: "127.0.0.1",
//   port: 17574,
// });
// app.use(
//   cors({
//     origin: false,
//     credentials: false,
//   })
// );
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.set("port", process.env.PORT || 4000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    },
    // store: localStorage,
    // store: new RedisStore({ client: redisClient }),
  })
);
app.use(passport.initialize());
//app.use(passport.session());

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/news", newsRouter);
app.use("/comp", compRouter);
app.use("/recruit", recruitRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} ???????????? ????????????`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (err) {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
    res.status(err.status || 500);
    res.send(err);
  }
});

app.listen(app.get("port"), () => {
  console.log("????Express Server Running on PORT", app.get("port"));
});
