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
  res.send('Hello World');
});

app.get('/store', async (req, res) => {
  const response = await fetch("https://script.google.com/macros/s/AKfycbxwfVUAaUmpj2Sh7ldxGknQwSHlGETEfUS0GvCgPfeTJ2g4IMLFz4DLfHnQqN5C0TNkVg/exec", {
    method: "GET",
    // // headers: {
    // //   "Content-Type": "application/x-www-form-urlencoded",
    // // },
    // body: new URLSearchParams({
    //   Rcg: 24,
    //   Op: "getpartlist",
    //   Page: 1,
    // }),
  });
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.write(JSON.stringify(await response.json()));
  res.end();
  
})

app.listen(PORT, () => {
  // console.log(`Running on http://${HOST}:${PORT}`);
});