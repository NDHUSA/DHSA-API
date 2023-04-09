import express from "express";
import { MongoClient } from "mongodb";
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
  const collection = database.collection("static_data");
  const poem = await collection
    .findOne({
      name: "poem",
    })
    .then((x) => x.value);
  await client.close();
  res.status(200).json(poem);
});

export default app;
