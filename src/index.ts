import { Elysia } from "elysia";
import { sessionController } from "./controllers/session.controller";
import { passageController } from "./controllers/passage.controller";
import { intervenantController } from "./controllers/intervenant.controller";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .use(sessionController)
  .use(passageController)
  .use(intervenantController)
  .get("/", () => "API du Système de Chrono de Séance")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
