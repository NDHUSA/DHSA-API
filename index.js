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
  res.send('!Hello World!');
});

app.get('/store', async (req, res) => {
  const response = await fetch("https://script.google.com/macros/s/AKfycbxwfVUAaUmpj2Sh7ldxGknQwSHlGETEfUS0GvCgPfeTJ2g4IMLFz4DLfHnQqN5C0TNkVg/exec", {
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