import { WebClient } from '@slack/web-api'
import {config} from '../config.js';

const token = config.slack.slack_token;
const web = new WebClient(token);

export const publishMessage = async (slackId, msg) => {
	await web.chat.postMessage({
	  token,
	  channel: slackId,
	  text: msg,
	});
  };

export async function publishMessages(req, res){
	const slackId = req.body.slackId;
	const msg = req.body.msg;
	await publishMessage(slackId, msg);
	res.sendStatus(204);
}