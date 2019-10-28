const mongoose = require("mongoose");
const dotenv = require("dotenv");

//On uncaught exception we must restart our server to clean stack
process.on("uncaughtException", err => {
  console.error(err.name, err.message);
  process.exit(1);
});

//https://www.natours.dev
dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Success connection");
  })
  .catch(err => console.log(err));

//console.log(app.get("env"));
//console.log(process.env);

const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`App running on port ${port}`)
);

process.on("unhandledRejection", err => {
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
