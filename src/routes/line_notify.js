import express from "express";
import fetch from "node-fetch";

const app = express.Router();

const lineNotifyOAuthHost = "https://notify-bot.line.me/oauth";
const lineNotifyAPIHost = "https://notify-api.line.me/api";

app.get("/connect", async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const code = queryObject.code;
  const state = queryObject.state;
  if (!code) {
    res.status(200).json({
      return:
        lineNotifyOAuthHost +
        "/authorize?client_id=" +
        process.env.lineNotify_ClientID +
        "&redirect_uri=" +
        process.env.lineNotify_CallbackURi +
        "&scope=notify&state=asdf&response_type=code",
    });
  } else {
    const response = await fetch(lineNotifyOAuthHost + "/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.lineNotify_CallbackURi,
        client_id: process.env.lineNotify_ClientID,
        client_secret: process.env.lineNotify_ClientSecret,
      }),
    });
    res.status(200).json(await response.json());
  }
});

const LN_UserToken = process.env.lineNotify_TesterToken;
app.post("/notify", async (req, res) => {
  const { authorization } = req.headers;
  const { content, attachment } = req.body;
  if (authorization != "Bearer " + process.env.lineNotify_authorization) {
    res.status(401).json({ status: "Invalid Authorization" });
  } else {
    const userName = await fetch(process.env.HOST + "/status/" + LN_UserToken, {
      method: "GET",
    }).then((userName) => userName.json());
    const response = await fetch(lineNotifyAPIHost + "/notify", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + LN_UserToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        message: (await userName.target) + `早安！\n==========\n${content}`,
        // imageThumbnail: attachment,
        // imageFullsize: attachment,
        // stickerPackageId: 8522,
        // stickerId: 16581267
      }),
    });
    res.status(200).json(await response.json());
  }
});

app.get("/status/:token", async (req, res) => {
  // :token here is the token in SAID, not token for LINE Notify.
  const { token } = req.params;
  const response = await fetch(lineNotifyAPIHost + "/status", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  res.status(200).json(await response.json());
});

export default app;
