const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  generation: {
    type: String,
  },
  goal: {
    type: String,
  },
  activeMem: {
    type: String,
  },
  activeRole: {
    type: String,
  },
  courseBasic: {
    type: Number,
    default: 0,
  },
  courseCompetition: {
    type: Number,
    default: 0,
  },
  courseContent: {
    type: Number,
    default: 0,
  },
  courseBroadcast: {
    type: Number,
    default: 0,
  },
  courseAdvanced: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("User", userSchema);
