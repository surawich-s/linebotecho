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
  const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const string = event.message.text.trim(" ");
  const operator = string[string.search(format)];
  const nums = string.split(format);
  const num1 = Number(nums[0]);
  const num2 = Number(nums[1]);
  let cal = 0;
  switch (operator) {
    case "+":
      cal = num1 + num2;
    case "-":
      cal = num1 - num2;
    case "/":
      cal = num1 / num2;
    case "*":
      cal = num1 * num2;
  }

  const message = { type: "text", text: cal };
  return client.replyMessage(event.replyToken, message);

  // create a echoing text message
  // const textArray = ["โกโก้", "ดุอิคุงกิ", "โยนาส", "แบล็กโฮลเท่านั้น"];
  // const echo = {
  //   type: "text",
  //   text: textArray[Math.floor(Math.random() * textArray.length)],
  // };
  // use reply API
  // return client.replyMessage(event.replyToken, sum);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
