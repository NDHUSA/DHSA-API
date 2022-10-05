const express = require('express');
const app = express()
const port = 3310

// app.use('/api/user', require('./expressUser'));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})