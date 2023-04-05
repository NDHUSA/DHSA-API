import express from "express";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

const app = express.Router();

dotenv.config();
const uri = "mongodb://" + process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/status", async (req, res) => {
  const { token } = req.headers;

  const userInfo = await fetch(process.env.HOST + "/auth/token", {
    headers: {
      token: token,
    },
  }).then((x) => x.json());
  if (!userInfo.status) {
    res.status(401).json({ status: false, msg: "Invalid token." });
    return;
  }

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("users");
  const isMember =
    (await collection.countDocuments({
      email: userInfo.email,
    })) === 1
      ? true
      : false;
  if (isMember) {
    res.status(200).json({ status: true, isMember: isMember });
  } else {
    const isNDHUer = await fetch(process.env.HOST + "/auth/ndhuLDAP", {
      headers: { token: token },
    }).then((x) => x.json());
    const timestamp = new Date();
    const insertData = {
      created_at: timestamp,
      updated_at: timestamp,
      enabled: true,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar,
      note: null,
      ndhu_role: isNDHUer.role || null,
      sa_role: null,
    };
    try {
      const result = await collection.insertOne(insertData);
      res.status(200).json({
        status: true,
        msg: `The user ${userInfo.name} has been created.`,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: "database connection error" });
    }
  }
});

export default app;
