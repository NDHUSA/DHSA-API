import express from "express";
import fetch from "node-fetch";

const app = express.Router();

app.post("/github/issue", async (req, res) => {
  const { authorization } = req.headers;
  if (authorization != "Bearer " + process.env.workflow_github_authorization) {
    res.status(401).json({ status: "Invalid Authorization" });
  } else {
    const { title, content, repo } = req.body;
    const response = await fetch(
      "https://api.github.com/repos/" + repo + "/issues",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.github_repoToken,
          accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          title: title,
          body: content,
          assignees: ["yc97463"],
          labels: ["user report"],
        }),
      }
    ).then((response) => response.json());
    res.status(200).json(response);
  }
});

export default app;
