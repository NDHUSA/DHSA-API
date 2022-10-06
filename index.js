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
  res.send('!!!!Hello World!!!!');
});

app.get('/card/store', async (req, res) => {
  const response = await fetch("https://github.com/yc97463/DHSA-API/raw/main/dist/store.json", {
    method: "GET" 
  });
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.write(JSON.stringify(await response.json()));
  res.end();
  
})


app.listen(parseInt(process.env.PORT) || 8080, () => {
  console.log(`Running on ${PORT}`);
});