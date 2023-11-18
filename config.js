module.exports = {
  development: {
    username: "teste",
    password: "teste",
    database: "teste",
    host: "10.0.1.142",
    port: "5433",
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  },
};
