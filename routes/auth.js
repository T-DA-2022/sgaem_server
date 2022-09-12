const express = require("express");
const passport = require("passport");
const User = require("../schemas/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
// const { smtpTransport } = require("../middlewares/nodemailer");
const saltRounds = 10;

const SECRET_KEY = process.env.JWT_SECRET;

// access token이 만료된 경우 refresh token을 검증한 후 새로운 access token 발급
router.get(
  "/refresh",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    // refresh token 검증이 완료되면
    try {
      // access token 발급
      const accessToken = jwt.sign({ id: req.user.id }, SECRET_KEY, {
        expiresIn: "1h",
      });
      return res.status(201).send({ accessToken });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.post(
  "/test",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    //jwtDecode(req.authorization);
    try {
      return res.json({ ok: true });
    } catch (error) {
      console.log("here");
      console.error(error);
      next(error);
    }
  }
);

router.get(
  "/userSession",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //console.log(req.session);
    //console.log(req.session.isLoggedIn);
    console.log(req.isAuthenticated());
    return res.send({ isLoggedIn: req.session.isLoggedIn });
  }
);

router.get("/join", (req, res) => {
  res.render("join");
});

router.post("/join", async (req, res) => {
  // console.log(req.body);
  // console.log("test1");
  const { email, password, name, studentId, dob, gender, phone } = req.body;
  // const { username, id, password } = JSON.parse(req.body);
  // username, id, password를 가입할때 받는 것으로 가정.
  // console.log(username, id, password);
  bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
    // Store hash in your password DB.
    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.json({
          message: "user already exists",
          statusCode: 401,
          user,
        });
      }
      const createdUser = await User.create({
        email,
        password: hashedPassword,
        name,
        studentId,
        dob,
        gender,
        phone,
      });
      return res.json({
        message: "success",
        statusCode: 201,
        createdUser,
      });
    } catch (e) {
      console.log(e);
      return res.json({
        message: "user create error",
        statusCode: 500,
        e,
      });
    }
  });
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    (authError, user, info) => {
      // local 로그인 인증
      if (authError) {
        console.error(authError);
        res.send("login error");
        return next(authError);
      }
      if (!user) {
        if (info.message === "No such user") {
          // return res.send("no such user");
          return res.json({
            message: "no such user found",
            statusCode: 401,
          });
        } else if (info.message === "wrong password") {
          // return res.send("wrong password");
          return res.json({
            message: "wrong password",
            statusCode: 402,
          });
        }
        // return res.send("login error");
        return res.json({
          message: "login error",
          statusCode: 500,
        });
        // 이 부분은 info.message에 따라 다르게 구현할 예정
        // 일단은 리디렉션 시킴
      }
      req.logIn(user, { session: false }, (loginError) => {
        if (loginError) {
          res.send("login error");
          console.error(loginError);
          return next(loginError);
        }

        try {
          // access token 발급
          const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
            expiresIn: "6h",
          });
          // refresh token 밝브
          const refreshToken = jwt.sign({}, SECRET_KEY, { expiresIn: "14d" });
          /*
          res.cookie('user', token);
          res.status(201).json({
            result: 'ok',
            token
          });
        */
          //return res.json({ user, token });
          return res.status(201).send({ user, accessToken, refreshToken });
        } catch (err) {
          console.error(err);
          next(err);
        }
      });
    }
  )(req, res, next);
});

router.get("/logout", async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
});

router.get("/mypage", async (req, res) => {
  const user_id = req.body;

  try {
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.json({
        message: "can't find user",
        statusCode: 401,
      });
    }
    console.log(user);
    return res.json({
      message: "success",
      statusCode: 201,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      message: "error on finding user",
      statusCode: 500,
      err,
    });
  }
});

router.post("/fixmypage", async (req, res) => {
  const userData = req.body;
  const userId = userData._id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.json({
        message: "can't find user",
        statusCode: 401,
      });
    }
    const newUser = await User.updateOne(
      { _id: userId },
      {
        $set: {
          name: userData.name,
          studentId: userData.studentId,
          dob: userData.dob,
          phone: userData.phone,
          generation: userData.generation,
          goal: userData.goal,
          activeMem: userData.activeMem,
          activeRole: userData.activeRole,
          courseBasic: userData.courseBasic,
          courseCompetition: userData.courseCompetition,
          courseContent: userData.courseContent,
          courseBroadcast: userData.courseBroadcast,
          courseAdvanced: userData.courseAdvanced,
        },
      }
    );
    console.log(newUser);
    return res.json({
      message: "success user fix",
      statusCode: 201,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      message: "error on finding user",
      statusCode: 500,
      err,
    });
  }
});

module.exports = router;
