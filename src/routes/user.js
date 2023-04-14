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

app.get("/me", async (req, res) => {
  const { token } = req.headers;
  const userInfo = await fetch(
    `http://0.0.0.0:${process.env.PORT}` + "/auth/token",
    {
      headers: {
        token: token,
      },
    }
  ).then((x) => x.json());

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
    const result = await collection.findOne(
      {
        email: userInfo.email,
      },
      { projection: { enabled: 0, note: 0, created_at: 0, updated_at: 0 } }
    );

    res.status(200).json(result);
    return;
  }
  const ndhu_role =
    userInfo.email.split("@")[1] == "gms.ndhu.edu.tw"
      ? await fetch(`http://0.0.0.0:${process.env.PORT}` + "/auth/ndhuLDAP", {
          headers: { token: token },
        })
          .then((x) => x.json())
          .then((x) => x.role)
      : null;

  const timestamp = new Date();
  const insertData = {
    created_at: timestamp,
    updated_at: timestamp,
    enabled: true,
    email: userInfo.email,
    name: userInfo.name,
    avatar: userInfo.avatar,
    note: null,
    ndhu_role: ndhu_role || null,
    sa_role: null,
  };
  try {
    const result = await collection.insertOne(insertData);
    const result_query = await collection.findOne(
      {
        email: userInfo.email,
      },
      { projection: { enabled: 0, note: 0, created_at: 0, updated_at: 0 } }
    );

    res.status(200).json(result_query);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "database connection error" });
  }
});

app.patch("/ndhu-role", async (req, res) => {
  const { token } = req.headers;

  const ndhu_role = await fetch(
    "https://preview.api.dhsa.ndhu.me" + "/auth/ndhuLDAP",
    {
      headers: { token: token },
    }
  ).then((x) => x.json());
  const userInfo = await fetch(
    `http://0.0.0.0:${process.env.PORT}` + "/user/me",
    {
      headers: { token: token },
    }
  ).then((x) => x.json());
  const timestamp = new Date();

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("users");
  const updateData = {
    updated_at: timestamp,
    ndhu_role: ndhu_role.role,
  };
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(userInfo._id) },
      {
        $set: updateData,
      }
    );
    res.status(200).json({
      status: true,
      role: ndhu_role.role,
      msg: `The user ${userInfo.name} ${userInfo.email}'s school role has been updated.`,
    });
  } catch (err) {
    res.status(500).json({ err: "database connection error" });
  }
});

export default app;
