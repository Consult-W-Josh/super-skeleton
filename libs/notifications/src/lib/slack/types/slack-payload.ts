export interface SlackAuth {
    channel: string;
    authToken: string;
  }
  
  export interface SlackMessageSection {
    type: "section";
    text: {
      type: "mrkdwn";
      text: string;
    };
  }
  
  export interface SlackPayload {
    channel: string;
    blocks: Array<SlackMessageSection>;
    thread_ts?: string;
  }