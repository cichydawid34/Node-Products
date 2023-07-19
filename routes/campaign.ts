import express from "express";
const router = express.Router();
const Campaign = require("../models/campaignModel");
const User = require("../models/userModel");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

//POST Add Campaign
router.post("/", authenticateUser, async (req: any, res: any) => {
  var err = validationResult(req);
  if (!err.isEmpty()) return res.status(400).send(err);

  // Get the user ID from the JWT token
  const token = req.cookies.jwtToken;
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const userId = decodedToken._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if the user has sufficient balance
    if (user.emeraldAmount < req.body.campaignFund) {
      return res
        .status(400)
        .send("Insufficient balance in the emerald account");
    }

    // Add the campaign
    const campaign = new Campaign({
      campaignName: req.body.campaignName,
      keywords: req.body.keywords,
      bidAmount: req.body.bidAmount,
      campaignFund: req.body.campaignFund,
      status: req.body.status,
      town: req.body.town,
      radius: req.body.radius,
      userId: userId,
    });

    // Check if the campaignName already exists
    const campaignExist = await Campaign.findOne({
      campaignName: req.body.campaignName,
    });

    if (campaignExist) return res.status(400).send("Campaign exist");

    // Save the campaign
    const savedCampaign = await campaign.save();
    // Deduct the campaignFund from the emeraldAccount balance
    user.emeraldAmount -= req.body.campaignFund;

    // Save the updated user data in the database
    await user.save();

    res.status(201).send(savedCampaign);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// GET All Campaigns
router.get("/", authenticateUser, async (req: any, res: any) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 200;
    const id = req.user._id;
    const campaigns = await Campaign.find({ userId: id })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).send(campaigns);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/:id", async (req, res) => {
  const campaignId = req.params.id;
  const campaign = await Campaign.findById(campaignId);
  console.log("campaignId:", campaignId);

  if (!campaign) {
    return res.status(404).json({ error: "Campaign not found" });
  }

  return res.json(campaign);
});

// Update a campaign by ID
router.put("/:id", async (req, res) => {
  try {
    const campaignId = req.params.id;
    const updatedCampaignData = req.body;

    // Find the campaign by ID in the database
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Get the user ID from the campaign data
    const userId = campaign.userId;

    // Fetch the user data from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Deduct the current campaignFund from the user's emeraldAccount balance

    // Save the updated user data with the modified emeraldAccount balance back to the database

    // Now, update the campaign with the new data
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      updatedCampaignData,
      {
        new: true,
      }
    );
    user.emeraldAmount += campaign.campaignFund;

    user.emeraldAmount -= updatedCampaignData.campaignFund;
    res.json(updatedCampaign);
    await user.save();
  } catch (err) {
    console.error("Error updating campaign:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const campaignId = req.params.id;

    // Find the campaign by ID in the database
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }

    // Get the user ID from the campaign data
    const userId = campaign.userId;

    // Fetch the user data from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Add the campaignFund back to the user's emeraldAccount balance

    // Now, delete the campaign from the database
    const deletedCampaign = await Campaign.findByIdAndDelete(campaignId);
    user.emeraldAmount += campaign.campaignFund;

    // Save the updated user data with the added emeraldAccount balance back to the database
    await user.save();

    res.status(200).send(deletedCampaign);
  } catch (err) {
    console.error("Error deleting campaign:", err);
    res.status(500).send("Server Error");
  }
});

export function authenticateUser(req: any, res: any, next: any) {
  const token = req.headers.authorization;
  console.log(req.headers);
  console.log("token" + token);
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized user");
  }
}

module.exports = router;
