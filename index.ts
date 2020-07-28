import { join } from "path";
import { readFile } from "fs-extra";
import axios from "axios";
import { load } from "js-yaml";
import { config } from "dotenv";
config();

export interface RescueTimeDailySummary {
  id: number;
  date: string;
  productivity_pulse: number;
  very_productive_percentage: number;
  productive_percentage: number;
  neutral_percentage: number;
  distracting_percentage: number;
  very_distracting_percentage: number;
  all_productive_percentage: number;
  all_distracting_percentage: number;
  total_duration_formatted: string;
  very_productive_duration_formatted: string;
  productive_duration_formatted: string;
  neutral_duration_formatted: string;
  distracting_duration_formatted: string;
  very_distracting_duration_formatted: string;
  all_productive_duration_formatted: string;
  all_distracting_duration_formatted: string;
}

export interface RescueTimeWeeklySummary {
  row_headers: [string, string, string, string, string, string];
  rows: Array<[number, number, number, string, string, number]>;
}

/** Fetch RescueTime daily summary for user */
export const fetchDailySummary = async (
  apiKey: string
): Promise<RescueTimeDailySummary[]> => {
  return (
    await axios.get(
      `https://www.rescuetime.com/anapi/daily_summary_feed?key=${apiKey}`
    )
  ).data;
};

/** Fetch RescueTime daily summary for user */
export const fetchWeeklySummary = async (
  apiKey: string
): Promise<RescueTimeWeeklySummary> => {
  return (
    await axios.get(
      `https://www.rescuetime.com/anapi/data?key=${apiKey}&format=json&restrict_begin=${new Date(
        new Date().setDate(new Date().getDate() - 7)
      )
        .toISOString()
        .slice(0, 10)}&restrict_end=${new Date().toISOString().slice(0, 10)}`
    )
  ).data;
};

/** Post a message to a Slack channel */
export const postToSlackDaily = async (
  username: string,
  icon_url: string,
  url: string,
  user: string,
  data: RescueTimeDailySummary
) => {
  const payload = {
    username,
    icon_url,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*RescueTime* summary for *${user}* for ${new Date(
            data.date
          ).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*${data.productivity_pulse}/100* \n Productivity Pulse`,
          },
          {
            type: "mrkdwn",
            text: `*${data.total_duration_formatted}* \n Total Duration`,
          },
        ],
      },
    ],
  };
  await axios.post(url, payload);
};

/** Post a message to a Slack channel */
export const postToSlackWeekly = async (
  username: string,
  icon_url: string,
  url: string,
  user: string,
  data: RescueTimeWeeklySummary
) => {
  const payload = {
    username,
    icon_url,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*RescueTime* weekly summary for *${user}*`,
        },
      },
      {
        type: "section",
        fields: data.rows.slice(0, 6).map((item) => ({
          type: "mrkdwn",
          text: `*${item[3]}* \n ${item[4]}`,
        })),
      },
    ],
  };
  await axios.post(url, payload);
};

/** Run the RescueTime Slack script */
export const rescuetimeSlack = async () => {
  console.log("Started");
  const file = await readFile(join(".", "rescuetime-slack.yml"), "utf8");
  const config: {
    apiKeys: { [index: string]: string };
    webhook: string;
    botName: string;
    botIcon: string;
  } = load(file);
  config.webhook = config.webhook.replace(
    "$WEBHOOK",
    process.env.WEBHOOK ?? ""
  );
  for await (const user of Object.keys(config.apiKeys)) {
    if (process.argv[2] === "weekly") {
      console.log("Weekly trigger");
      const summaries = await fetchWeeklySummary(
        config.apiKeys[user].replace(
          "$API_KEY",
          process.env[
            `API_KEY_${user.toLocaleUpperCase().replace(/ /g, "_")}`
          ] ?? ""
        )
      );
      if (!summaries.rows.length) continue;
      await postToSlackWeekly(
        config.botName,
        config.botIcon,
        config.webhook,
        user,
        summaries
      );
      console.log(`Posted ${user}'s summary to Slack`);
    } else {
      const summaries = await fetchDailySummary(
        config.apiKeys[user].replace(
          "$API_KEY",
          process.env[
            `API_KEY_${user.toLocaleUpperCase().replace(/ /g, "_")}`
          ] ?? ""
        )
      );
      if (!summaries.length) continue;
      await postToSlackDaily(
        config.botName,
        config.botIcon,
        config.webhook,
        user,
        summaries[0]
      );
      console.log(`Posted ${user}'s summary to Slack`);
    }
  }
  console.log("Success");
};

rescuetimeSlack();
