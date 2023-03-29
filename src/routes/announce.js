import express from "express";
import pkg from "rss-to-json";

const app = express.Router();

app.get("/:pid", async (req, res) => {
  const { parse } = pkg;
  const pid = req.params.pid;
  let response = await parse(
    `https://dhsa.ndhu.edu.tw/p/427-1110-${pid}.php?Lang=zh-tw`
  );
  res.status(200).json(response);
});

export default app;
