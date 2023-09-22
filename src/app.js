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
import {
  initParticipants,
  postRotationMessage,
} from "./controller/rotation.controller.js";
import { storeHolidayInfo } from "./utils/rotation.calendar.js";
import {
  postSlackMonthlyLibrarian,
  postSlackTomorrowLibrarians,
} from "./utils/slack.service.js";

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

// 매 달 첫 날, 다음 달에 휴일이 있는지 확인하여, DB에 저장.
cron.schedule("0 0 1 * *", function() {
  storeHolidayInfo()
    .then(response => {
      console.log(`storeHolidayInfo status: ${response.status}`);
    })
    .catch(error => {
      console.log('Error occurred in storeHolidayInfo:');
      console.log(error);
    });
});

// 매 요일 날짜 확인 후, 로테이션에 해당하는 날짜에 행동을 수행
// 1. 로테이션 시작 당일 : initParticipants
// 2. 로테이션 주간 중 수요일, 금요일 : postRotationMessage
cron.schedule("0 12 * * *", function () {
  initParticipants()
    .then(response => {
      console.log(`initParticipants status: ${response.status}`);
    })
    .catch(error => {
      console.log('Error occurred in initParticipants:');
      console.log(error);
    });
  postRotationMessage()
    .then(response => {
      console.log(`postRotationMessgae status: ${response.status}`);
    })
    .catch(error => {
      console.log('Error occuured in PostRotationMessage: ');
      console.log(error);
    });
});

// 주간 회의 자동 생성
cron.schedule("0 03 * * 4", function () {
  createWeeklyMeetingEvent();
});

// 주간 회의 자동 매칭
cron.schedule("0 01 * * 3", function () {
  matchWeeklyMeetingEvent();
});

// 매일 오전 10시 사서에게 알림
cron.schedule("0 10 * * *", postSlackTomorrowLibrarians, {
  timezone: "Asia/Seoul",
});

// 테스트용, 삭제 예정
cron.schedule(
  "42 10 * * *",
  async function () {
    const today = new Date();
    const month = (today.getMonth() % 12) + 1;
    const nextMonth = month + 1 === 13 ? 1 : month + 1;

    await postSlackMonthlyLibrarian(today.getFullYear(), nextMonth);
  },
  {
    timezone: "Asia/Seoul",
  },
);

//route
app.use("/api", router);

app.listen(config.host.port);
console.log("Listening on", config.host.port);
