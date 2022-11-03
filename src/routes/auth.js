import express, { response } from "express";
import jwt from "jsonwebtoken";
import url from "url";
import fetch from "node-fetch";
import { google } from "googleapis";
import md5 from "md5";
import https from "https";

const app = express.Router();

app.get("/google", async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const redirect =
    queryObject.redirect || process.env.HOST + "/auth/google/connect";
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
      res.status(400).json({ status: "Auth Error" });
    }
  }
});

app.get("/ndhuLDAP/:stuId", async (req, res) => {
  const { stuId } = req.params;
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  try {
  } catch (err) {
    console.log(err);
    res.end();
  }
});

app.post("/token", (req, res) => {
  const { authorization } = req.headers;
  if (authorization != "Bearer " + process.env.tokenGenerator_authorization) {
    res.status(401).json({ status: "Invalid Authorization" });
  } else {
    const { hd, email, name, picture } = req.body;
    const data = JSON.stringify({
      iss: process.env.HOST,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      email: email,
      hd: email.split("@")[1],
      name: name,
      avatar: picture,
    });
    const token = jwt.sign(data, process.env.JWT_SIGNATURE);
    res.status(200).json({ status: "jwtToken", token: token });
  }
});

app.get("/token/:token", (req, res) => {
  const { token } = req.params;
  jwt.verify(token, process.env.JWT_SIGNATURE, (err, payload) => {
    if (err) {
      res.status(401).json({ status: "Invalid JWT Token" });
    } else {
      res.status(200).json(payload);
    }
  });
});

export default app;
