import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
var cors = require("cors");
import path from "path";
require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

//Routes

//Users
const routerCampaigns = require("../routes/campaign");
app.use("/campaigns", routerCampaigns);

const routerUsers = require("../routes/users");
app.use("/users", routerUsers);

//Deployment
__dirname = path.resolve();
if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.use("/", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.send("Products World");
  });
}
let uri: any = process.env.DB_CONNECTION;
//Database
const connectDB = async () => {
  try {
    console.log(uri);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => console.log(`Server Running `));
});
