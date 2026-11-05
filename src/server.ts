const express = require("express");
const dotenv = require("dotenv").config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 5001;
app.listen(port,()=>{
    console.log("port is running on: ", port);
})