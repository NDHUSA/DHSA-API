import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/index.js";
import auth_router from "./routes/auth.js";
import user_router from "./routes/user.js";
import trigger_router from "./routes/trigger.js";
import workflow_router from "./routes/workflow.js";
import card_router from "./routes/card/index.js";
import vote_router from "./routes/vote/index.js";
import announce_router from "./routes/announce.js";
import room_router from "./routes/room.js";
import poem_router from "./routes/poem.js";
import checkin_router from "./routes/checkin.js";

// Constants
const PORT = process.env.PORT;

// App
const app = express();
dotenv.config();

// Global
app.use(cors());
app.use(express.json());
app.use("/auth", auth_router);
app.use("/user", user_router);
app.use("/trigger", trigger_router);
app.use("/workflow", workflow_router);
app.use("/card", card_router);
app.use("/vote", vote_router);
app.use("/announce", announce_router);
app.use("/room", room_router);
app.use("/poem", poem_router);
app.use("/checkin", checkin_router);
app.use("/", router);

app.all("*", (req, res) => {
  res.status(404).json({ status: false, msg: "Route Not Found" });
});

app.listen(parseInt(process.env.PORT) || 8080, () => {
  console.log(`Running on ${PORT}`);
});
