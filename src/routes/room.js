import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

const app = express.Router();

dotenv.config();
const uri = "mongodb://" + process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", async (req, res) => {
  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_list");
  const cursor = collection.find({});
  const result = await cursor.toArray();
  console.log(result);
  res.status(200).json(result);
});

app.post("/", async (req, res) => {
  const { token } = req.headers;
  const { name, description, color, enable } = req.body;
  const timestamp = new Date();

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_list");
  const insertData = {
    name: name,
    description: description,
    created_at: timestamp,
    updated_at: timestamp,
    color: color,
    enable: enable,
  };
  try {
    const result = await collection.insertOne(insertData);
    console.log(result);
    res.status(200).json({
      status: true,
      msg: `The room ${name} has been created.`,
    });
  } catch (err) {
    console.log(err);
    // res.status(409).json({ error: "The room is already exist." });
    res.status(500).json({ err: "database connection error" });
  }
});

app.patch("/:room_id", async (req, res) => {
  const { room_id } = req.params;
  const { token } = req.headers;
  const { name, description, color, enable } = req.body;
  const timestamp = new Date();

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_list");
  const updateData = {
    name: name,
    description: description,
    updated_at: timestamp,
    color: color,
    enable: enable,
  };
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(room_id) },
      { $set: updateData }
    );
    console.log(result);
    res.status(200).json({
      status: true,
      msg: `The room ${name} has been updated.`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "database connection error" });
  }
  // res.status(404).json({ error: "The room is not found." });
});

export default app;
