const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

const News = require("../schemas/news");
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
}).single("NewsImgFile");

router.get("/create", (req, res) => {
  res.render("news");
});

router.post("/create", async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.json({
        err,
      });
    } else {
      const newNews = new News({
        headline: req.body.headline,
        content: req.body.content,
        newstype: req.body.newstype,
        imageSrc: {
          data: req.file.location,
          contentType: "image/png",
        },
      });
      newNews.save().then(() => {
        return res.json({
          message: "News added",
          statusCode: 201,
          newNews,
          url: req.file.location,
        });
      });
    }
  });
});

router.post("/create", async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.json({
        err,
      });
    } else {
      const newNews = new News({
        headline: req.body.headline,
        content: req.body.content,
        newstype: req.body.newstype,
        imageSrc: {
          data: req.file.location,
          contentType: "image/png",
        },
      });
      newNews.save().then(() => {
        return res.json({
          message: "News added",
          statusCode: 201,
          newNews,
          url: req.file.location,
        });
      });
    }
  });
});

router.get("/recent", async (req, res) => {
  try {
    const newsData = await News.find({}).sort({ $natural: -1 }).limit(3);
    if (!newsData) {
      return res.json({
        message: "뉴스 정보가 서버에 없습니다",
        statusCode: 401,
      });
    }

    return res.json({
      message: "success",
      statusCode: 201,
      newsData,
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

router.get("/recent/sgaem", async (req, res) => {
  try {
    const newsData = await News.find({ newstype: "sgaem" })
      .sort({ $natural: -1 })
      .limit(6);
    if (!newsData) {
      return res.json({
        message: "뉴스 정보가 서버에 없습니다",
        statusCode: 401,
      });
    }

    return res.json({
      message: "success",
      statusCode: 201,
      newsData,
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
router.get("/recent/comp", async (req, res) => {
  try {
    const newsData = await News.find({ newstype: "comp" })
      .sort({ $natural: -1 })
      .limit(6);
    if (!newsData) {
      return res.json({
        message: "뉴스 정보가 서버에 없습니다",
        statusCode: 401,
      });
    }

    return res.json({
      message: "success",
      statusCode: 201,
      newsData,
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
