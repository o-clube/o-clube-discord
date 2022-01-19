
const reel = require("node-reel");
const {generateTermooos} = require("../utils/termooo.js");

module.exports = {
  name: "termooo",
  async run(client) {
    await reel().call(async () => {
      await generateTermooos();
    }).twiceDaily(9, 21).run();
  },
};
