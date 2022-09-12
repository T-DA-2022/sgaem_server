const mongoose = require("mongoose");

const { Schema } = mongoose;

const compSchema = new Schema({
  startdate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  enddate: {
    type: Date,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  imageSrc: {
    data: String,
    contentType: String,
  },
});

module.exports = mongoose.model("Comp", compSchema);
