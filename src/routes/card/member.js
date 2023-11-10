import express, { response } from "express";
import fetch from "node-fetch";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

const app = express.Router();

dotenv.config();
const uri = "mongodb://" + process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check User Status
app.get("/all", async (req, res, next) => {
  const { access_token } = req.headers;

  // Auth Access Toekn
  if (access_token != process.env.CARD_MEMBER_ACCESS_TOKEN) {
    res.status(401).json({
      status: false,
      msg: "Access token invalid",
      access_token: access_token || "null",
    });
    next();
  }

  try {
    await client.connect();
    const database = client.db("dhsa-service");
    const collection = database.collection("users");
    const query = await collection.find({}).toArray();
    res.status(200).json(query);

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err,
      msg: "something wrong when connecting to database",
    });
  } finally {
    await client.close();
  }
});

export default app;
