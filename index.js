const express = require("express");
const connectDB = require("./config/database");
require("dotenv").config();
const ContactRouter = require("./routes/contactRoutes")

const app = express();

app.use(express.json());

app.use("/", ContactRouter);

connectDB()
  .then(() => {
    console.log("connected to database");
    app.listen(process.env.PORT||8000, () => {
      console.log("server is running on port 8000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
