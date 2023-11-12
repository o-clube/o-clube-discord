const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * addColumn(valorant_riot_id) => "guild_members"
 * addColumn(valorant_last_match_id) => "guild_members"
 *
 */

const info = {
  revision: 5,
  name: "add-valorant",
  created: "2023-10-26T18:33:04.658Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "addColumn",
    params: [
      "guild_members",
      "valorant_riot_id",
      { type: Sequelize.STRING, field: "valorant_riot_id" },
      { transaction },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "guild_members",
      "valorant_last_match_id",
      { type: Sequelize.STRING, field: "valorant_last_match_id" },
      { transaction },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "removeColumn",
    params: ["guild_members", "valorant_riot_id", { transaction }],
  },
  {
    fn: "removeColumn",
    params: ["guild_members", "valorant_last_match_id", { transaction }],
  },
];

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
  let index = pos;
  const run = (transaction) => {
    const commands = _commands(transaction);
    return new Promise((resolve, reject) => {
      const next = () => {
        if (index < commands.length) {
          const command = commands[index];
          console.log(`[#${index}] execute: ${command.fn}`);
          index++;
          queryInterface[command.fn](...command.params).then(next, reject);
        } else resolve();
      };
      next();
    });
  };
  if (useTransaction) return queryInterface.sequelize.transaction(run);
  return run(null);
};

module.exports = {
  pos,
  useTransaction,
  up: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, migrationCommands),
  down: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, rollbackCommands),
  info,
};
