import mongoose from "mongoose";
const User = require("../models/userModel");
enum Towns {
  Kraków,
  Warszawa,
  Tarnów,
}
enum Status {
  On,
  Off,
}

const ProductCampaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  campaignName: {
    type: String,
    required: true,
  },
  keywords: {
    type: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  bidAmount: {
    type: Number,
    required: true,
  },
  campaignFund: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Status,
    required: true,
  },
  town: {
    type: String,
    required: true,
  },
  radius: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("ProductCampaign", ProductCampaignSchema);
