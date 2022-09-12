const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

const Recruit = require("../schemas/recruit");
const router = express.Router();

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: "sgaem-web",
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 30 * 1024 * 1024 },
}).single("RecruitImgFile");

router.get("/create", (req, res) => {
  res.render("recruit");
});

router.post("/create", async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.json({
        err,
      });
    } else {
      const newRecruit = new Recruit({
        startdate: req.body.startdate,
        enddate: req.body.enddate,
        link: req.body.link,
        imageSrc: {
          data: req.file.location,
          contentType: "image/png",
        },
      });
      newRecruit.save().then(() => {
        return res.json({
          message: "Recruit added",
          statusCode: 201,
          newRecruit,
          url: req.file.location,
        });
      });
    }
  });
});

router.get("/recent", async (req, res) => {
  try {
    const recruitData = await Recruit.find({}).sort({ $natural: -1 }).limit(1);
    if (!recruitData) {
      return res.json({
        message: "리크루팅 정보가 서버에 없습니다",
        statusCode: 401,
      });
    }
    console.log(recruitData[0]);

    return res.json({
      message: "success",
      statusCode: 201,
      recruitData,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      message: "server error",
      statusCode: 500,
      err,
    });
  }
});

module.exports = router;
