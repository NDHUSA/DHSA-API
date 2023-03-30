import express from "express";

const app = express.Router();

app.get("/:roomId/open", async (req, res) => {
  const { roomId } = req.params;
  const { token } = req.headers;
  function exp(days) {
    return days * 24 * 60 * 60; // 1 Days
  }
  const expired_timestamp = Math.floor(Date.now() / 1000) + exp(30 * 5); // n Days;
  res.status(200).json({
    status: true,
    roomId: roomId,
    access_expired: expired_timestamp,
    msg: `The door ${roomId} has been opened.\nIt will expired at ${expired_timestamp}.`,
  });
});

app.get("/:roomId/reservation", async (req, res) => {
  const { roomId } = req.params;
  const { from, to } = req.query;
  res.status(200).json([{}]);
});

export default app;
