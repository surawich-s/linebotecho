require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");

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

  if (event.message.text == "test") {
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
  } else if (event.message.text == "check") {
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
  } else if (event.message.text == "สุ่ม") {
    // create a echoing text message
    const textArray = ["โกโก้", "ดุอิคุงกิ", "โยนาส", "แบล็กโฮลเท่านั้น"];
    const randomText = {
      type: "text",
      text: textArray[Math.floor(Math.random() * textArray.length)],
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
