const mongoose = require("mongoose");

const { Schema } = mongoose;

const newsSchema = new Schema({
  headline: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  newstype: {
    type: String,
  },
  imageSrc: {
    data: String,
    contentType: String,
  },
});

module.exports = mongoose.model("News", newsSchema);
