import express, { response } from "express";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";

const app = express.Router();
// const uri = "mongodb://" + process.env.MONGO_URI;

const client = new MongoClient(uri);

// Check User Status
app.get("/status", async (req, res) => {
  const { token } = req.headers;

  // Auth User Toekn
  const verityToken = await fetch(process.env.HOST + "/auth/token", {
    headers: { token: token },
  }).then((response) => response.json());

  if (!verityToken.status) {
    res.status(401).json({
      status: false,
      msg: verityToken.error,
    });
  } else if (verityToken.email.split("@")[1] != "gms.ndhu.edu.tw") {
    res.status(401).json({
      status: false,
      error: "domain not match",
      msg: "非 @gms.ndhu.edu.tw 結尾的 Google 帳號。",
    });
  } else {
    // Verity User Identity at school
    const schoolIdentity = await fetch(
      "https://api.dhsa.ndhu.edu.tw/auth/ndhuLDAP",
      {
        headers: { token: token },
      }
    ).then((response) => response.json());

    if (!schoolIdentity.status) {
      res.status(401).json({
        status: false,
        error: "not match",
        msg: `您目前為「${schoolIdentity.status}」，不符合本次投票條件。`,
      });
    } else {
      // if hasVote -> disable
      let hasVoted = false;
      try {
        await client.connect();
        const database = client.db("dhsa-service");
        const collection = database.collection("votePresidentHasVoted");
        const query = await collection
          .find({ uid: schoolIdentity.uid.toString() })
          .toArray();
        hasVoted = query.length == 0 ? false : query;
      } catch (err) {
        res.status(500).json({
          status: false,
          error: err,
          msg: "something wrong when connecting to database",
        });
      } finally {
        await client.close();
      }
      if (!hasVoted) {
        res.status(200).json({
          status: true,
          hasVote: hasVoted,
          uid: verityToken.email.split("@")[0],
          schoolIdentity: schoolIdentity.status,
        });
      } else {
        res.status(401).json({
          status: false,
          msg: `UID: ${verityToken.email.split("@")[0]} 曾已於 ${
            hasVoted[0].timestampHumanDate
          } 投票。`,
        });
      }
    }
  }
});

const event = "president";

// Get Options
app.get("/", async (req, res) => {
  try {
    const response = await fetch(
      process.env.CACHE + "/vote-president-options.json"
    ).then((response) => response.json());
    res.status(200).json({
      event: {
        id: event,
        name: { zh: "校長遴選模擬投票", en: "Voting for President" },
      },
      options: response,
    });
  } catch (err) {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxUypDclhvuCxYjS23lXLNV-oqBEynziR4tlm4UC41Ou_V-hMbpnF4bz7b0_PNnSpaX/exec"
      ).then((response) => response.json());
      res.status(200).json({
        event: {
          id: event,
          name: { zh: "校長遴選模擬投票", en: "Voting for President" },
        },
        options: response,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: "Totally Fetch Error",
        msg: err.toString(),
      });
    }
  }
});

// Empty All Records
app.delete("/", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("dhsa-service");

    // votePresidentTickets
    const resultTickets = await database
      .collection("votePresidentTickets")
      .deleteMany({});

    // votePresidentHasVoted
    const resultVoted = await database
      .collection("votePresidentHasVoted")
      .deleteMany({});
    res.status(200).json({
      status: true,
      msg: `Done! ${resultTickets.deletedCount} + ${resultVoted.deletedCount} document(s) had been deleted this time.`,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: "database connection error",
      msg: err.toString(),
    });
  } finally {
    await client.close();
  }
});

// Vote
app.post("/", async (req, res) => {
  const { token } = req.headers;
  // Auth By /status
  const verity = await fetch(process.env.HOST + "/vote/president/status", {
    headers: { token: token },
  }).then((response) => response.json());
  if (!verity.status) {
    res
      .status(401)
      .json({ status: false, error: "no permission to vote", msg: verity.msg });
  } else {
    const { decision } = req.body;
    const uuid = uuidv4();
    const timestampHumanDate = new Date().toDateString();
    const timestamp = new Date();

    // connect with database
    const database = client.db("dhsa-service");
    try {
      await client.connect();
    } catch (err) {
      res.status(500).json({
        status: false,
        error: "database connection error",
        msg: err.toString(),
      });
    }

    // doVote
    try {
      const collection = database.collection("votePresidentTickets");
      const insertData = {
        uuid: uuid,
        decision: decision,
        role: verity.schoolIdentity,
        timestamp: timestamp,
        timestampHumanDate: timestampHumanDate,
      };
      const doVote = await collection.insertOne(insertData);
    } catch (err) {
      res.status(500).json({
        status: false,
        error: "database error when inserting ticket infomation",
        msg: err.toString(),
      });
    }

    // doRecordUid
    try {
      const collection = database.collection("votePresidentHasVoted");
      const insertData = {
        uid: verity.uid,
        timestamp: timestamp,
        timestampHumanDate: timestampHumanDate,
      };
      const doRecordUid = await collection.insertOne(insertData);
    } catch (err) {
      res.status(500).json({
        status: false,
        error: "database error when inserting user information",
        msg: err.toString(),
      });
    } finally {
      await client.close();
    }

    const eventInfos = await fetch(process.env.HOST + "/vote/president")
      .then((response) => response.json())
      .then((response) => response);
    let i = 0;
    for (i = 0; i < eventInfos.options.length; i++) {
      if (eventInfos.options[i].id == decision) {
        break;
      }
      // 找到 :id 在第幾個
    }
    if (i == eventInfos.options.length) {
      res.status(417).json({ status: "option not found" });
    } else {
      res.status(200).json({
        status: true,
        event: eventInfos.event,
        option: eventInfos.options[i],
        stub_token: uuid,
      });
    }
  }
});

export default app;
