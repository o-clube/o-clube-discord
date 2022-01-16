const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable() => "guilds", deps: []
 * createTable() => "guild_members", deps: [guilds]
 * createTable() => "guild_termooos", deps: [guilds]
 *
 */

const info = {
  revision: 1,
  name: "add-termooo",
  created: "2022-01-16T23:02:25.763Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "createTable",
    params: [
      "guilds",
      {
        id: { type: Sequelize.STRING, field: "id", primaryKey: true },
        greetings: {
          type: Sequelize.BOOLEAN,
          field: "greetings",
          defaultValue: false,
        },
        birthday: {
          type: Sequelize.STRING,
          field: "birthday",
          defaultValue: null,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "created_at",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updated_at",
          allowNull: false,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "guild_members",
      {
        member_id: {
          type: Sequelize.STRING,
          field: "member_id",
          allowNull: false,
        },
        last_greeting: {
          type: Sequelize.DATE,
          field: "last_greeting",
          defaultValue: null,
        },
        birthday: {
          type: Sequelize.DATE,
          field: "birthday",
          defaultValue: null,
        },
        termooo_rank: {
          type: Sequelize.INTEGER,
          field: "termooo_rank",
          defaultValue: 0,
        },
        termooo_attempts: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          field: "termooo_attempts",
          defaultValue: Sequelize.Array,
        },
        termooo_guesses: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          field: "termooo_guesses",
          defaultValue: Sequelize.Array,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "created_at",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updated_at",
          allowNull: false,
        },
        guild_id: {
          type: Sequelize.STRING,
          field: "guild_id",
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          references: { model: "guilds", key: "id" },
          allowNull: true,
        },
      },
      { transaction },
    ],
  },
  {
    fn: "createTable",
    params: [
      "guild_termooos",
      {
        word: { type: Sequelize.STRING, field: "word" },
        word_ascii: {
          type: Sequelize.STRING,
          field: "word_ascii",
          defaultValue: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          field: "created_at",
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: "updated_at",
          allowNull: false,
        },
        guild_id: {
          type: Sequelize.STRING,
          field: "guild_id",
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          references: { model: "guilds", key: "id" },
          allowNull: true,
        },
      },
      { transaction },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "dropTable",
    params: ["guilds", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["guild_members", { transaction }],
  },
  {
    fn: "dropTable",
    params: ["guild_termooos", { transaction }],
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
