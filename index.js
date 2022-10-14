'use strict';

import fetch from 'node-fetch';
import express, { response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();


// Constants
const PORT = 8080;
// const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.status(200).json({success:true});
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

// Webhook

app.post('/webhook/lineMessaging', async (req, res) => {
  res.status(200).json({success:true});
  res.end();
})

// Callback

app.get('/callback/lineLogin', (req, res) => {
  res.status(200).json({success:true});
  res.end();
})

app.get('/callback/lineNotify', (req, res) => {
  res.status(200).json({success:true});
  // process.env.lineNotify_ClientID
  res.end();
})


app.listen(parseInt(process.env.PORT) || 8080, () => {
  console.log(`Running on ${PORT}`);
});