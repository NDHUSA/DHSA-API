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

  const userInfo = await fetch(process.env.HOST + "/user/me", {
    headers: {
      token: token,
    },
  }).then((x) => x.json());
  if (userInfo.sa_role == null) {
    res.status(401).json({ status: false, msg: "Permission denied." });
    return;
  }

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

app.get("/time-slot", async (req, res) => {
  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_time_slot");
  const cursor = collection.find({});
  const result = await cursor.toArray();
  res.status(200).json(result);
});

app.patch("/:room_id", async (req, res) => {
  const { room_id } = req.params;
  const { token } = req.headers;
  const { name, description, color, enable } = req.body;
  const timestamp = new Date();

  const userInfo = await fetch(process.env.HOST + "/user/me", {
    headers: {
      token: token,
    },
  }).then((x) => x.json());
  if (userInfo.sa_role == null) {
    res.status(401).json({ status: false, msg: "Permission denied." });
    return;
  }

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

app.get("/:room_id/reserve", async (req, res) => {
  const { room_id } = req.params;
  let { from, to, time_slot } = req.query;

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_reservation");
  const cursor = collection.find({
    room_id: room_id,
    date: { $gte: new Date(from), $lt: new Date(to) },
    // time_slot_id: time_slot,
  });
  const result = await cursor.toArray();
  res.status(200).json(result);
});

app.post("/:room_id/reserve", async (req, res) => {
  const { room_id } = req.params;
  const { token } = req.headers;
  const { date, time_slot_id, name, phone, event_name, org_name, note } =
    req.body;
  const timestamp = new Date();

  const userInfo = await fetch(process.env.HOST + "/user/me", {
    headers: {
      token: token,
    },
  }).then((res) => res.json());
  if (userInfo._id == null) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_reservation");
  // find approved is null and true -> isReserved = true
  const isReserved =
    (await collection.countDocuments({
      date: new Date(date),
      time_slot_id: time_slot_id,
      room_id: room_id,
      review: {
        approved: { $ne: false },
      },
    })) > 0
      ? true
      : false;

  if (isReserved) {
    res.status(400).json({
      status: false,
      msg: `The room and target time is already reserved.`,
    });
  } else {
    const insertData = {
      date: new Date(date),
      time_slot_id: time_slot_id,
      room_id: room_id,
      created_at: timestamp,
      updated_at: timestamp,
      event_name: event_name,
      borrower: name,
      phone: phone,
      email: userInfo.email,
      org_name: org_name,
      note: note,
      review: {
        approved: null,
        approved_at: null,
        approved_by: null,
        approved_note: null,
      },
    };
    try {
      const result = await collection.insertOne(insertData);

      res.status(200).json({
        status: true,
        msg: `The reservation has been created.\nYou will get an email when we review your application.`,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ err: "database connection error" });
    }
  }
});

app.get("/:room_id/reserve/:reservation_id", async (req, res) => {
  // exclude owner, security and IT, return public info
});

app.patch("/:room_id/reserve/:reservation_id", async (req, res) => {
  const { room_id, reservation_id } = req.params;
  const { token } = req.headers;
  const {
    time_slot_id,
    event_name,
    borrower_name,
    phone,
    email,
    org_name,
    note,
  } = req.body;
  const updated_at = new Date();
  const timestamp = new Date();

  const userInfo = await fetch(process.env.HOST + "/user/me", {
    headers: {
      token: token,
    },
  }).then((x) => x.json());
  if (userInfo.sa_role == null) {
    res.status(401).json({ status: false, msg: "Permission denied." });
    return;
  }

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_reservation");
  const updateData = {
    time_slot_id: time_slot_id,
    updated_at: timestamp,
    event_name: event_name,
    borrower: borrower_name,
    phone: phone,
    email: email,
    org_name: org_name,
    note: note,
    review: {
      approved: false,
      approved_at: null,
      approved_by: null,
      approved_note: null,
    },
  };
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(reservation_id) },
      { $set: updateData }
    );
    console.log(result);
    res.status(200).json({
      status: true,
      msg: `The reservation ${reservation_id} has been updated.`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "database connection error" });
  }
});

app.delete("/:room_id/reserve/:reservation_id", async (req, res) => {
  const { room_id, reservation_id } = req.params;
  const { token } = req.headers;
  const timestamp = new Date();
  // log deleted record

  const userInfo = await fetch(process.env.HOST + "/user/me", {
    headers: {
      token: token,
    },
  }).then((x) => x.json());
  if (userInfo.sa_role == null) {
    res.status(401).json({ status: false, msg: "Permission denied." });
    return;
  }

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_reservation");
  try {
    const result = await collection.deleteOne({
      _id: new ObjectId(reservation_id),
    });
    if (result.deletedCount === 0) {
      res.status(404).json({
        status: false,
        msg: `The reservation ${reservation_id} is not found.`,
      });
    } else {
      res.status(200).json({
        status: true,
        msg: `The reservation ${reservation_id} has been deleted.`,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "database connection error" });
  }
});

app.patch("/:room_id/review/:reservation_id", async (req, res) => {
  const { room_id, reservation_id } = req.params;
  const { token } = req.headers;
  const { approved, approved_note } = req.body;
  const timestamp = new Date();
  // check user role, only security and it can do action

  const userInfo = await fetch(process.env.HOST + "/user/me", {
    headers: {
      token: token,
    },
  }).then((x) => x.json());
  if (userInfo.sa_role == null) {
    res.status(401).json({ status: false, msg: "Permission denied." });
    return;
  }

  await client.connect();
  const database = client.db("dhsa-service");
  const collection = database.collection("room_reservation");
  const updateData = {
    review: {
      approved: approved,
      approved_at: timestamp,
      approved_by: userInfo.email,
      approved_note: approved_note,
    },
  };
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(reservation_id) },
      { $set: updateData }
    );
    res.status(200).json({
      status: true,
      msg: `The reservation ${reservation_id} has been updated.`,
    });
  } catch (err) {
    res.status(500).json({ err: "database connection error" });
  }
});

app.get("/:room_id/unlock", async (req, res) => {
  const { room_id } = req.params;
  const { token } = req.headers;
  function exp(days) {
    return days * 24 * 60 * 60; // 1 Days
  }
  const expired_timestamp = Math.floor(new Date() / 1000) + exp(30 * 5); // n Days;
  res.status(200).json({
    status: true,
    room_id: room_id,
    access_expired_at: expired_timestamp,
    msg: `The door ${room_id} has been opened.\nIt will expired at ${expired_timestamp}.`,
  });
});

export default app;
