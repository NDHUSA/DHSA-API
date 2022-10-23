'use strict';

import fetch from 'node-fetch';
import express, { response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import url from 'url';


// Constants
const PORT = 8080;
// const HOST = '0.0.0.0';

// App
const app = express();

// Global
app.use(express.json());

// Index
app.get('/', (req, res) => {
  res.status(200).json({status: "success"});
  res.end();
});

// Card

app.get('/card/store', async (req, res) => {
  const response = await fetch("https://yc97463.github.io/DHSA-API/store.json", {
    method: "GET" 
  });
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.write(JSON.stringify(await response.json()));
  res.end();
  
})

// LINE Notify

const lineNotifyOAuthHost = "https://notify-bot.line.me/oauth";
const lineNotifyAPIHost = "https://notify-api.line.me/api";

app.get('/lineNotify/connect',async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const code = queryObject.code;
  const state = queryObject.state;
  if(!code){
    res.status(200).json({return:lineNotifyOAuthHost+"/authorize?client_id="+process.env.lineNotify_ClientID+"&redirect_uri="+process.env.lineNotify_CallbackURi+"&scope=notify&state=asdf&response_type=code"})
  }else{
    const response = await fetch(lineNotifyOAuthHost+"/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.lineNotify_CallbackURi,
        client_id: process.env.lineNotify_ClientID,
        client_secret: process.env.lineNotify_ClientSecret,
      }),
    });
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(JSON.stringify(await response.json()));
    res.end();
  }
})

const LN_UserToken = process.env.lineNotify_TesterToken;
app.post('/lineNotify/notify',async (req, res) => {
  const { submitToken, content, attachment } = req.body;
  if(submitToken!=process.env.lineNotify_sendToken){
    res.status(401).json({status: "Invalid submitToken"});
    res.end();
  }else{
    const userName = await fetch(process.env.HOST+"/lineNotify/status/"+LN_UserToken, {
      method: "GET"
    }).then(userName => userName.json());
    const response = await fetch(lineNotifyAPIHost+"/notify", {
      method: "POST",
      headers: {
        "Authorization": "Bearer "+LN_UserToken,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        message: await userName.target+`早安！\n==========\n${content}`,
        // imageThumbnail: attachment,
        // imageFullsize: attachment,
        // stickerPackageId: 8522,
        // stickerId: 16581267
      }),
    });
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(JSON.stringify(await response.json()));
    res.end();
  }
app.post('/lineNotify/notify',async (req, res) => {
  const userName = await fetch(process.env.HOST+"/lineNotify/status", {
    method: "POST"
  }).then(userName => userName.json());
  const response = await fetch(lineNotifyAPIHost+"/notify", {
    method: "POST",
    headers: {
      "Authorization": "Bearer "+LN_Usertoken,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      message: await userName.target+`早安！
晚安大家`,
      imageThumbnail: "https://miro.medium.com/max/1400/1*cYbw3hyi3dDG7aFy_-wdUg.png",
      imageFullsize: "https://miro.medium.com/max/1400/1*cYbw3hyi3dDG7aFy_-wdUg.png",
      stickerPackageId: 8522,
      stickerId: 16581267
    }),
  });
  
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.write(JSON.stringify(await response.json()));
  res.end();
})

app.get('/lineNotify/status/:token', async (req, res) => {
  // :token here is the token in SAID, not token for LINE Notify.
  const {token} = req.params;
  const response = await fetch(lineNotifyAPIHost+"/status", {
    method: "GET",
    headers: {
      "Authorization": "Bearer "+token,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.write(JSON.stringify(await response.json()));
  res.end();
})

// Webhook

app.post('/webhook/lineMessaging', async (req, res) => {
  res.status(200).json({status: "success"});
  res.end();
})

// Callback

app.get('/callback/lineLogin', (req, res) => {
  res.status(200).json({status: "success"});
  res.end();
})

app.get('/callback/lineNotify', (req, res) => {
  res.status(200).json({status: "success"});
  // process.env.lineNotify_ClientID
  res.end();
})

// Callback

app.get('/callback/lineLogin', (req, res) => {
  res.status(200).json({status: "success"});
  res.end();
})

app.get('/callback/lineNotify', (req, res) => {
  res.status(200).json({status: "success"});
  // process.env.lineNotify_ClientID
  res.end();
})

// Callback

app.get('/callback/lineLogin', (req, res) => {
  res.status(200).json({status: "success"});
  res.end();
})

app.get('/callback/lineNotify', (req, res) => {
  res.status(200).json({status: "success"});
  // process.env.lineNotify_ClientID
  res.end();
})


app.listen(parseInt(process.env.PORT) || 8080, () => {
  console.log(`Running on ${PORT}`);
});