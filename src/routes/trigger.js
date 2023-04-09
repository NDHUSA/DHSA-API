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

async function doUpdate(table_name, req, res) {
  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("static_data");
  const file_id = await collection
    .findOne({ name: table_name })
    .then((x) => x.GAS_DEPLOY_ID);

  try {
    const resp = await fetch(
      `https://script.google.com/macros/s/${file_id}/exec`
    ).then((x) => x.json());

    const timestamp = new Date();

    await collection.updateOne(
      { name: table_name },
      { $set: { updated_at: timestamp, value: resp } }
    );
    await client.close();
    res
      .status(200)
      .json({ status: true, msg: "update success", updated_at: timestamp });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, msg: "err when fetching or database" });
  }
}

app.patch("/card/store", async (req, res) => {
  await doUpdate("partner_store", req, res);
});

app.patch("/card/membership", async (req, res) => {
  await doUpdate("has_paid_membership", req, res);
});

app.patch("/poem", async (req, res) => {
  await doUpdate("poem", req, res);
});

export default app;
