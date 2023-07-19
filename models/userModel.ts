import mongoose from "mongoose";
import bcrypt from "bcrypt";
enum Role {
  user,
  admin,
}

const UserSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    min: 5,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    max: 50,
  },
  dateOfCreation: {
    type: Date,
    default: Date.now,
  },
  emeraldAmount: {
    type: Number,
    required: true,
  },
  emeraldUsedAmount: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: Role,
    default: "user",
  },
});

UserSchema.pre("save", async function (next: any) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", UserSchema);
