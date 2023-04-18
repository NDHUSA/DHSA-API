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

app.get("/:event_name", async (req, res) => {
  const { event_name } = req.params;
  const { token } = req.headers;
  const { uid } = req.query;

  const userInfo = await fetch(
    `http://0.0.0.0:${process.env.PORT}` + "/user/me",
    {
      headers: { token: token },
    }
  ).then((response) => response.json());
  if (userInfo.sa_role == null) {
    res.status(401).json({ status: false, msg: "Permission denied." });
    return;
  }

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("checkin_records");

  const cursor = collection.find({
    event: event_name.toString(),
    uid: uid || { $exists: true },
  });
  const checkin_record = await cursor.toArray();

  res.status(200).json({
    status: checkin_record.length > 0 ? true : false,
    result: checkin_record,
  });
});

app.post("/:event_name", async (req, res) => {
  const { event_name } = req.params;
  const { token } = req.headers;
  const { uid } = req.body;

  const userInfo = await fetch(
    `http://0.0.0.0:${process.env.PORT}` + "/user/me",
    {
      headers: { token: token },
    }
  ).then((response) => response.json());
  if (userInfo.sa_role == null) {
    res.status(401).json({ status: false, msg: "Permission denied." });
    return;
  }

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("checkin_records");

  const uid_exist =
    (await collection.countDocuments({
      event: event_name.toString(),
      uid: uid,
    })) > 0
      ? true
      : false;

  if (uid_exist) {
    res.status(200).json({ status: false, msg: "UID already exists." });
    return;
  }
  if (uid === null || uid === undefined || uid === "") {
    res.status(200).json({ status: false, msg: "UID is null." });
    return;
  }

  const timestamp = new Date();
  const insert_data = {
    event: event_name.toString(),
    uid: uid,
    created_at: timestamp,
    updated_at: timestamp,
    operator: userInfo.email,
  };
  const result = await collection.insertOne(insert_data);

  res.status(200).json({
    status: true,
    result: result,
  });
});

export default app;
