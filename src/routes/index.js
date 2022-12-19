import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const app = express.Router();

app.get("/", (req, res) => {
  res.status(200).json({ status: true });
});
app.get("/:resource", function (req, res) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const { resource } = req.params;
  res.sendFile(resource, { root: __dirname + "../../../static" }, (err) => {
    if (err) {
      res.status(404).json({ status: false, msg: "Resource Not Found" });
    }
  });
});

export default app;
