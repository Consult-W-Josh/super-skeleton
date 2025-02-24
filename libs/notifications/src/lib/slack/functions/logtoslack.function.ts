import { SlackAuth, SlackPayload } from "../types";
import { callApi } from "../dependencies/call-api.function";

export async function logToSlack(text: string, auth: SlackAuth, ts?: string) {
  return callApi<SlackPayload, unknown>({
    serviceUri: "https://slack.com",
    endpoint: {
      path: "/api/chat.postMessage",
      fullPath: "/api/chat.postMessage",
      method: "POST",
    },
    headers: {
      authorization: `Bearer ${auth.authToken}`,
    },
    body: {
      thread_ts: ts,
      channel: auth.channel,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text,
          },
        },
      ],
    },
  });
}