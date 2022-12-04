import express from "express";
import fetch from "node-fetch";
import president from "./president.js";

const app = express.Router();

// Avaliable List
// 目前預設每項都能投

// app.get("/", (req, res) => {
//   const { ticket } = req.params;
//   // Connect database, ticket filter from database.
//   res.status(200).json([
//     {
//       id: "er5JxS",
//       name: { zh: "校長遴選模擬投票", en: "Vote for Principal" },
//     },
//     {
//       id: "yE8Io9",
//       name: { zh: "學生會正副會長投票", en: "Voting abouts SA Leader" },
//     },
//   ]);
// });

// app.get("/:event", (req, res) => {
//   // Auth Bearar Token
//   const { event } = req.params;
//   res.status(200).json({
//     event: {
//       id: event,
//       name: { zh: "學生會正副會長投票", en: "Voting for SA Leader" },
//     },
//     options: [
//       {
//         id: "ar43Tg",
//         title: { zh: "鄧智中 x 陳若瑜，一號候選人", en: "The first team." },
//         description: {
//           zh: "找不到資料 QAQ。",
//           en: "Unfortunately, we dont want to give any data.",
//         },
//         image:
//           "https://s3.hicloud.net.tw/zuvio.public/public/images/question/irs_1653469218e7e2ee75642f0bc44f7a9a15a4d9e3af1641dce0.png",
//       },
//       {
//         id: "7yWuH9",
//         title: { zh: "陳彥伶 x 黃子明，二號候選人", en: "The second team." },
//         description: {
//           zh: "#一張給東華學生的成績單\n➡️生在東華 𝕃𝕚𝕗𝕖\n➡️活在東華 𝕃𝕚v𝕚𝕟𝕘\n➡️樂在東華 𝔼𝕟𝕥𝕖𝕣𝕥𝕒𝕚𝕟𝕞𝕖𝕟𝕥",
//           en: "Unfortunately, we dont have any data.",
//         },
//         image:
//           "https://s3.hicloud.net.tw/zuvio.public/public/images/question/irs_16534692230e934e31dfc334388d077110110ea8ea5756eba5.png",
//       },
//     ],
//   });
// });

// app.post("/:event", (req, res) => {
//   // Auth Bearar Token
//   const { event } = req.params;
//   const { authorization } = req.headers;
//   const { decision } = req.body;
//   res.status(200).json({
//     event: {
//       id: event,
//       name: { zh: "學生會正副會長投票", en: "Voting for SA Leader" },
//     },
//     option: {
//       id: "7yWuH9",
//       title: { zh: "陳彥伶 x 黃子明，二號候選人", en: "The second team." },
//     },
//     stub_token: "cd34fc17-aaff-450c-ad2e-a8106d1f2a40",
//   });
// });

app.use("/president", president);

export default app;
