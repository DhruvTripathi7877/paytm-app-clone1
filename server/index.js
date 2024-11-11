const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const {JWT_SECRET} = require("./config");

const corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

app.use(cors(corsOptions));
const {indexRouter} = require("./routes/index");
const { authMiddleware } = require("./middlewares/middleware");

app.use(bodyParser.json());

const MONGO_URL = "mongodb+srv://dhruvtripathi7777:QTOhbaXoCwS9LEGn@cluster0.j06p5.mongodb.net/paytmApp?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Connected To MongoDB')
    })
    .catch((err) => {
        console.log("MongoDB Connection Error", err)
    })
// app.use(authMiddleware)
app.use("/api/v1",indexRouter)

app.listen(PORT, () => {
    console.log(`Server started at PORT:${PORT}`)
});