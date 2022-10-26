"use strict";

import fetch from "node-fetch";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import jwt from "jsonwebtoken";
import googleapis, { google } from "googleapis";
import url from "url";

// Constants
const PORT = 8080;
// const HOST = '0.0.0.0';

// App
const app = express();

// Global
app.use(express.json(), cors());

// Index

app.get("/", (req, res) => {
  res.status(200).json({ status: "success" });
});

// Auth

app.get("/auth/google/connect", async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const redirect =
    queryObject.redirect || process.env.HOST + "/auth/google/connect";
  const { code } = queryObject;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirect
  );
  const scopes = ["https://www.googleapis.com/auth/userinfo.email"];

  if (!code) {
    res.status(200).json({
      status: "redirect",
      url: oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        include_granted_scopes: true,
        response_type: "code",
        redirect_uri: redirect,
      }),
    });
  } else {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.credentials = tokens; // eslint-disable-line require-atomic-updates
    const response = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + tokens.id_token
    ).then((response) => response.json());
    const packJWT = await fetch(process.env.HOST + "/user/token", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.tokenGenerator_authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    }).then((packJWT) => packJWT.json());
    res.status(200).json(packJWT);
  }
});

// User

app.post("/user/token", (req, res) => {
  const { authorization } = req.headers;
  if (authorization != "Bearer " + process.env.tokenGenerator_authorization) {
    res.status(401).json({ status: "Invalid Authorization" });
  } else {
    const { hd, email, name, picture } = req.body;
    const data = JSON.stringify({
      iss: process.env.HOST,
      iat: Date.now(),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      hd: hd,
      email: email,
      name: name,
      picture: picture,
    });
    const token = jwt.sign(data, process.env.JWT_SIGNATURE);
    res.status(200).json({ status: "jwtToken", token: token });
  }
});

app.get("/user/token/:token", (req, res) => {
  const { token } = req.params;
  jwt.verify(token, process.env.JWT_SIGNATURE, (err, payload) => {
    if (err) {
      res.status(401).json({ status: "Invalid JWT Token" });
    } else {
      res.status(200).json(payload);
    }
  });
});

// Card

app.get("/card/store", async (req, res) => {
  const response = await fetch(process.env.CACHE + "/store.json");
  res.status(200).json(await response.json());
});

app.get("/card/membership/:stuId", async (req, res) => {
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

// LINE Notify

const lineNotifyOAuthHost = "https://notify-bot.line.me/oauth";
const lineNotifyAPIHost = "https://notify-api.line.me/api";

app.get("/lineNotify/connect", async (req, res) => {
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
app.post("/lineNotify/notify", async (req, res) => {
  const { authorization } = req.headers;
  const { content, attachment } = req.body;
  if (authorization != "Bearer " + process.env.lineNotify_authorization) {
    res.status(401).json({ status: "Invalid Authorization" });
  } else {
    const userName = await fetch(
      process.env.HOST + "/lineNotify/status/" + LN_UserToken,
      {
        method: "GET",
      }
    ).then((userName) => userName.json());
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

app.get("/lineNotify/status/:token", async (req, res) => {
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

// Webhook

app.post("/webhook/lineMessaging", async (req, res) => {
  res.status(200).json({ status: "success" });
});

// Callback

app.get("/callback/lineLogin", (req, res) => {
  res.status(200).json({ status: "success" });
});

app.get("/callback/lineNotify", (req, res) => {
  res.status(200).json({ status: "success" });
});

app.listen(parseInt(process.env.PORT) || 8080, () => {
  console.log(`Running on ${PORT}`);
});
