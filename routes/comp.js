const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

const Comp = require("../schemas/comp");
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
}).single("CompImgFile");

// const Storage = multer.diskStorage({
//   destination: "uploads",
//   filename: (req, file, cb) => {
//     let extension = path.extname(file.originalname);
//     let basename = path.basename(file.originalname, extension);
//     cb(null, basename + "-" + "comp" + "-" + Date.now() + extension);
//   },
// });

// const upload = multer({
//   storage: Storage,
// }).single("CompImgFile");

router.get("/create", (req, res) => {
  res.render("competition");
});

router.post("/create", async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.json({
        err,
      });
    } else {
      const newComp = new Comp({
        startdate: req.body.startdate,
        enddate: req.body.enddate,
        link: req.body.link,
        imageSrc: {
          data: req.file.location,
          contentType: "image/png",
        },
      });
      newComp.save().then(() => {
        return res.json({
          message: "comp added",
          statusCode: 201,
          newComp,
          url: req.file.location,
        });
      });
    }
  });
});

// router.post("/create", upload, (req, res) => {
//   try {
//     console.log(req.file);
//     res.json({
//       url: req.file.location,
//     });
//   } catch {
//     (err) => {
//       console.log(err);
//     };
//   }
// });

router.get("/recent", async (req, res) => {
  try {
    const compData = await Comp.find({}).sort({ $natural: -1 }).limit(1);
    if (!compData) {
      return res.json({
        message: "대회 정보가 서버에 없습니다",
        statusCode: 401,
      });
    }
    console.log(compData[0]);

    return res.json({
      message: "success",
      statusCode: 201,
      compData,
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
