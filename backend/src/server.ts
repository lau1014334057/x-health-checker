import cors from "cors";
import express from "express";
import { pathToFileURL } from "node:url";
import { config } from "./config.js";
import router from "./routes.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(router);

export const server = app.listen(config.port, () => {
  console.log(`xhc backend listening on http://localhost:${config.port}`);
});

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;

if (isDirectRun) {
  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
