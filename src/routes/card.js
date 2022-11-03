import express from "express";
import fetch from "node-fetch";

const app = express.Router();

app.get("/store", async (req, res) => {
  const response = await fetch(process.env.CACHE + "/store.json");
  res.status(200).json(await response.json());
});

app.get("/membership/:stuId", async (req, res) => {
  const { stuId } = req.params;
  const response = await fetch(process.env.CACHE + "/paying-member.json").then(
    (response) => response.json()
  );
  let isMember = Boolean(false);
  for (let i = 0; i < response.length; i++) {
    if (stuId == response[i].stuId) {
      isMember = Boolean(true);
      break;
    }
  }
  if (isMember == Boolean(true)) {
    res.status(200).json({ stuId: stuId, membership: "paying" });
  } else {
    res.status(200).json({ stuId: stuId, membership: "normal" });
  }
});

export default app;
