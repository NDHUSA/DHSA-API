'use strict';

import fetch from 'node-fetch';
import express from 'express';
// const fetch = require('node-fetch');


// Constants
const PORT = 8080;
// const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.status(200).json({success:true});
});

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

<<<<<<< HEAD
app.post('/webhook/lineOA', async (req, res) => {
  res.status(200).json({success:true});
=======
app.get('/webhook/lineOA', async (req, res) => {
  res.writeHead(200).json({success:true});
>>>>>>> 53b9e53 (feat(/webhook/lineOA): add 200 reponse)
  res.end();
})


app.listen(parseInt(process.env.PORT) || 8080, () => {
  console.log(`Running on ${PORT}`);
});