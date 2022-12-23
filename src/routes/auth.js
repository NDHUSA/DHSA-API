import express, { response } from "express";
import jwt from "jsonwebtoken";
import url from "url";
import fetch from "node-fetch";
import { google } from "googleapis";
import { ndhuLdapAuth } from "private-libs/src/ndhuLdapAuth.mjs";

const app = express.Router();

app.get("/google", async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const redirect = queryObject.redirect || process.env.HOST + "/auth/google";
  const { code } = queryObject;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirect
  );
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
  ];

  if (!code) {
    res.status(200).json({
      status: true,
      url: oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        include_granted_scopes: true,
        response_type: "code",
        redirect_uri: redirect,
      }),
    });
  } else {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.credentials = tokens; // eslint-disable-line require-atomic-updates
      const response = await fetch(
        "https://oauth2.googleapis.com/tokeninfo?id_token=" + tokens.id_token
      ).then((response) => response.json());
      const packJWT = await fetch(process.env.HOST + "/auth/token", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.tokenGenerator_authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      }).then((packJWT) => packJWT.json());
      res.status(200).json(packJWT);
    } catch (err) {
      res.status(400).json({ status: false, msg: "Auth Error" });
    }
  }
});

app.get("/ndhuLDAP", async (req, res) => {
  const { token } = req.headers;
  const userInfo = await fetch(process.env.HOST + "/auth/token", {
    method: "GET",
    headers: { token: token },
  }).then((response) => response.json());
  if (!userInfo.status) res.status(401).json(userInfo);

  try {
    const accountId = userInfo.email.split("@")[0].toLowerCase();
    const response = await ndhuLdapAuth(accountId);
    const isNDHUer = ["在職", "在學", "校友"].includes(response[1])
      ? true
      : false;
    res.status(200).json({
      status: isNDHUer,
      uid: accountId,
      role: response[1] ? response[1] : response[0],
    });
  } catch (err) {
    res.status(500).json({ status: false, err });
  }
});

app.get("/token", (req, res) => {
  const { token } = req.headers;
  jwt.verify(token, process.env.JWT_SIGNATURE, (err, payload) => {
    if (err) {
      res.status(401).json({ status: false, msg: "Invalid JWT Token" });
    } else {
      payload.status = true;
      res.status(200).json(payload);
    }
  });
});

app.post("/token", (req, res) => {
  function exp(days) {
    return days * 24 * 60 * 60; // 1 Days
  }
  const { authorization } = req.headers;
  if (authorization != "Bearer " + process.env.tokenGenerator_authorization) {
    res.status(401).json({ status: false, msg: "Invalid Authorization" });
  } else {
    const { hd, email, name, picture } = req.body;
    const data = JSON.stringify({
      iss: process.env.HOST,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + exp(30 * 5), // n Days
      email: email.toLowerCase(),
      hd: email.split("@")[1].toLowerCase(),
      name: name,
      avatar: picture,
    });
    const token = jwt.sign(data, process.env.JWT_SIGNATURE);
    res.status(200).json({ status: true, token: token });
  }
});

export default app;
