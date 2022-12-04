import express, { response } from "express";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";

const app = express.Router();

// Check User Status
app.get("/status", async (req, res) => {
  const { token } = req.headers;

  // Auth User Toekn
  const verityToken = await fetch(process.env.HOST + "/auth/token", {
    headers: { token: token },
  }).then((response) => response.json());

  if (!verityToken.exp) {
    res.status(401).json({
      status: false,
      error: { jwt: verityToken.error },
      msg: "",
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
    if (
      schoolIdentity.status != "在學" &&
      schoolIdentity.status != "在職" &&
      schoolIdentity.status != "校友"
    ) {
      res.status(401).json({
        status: false,
        msg: `您目前為「${schoolIdentity.status}」，不符合本次投票條件。`,
      });
    } else {
      // if hasVote -> disable
      const hasVote = await fetch(
        "https://script.google.com/macros/s/AKfycbzDHld10p4qE0yVrWpTIU1QAanGd5E-iliXDNsWR4DbVD4BbHSIkmIoNg51xzo3U0Fopg/exec?" +
          new URLSearchParams({
            uid: schoolIdentity.uid,
          }),
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((response) => response.status);
      if (!hasVote) {
        res.status(200).json({
          status: true,
          hasVote: hasVote,
          uid: verityToken.email.split("@")[0],
          schoolIdentity: schoolIdentity.status,
        });
      } else {
        res.status(401).json({ status: false, msg: "曾已投票。" });
      }
    }
  }

  // https://docs.google.com/forms/d/e/1FAIpQLSephR2KyAAyFKYTkTScIVjdaOVPEUCeKomqhiYBTwo22eKeuA/viewform?usp=pp_url&entry.1951820008=AAAAA&entry.1233176071=BBBBB
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
    console.log(err);
    res.status(500).json({ status: "Fetch Error", msg: err.toString() });
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
    res.status(401).json({ error: "no permission to vote", msg: verity.msg });
  } else {
    console.log(req.body);
    const { decision } = req.body;
    console.log(decision);
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
    );
    if (doVote.status == 200) {
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
          event: eventInfos.event,
          option: eventInfos.options[i],
          stub_token: uuid,
        });
      }
    } else {
      res.status(doVote.status).json({ status: "Form response error" });
    }
  }
});

export default app;
