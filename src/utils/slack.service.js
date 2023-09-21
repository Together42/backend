import { config } from "../config.js";
import { publishMessage } from "../controller/slack.controller.js";
import { getParticipantsByDate } from "../data/rotation.js";
import { findUsersByIntraId } from "../data/user.js";
import { getTomorrow } from "./date.js";

export async function postSlackTomorrowLibrarian() {
  const tomorrow = getTomorrow(new Date());
  const participants = await getParticipantsByDate(tomorrow);
  const users = await findUsersByIntraId(participants.map((p) => p.intraId));

  if (users.length === 0) {
    return publishMessage(
        config.slack.jip, // 테스트 되는 거 확인 되면 slackId로 대체
        `내일은 사서가 없는 날입니다!`,
      );
  }

  const messages = users.map((r) => {
    const { intraId, slackId } = r;
    if (process.env.BACKEND_LOCAL_HOST || process.env.BACKEND_TEST_HOST) {
      return publishMessage(
        config.slack.jip, // 테스트 되는 거 확인 되면 slackId로 대체
        `[리마인드] ${intraId}님은 내일 사서입니다!`,
      );
    }
  });
  await Promise.all(messages);
}
