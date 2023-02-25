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
    // const schoolIdentity = await fetch(process.env.HOST + "/auth/ndhuLDAP", {

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
      // "https://script.google.com/macros/s/AKfycbxUypDclhvuCxYjS23lXLNV-oqBEynziR4tlm4UC41Ou_V-hMbpnF4bz7b0_PNnSpaX/exec"
    ).then((response) => response.json());
    res.status(200).json({
      event: {
        id: event,
        name: { zh: "校長遴選模擬投票", en: "Voting for President" },
      },
      options: response,
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: false, error: "Fetch Error", msg: err.toString() });
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
    // throw new Error(verity.msg);
    res
      .status(401)
      .json({ status: false, error: "no permission to vote", msg: verity.msg });
  } else {
    const { decision } = req.body;
    const uuid = uuidv4();
    const doVote = await fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSephR2KyAAyFKYTkTScIVjdaOVPEUCeKomqhiYBTwo22eKeuA/formResponse",
      {
        method: "POST",
        body: new URLSearchParams({
          "entry.1951820008": uuid,
          "entry.1233176071": decision,
          "entry.717131348": verity.schoolIdentity,
        }),
    }
    );
    const doRecordUid = await fetch(
      "https://docs.google.com/forms/d/e/1FAIpQLSeJQVa88zE-dLpzBZohNvOk6pn9p1SSSiLIj2ChC5QHJNLiUA/formResponse",
      {
        method: "POST",
        body: new URLSearchParams({
          "entry.1612200948": verity.uid,
        }),
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
