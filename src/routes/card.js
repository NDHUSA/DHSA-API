import express from "express";
import fetch from "node-fetch";

const app = express.Router();

app.get("/store", async (req, res) => {
  const response = await fetch(process.env.CACHE + "/store.json");
  res.status(200).json(await response.json());
});

app.get("/membership/:uid", async (req, res) => {
  const { uid } = req.params;
  const response = await fetch(process.env.CACHE + "/paying-member.json").then(
    (response) => response.json()
  );
  let isMember = Boolean(false);
  for (let i = 0; i < response.length; i++) {
    if (uid == response[i].stuId) {
      isMember = Boolean(true);
      break;
    }
  }
  if (isMember == Boolean(true)) {
    res.status(200).json({ uid: uid, membership: "paying" });
  } else {
    res.status(200).json({ uid: uid, membership: "normal" });
  }
});

export default app;
