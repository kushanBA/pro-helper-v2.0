import { env } from "./config/env.ts";
import app from "./app.ts";

app.listen(env.PORT, () => {
  console.log("port is running on:", env.PORT);
});
