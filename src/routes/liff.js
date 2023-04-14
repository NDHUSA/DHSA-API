import express from "express";

const app = express.Router();

app.get("/link", async (req, res) => {
  const { origin_link } = req;
});

export default app;
