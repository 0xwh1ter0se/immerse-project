import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";

createServer(app).listen(env.PORT, env.HOST, () => {
  console.info(`API listening on http://${env.HOST}:${env.PORT}`);
});
