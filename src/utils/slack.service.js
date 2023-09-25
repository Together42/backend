import { config } from "../config.js";
import { publishMessage } from "../controller/slack.controller.js";
import { getMonthlyLibarians, getLibariansByDate } from "../data/rotation.js";
import { getTomorrow } from "./date.js";

export async function postSlackTomorrowLibrarians() {
  const tomorrow = getTomorrow(new Date());
  const libarians = await getLibariansByDate(tomorrow);

  const messages = libarians.map((libarian) => {
    const { intraId, slackId } = libarian;
    let channel = slackId;
    if (process.env.BACKEND_LOCAL_HOST || process.env.BACKEND_TEST_HOST) {
      channel = config.slack.jip;
    }
    return publishMessage(
      channel,
      `[리마인드] ${intraId}님은 내일(${tomorrow}) 사서입니다!`,
    );
  });
  await Promise.all(messages);
}

export async function postSlackMonthlyLibrarian(year, month) {
  console.log(year, month);
  const libarians = await getMonthlyLibarians(year, month);
  console.log(libarians);

  const messages = libarians.map((libarian) => {
    const { intraId, slackId } = libarian;
    let channel = slackId;
    const attendDates = libarian.attendDate
      .split(",")
      .filter((date) => date.length > 0)
      .map((date) => "`" + date + "`")
      .join(", ");
    if (process.env.BACKEND_LOCAL_HOST || process.env.BACKEND_TEST_HOST) {
      channel = config.slack.jip;
    }
    return publishMessage(channel, `${intraId}님은 ${attendDates} 사서입니다.`);
  });
  await Promise.all(messages);
}
