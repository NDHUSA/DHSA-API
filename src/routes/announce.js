import express from "express";
import pkg from "rss-to-json";
import fetch from "node-fetch";

const app = express.Router();

app.get("/:pid", async (req, res) => {
  const { parse } = pkg;
  const pid = parseInt(req.params.pid);
  const rpageEndpoint = `https://dhsa.ndhu.edu.tw`;
  const rpagePostHTTPStatus = await fetch(
    `${rpageEndpoint}/p/427-1110-${pid}.php?Lang=zh-tw`,
    {
      method: "GET",
    }
  ).then((x) => x.status);

  if (rpagePostHTTPStatus != 200) {
    res
      .status(rpagePostHTTPStatus)
      .json({ status: false, msg: "Something error." });
  } else {
    const response = await parse(
      `${rpageEndpoint}/p/427-1110-${pid}.php?Lang=zh-tw`
    );
    res.status(200).json(response);
  }
});

export default app;
