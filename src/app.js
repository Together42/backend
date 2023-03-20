import express from "express";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import swaggerFile from "./swagger/swagger-docs.json" assert { type: "json" };
import { config } from "./config.js";
import { stream } from "./config/winston.js";
import rateLimit from "./middleware/rate-limiter.js";
import expressBasicAuth from "express-basic-auth";
import cron from "node-cron";
import {
  createWeeklyMeetingEvent,
  matchWeeklyMeetingEvent,
} from "./controller/together.controller.js";
import { postRotationMessage } from "./controller/rotation.controller.js";

// express configuration
const app = express();

//parse JSON and url-encoded query
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  cors({
    origin: [
      process.env.BACKEND_LOCAL_HOST
        ? `http://${process.env.BACKEND_LOCAL_HOST}`
        : null,
      "http://localhost:3050",
      "http://10.18.245.57:3050",
      "http://10.19.230.111:3050",
      "https://together42.github.io",
      "https://together.42jip.net",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(morgan("combined", { stream }));
app.use(rateLimit);

if (process.env.BACKEND_LOCAL_HOST || process.env.BACKEND_TEST_HOST) {
  app.use(
    ["/swagger"],
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  //Swagger 연결
  app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(swaggerFile, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );
}

// 사서 로테이션 돌림
cron.schedule("0 8 * * *", function () {
  postRotationMessage();
});

// 주간 회의 자동 생성
cron.schedule("0 12 * * 4", function () {
  createWeeklyMeetingEvent();
});

// 주간 회의 자동 매칭
cron.schedule("0 10 * * 3", function () {
  matchWeeklyMeetingEvent();
});

//route
app.use("/api", router);

app.listen(config.host.port);
console.log("Listening on", config.host.port);
