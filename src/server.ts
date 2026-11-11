import "dotenv/config";
import app from "./app.ts";

const port = process.env.PORT || 5001;

app.listen(port,()=>{
    console.log("port is running on: ", port);
})