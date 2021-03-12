# ttfm

A botting API for turntable.fm

# Getting Started

```
yarn add ttfm
```

```ts
const bot: TtfmBotApi = await TtfmApi.connect({
  email: "myawesomebotaccount@gmail.com",
  password: "super secure",
});
// user events
bot.onUserJoin((data) => {
  console.log(chalk.magenta(data.user[0].name), "has joined the room!");
});
bot.onUserLeave((data) => {
  console.log(chalk.magenta(data.user[0].name), "has left the room...");
});

// djs
bot.onAddDj((data) => {
  console.log(chalk.magenta(data.user[0].name), "became a dj!!!");
});

// print chat
bot.onSpeak((data) => {
  if (data.text.match(/robojar/i)) {
    console.log(chalk.magenta(`${data.name}:`), chalk.green(data.text));
  } else {
    console.log(`${chalk.magenta(`${data.name}:`)} ${data.text}`);
  }
});

// join room!
const room = await bot.joinRoom("604065be3f4bfc001be4c5eb");
```
