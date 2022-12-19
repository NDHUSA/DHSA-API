import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/index.js";
import auth_router from "./routes/auth.js";
import workflow_router from "./routes/workflow.js";
import card_router from "./routes/card.js";
import vote_router from "./routes/vote/index.js";

// Constants
const PORT = 8080;

// App
const app = express();
dotenv.config();

// Global
app.use(cors());
app.use(express.json());
app.use("/auth", auth_router);
app.use("/workflow", workflow_router);
app.use("/card", card_router);
app.use("/vote", vote_router);
app.use("/", router);

app.get("*", (req, res) => {
  res.status(404).json({ status: false, msg: "Route Not Found" });
});

app.post("*", (req, res) => {
  res.status(404).json({ status: false, msg: "Route Not Found" });
});

app.listen(parseInt(process.env.PORT) || 8080, () => {
  console.log(`Running on ${PORT}`);
});
