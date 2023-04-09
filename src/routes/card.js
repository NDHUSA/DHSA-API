import express from "express";
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

app.get("/store", async (req, res) => {
  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("static_data");
  const partner_store = await collection
    .findOne({
      name: "partner_store",
    })
    .then((x) => x.value);
  await client.close();
  res.status(200).json(partner_store);
});

app.get("/membership/:uid", async (req, res) => {
  const uid = req.params.uid.toUpperCase();

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("static_data");
  const isMember = await collection.countDocuments({
    name: "has_paid_membership",
    value: { $elemMatch: { id: uid } },
  });
  await client.close();

  try {
    if (isMember) {
      res.status(200).json({ status: true, uid: uid, membership: "會費會員" });
    } else {
      res.status(200).json({ status: true, uid: uid, membership: "一般會員" });
    }
  } catch (err) {
    res.status(500).json({ status: false, msg: "fetch err" });
  }
});

app.post("/membership/:uid", async (req, res) => {
  const { uid } = req.params;
  const { token } = req.headers;
  if (token != process.env.membership_afterpay_token) {
    res.status(401).json({ status: false, msg: "Auth error" });
  } else {
    const response = await fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSdFTO7XQghlOXWkjaP1T6hajuzpR9eBCyitUJA2ZZiofgm_Bg/formResponse",
      { method: "POST", body: new URLSearchParams({ "entry.305453546": uid }) }
    );
    if (response.status == 200) {
      res.status(200).json({ status: true, uid: uid });
    } else {
      res
        .status(response.status)
        .json({ status: false, msg: "Form response error", uid: uid });
    }
  }
});

export default app;
