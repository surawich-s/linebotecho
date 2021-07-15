require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");
const axios = require("axios");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc

const date = new Date();
const result = date.toLocaleDateString("th-TH", {
  year: "numeric",
  month: "long",
});
const dateToLotto =
  String(date.getDate() > 15 ? "16" : "01") +
  (date.getMonth() > 9 ? "" : "0") +
  String(date.getMonth() + 1) +
  String(date.getFullYear() + 543);

const configLottoApi = {
  method: "post",
  url: `https://api.krupreecha.com/${dateToLotto}`,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "5e7a91f6fa6baa67a4930c36c4e2981d",
  },
  // data: data,
};

app.get("/", (req, res) => {
  res.send("hello this is linebot test");
});

app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const keywordsLotto = ["หวย", "สลาก", "ตรวจ"];
  const keywordsHelloBot = ["สวัสดี", "บอท", "ทัก"];

  if (
    keywordsHelloBot.some((keyword) => event.message.text.includes(keyword))
  ) {
    client
      .getProfile(event.source.userId)
      .then((profile) => {
        const message = {
          type: "text",
          text: "ว่าไง " + profile.displayName,
        };
        return client.replyMessage(event.replyToken, message);
      })
      .catch((err) => {
        console.log(error);
      });
  } else if (event.message.text.toLowerCase() == "check") {
    const message = {
      type: "text",
      text:
        "userId: " +
        event.source.userId +
        " " +
        "roomId: " +
        event.source.roomId,
    };
    return client.replyMessage(event.replyToken, message);
  } else if (
    keywordsLotto.some((keyword) => event.message.text.includes(keyword))
  ) {
    axios(configLottoApi)
      .then(function (response) {
        console.log(JSON.stringify(response.data.result[0]));
        const lottoReward = response.data.result;
        const text =
          "งวดที่ " +
          String(date.getDate() > 15 ? "16" : "1") +
          " " +
          result +
          "\n\nรางวัลที่ 1 : " +
          lottoReward[0].number +
          "\n\nเลขท้าย 2 ตัว : " +
          lottoReward[3].number;
        const message = { type: "text", text: text };
        return client.replyMessage(event.replyToken, message);
      })
      .catch(function (error) {
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "หวยยังไม่ออก รีบไปไหนวะ",
        });
      });
  } else if (event.message.text.search("สุ่ม") > -1) {
    // create a echoing text message
    // const textArray = ["โกโก้", "ดุอิคุงกิ", "โยนาส", "แบล็กโฮลเท่านั้น"];
    // const randomText = {
    //   type: "text",
    //   text: textArray[Math.floor(Math.random() * textArray.length)],
    // };
    let maxNum = 100;
    const res = Number(str.split(" ")[1] - 1);
    if (res) {
      maxNum = res;
    }
    const randomText = {
      type: "text",
      text: "สุ่มได้ " + String(Math.floor(Math.random() * maxNum)),
    };
    // use reply API
    return client.replyMessage(event.replyToken, randomText);
  } else {
    const cal = eval(event.message.text.trim(" "));

    const message = { type: "text", text: cal };
    return client.replyMessage(event.replyToken, message);
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
