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

app.all("/card/store", async (req, res) => {
  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("static_data");
  const file_id = await collection
    .findOne({ name: "partner_store" })
    .then((x) => x.GAS_FILE_ID);

  try {
    const resp = await fetch(
      `https://script.google.com/macros/s/${file_id}/exec`
    ).then((x) => x.json());

    const timestamp = new Date();

    await collection.updateOne(
      { name: "partner_store" },
      { $set: { updated_at: timestamp, value: resp } }
    );
    await client.close();
    res
      .status(200)
      .json({ status: true, msg: "update success", updated_at: timestamp });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ status: false, msg: "err when fetching or database" });
  }
});

app.patch("/card/membership", async (req, res) => {
  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("static_data");
  const file_id = await collection
    .findOne({ name: "partner_store" })
    .then((x) => x.GAS_FILE_ID);

  try {
    const resp = await fetch(
      `https://script.google.com/macros/s/${file_id}/exec`
    ).then((x) => x.json());

    const timestamp = new Date();

    await collection.updateOne(
      { name: "has_paid_membership" },
      { $set: { updated_at: timestamp, value: resp } }
    );
    await client.close();
    res
      .status(200)
      .json({ status: true, msg: "update success", updated_at: timestamp });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ status: false, msg: "err when fetching or database" });
  }
});

export default app;
