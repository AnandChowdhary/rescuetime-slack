import { load } from "https://deno.land/x/js_yaml_port/js-yaml.js";
import { join } from "https://deno.land/std@0.51.0/path/mod.ts";
import { readFileStr } from "https://deno.land/std@0.51.0/fs/mod.ts";
import ky from "https://unpkg.com/ky/index.js";

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

/** Fetch RescueTime daily summary for user */
export const fetchDailySummary = async (
  apiKey: string
): Promise<RescueTimeDailySummary[]> => {
  return ky
    .get(`https://www.rescuetime.com/anapi/daily_summary_feed?key=${apiKey}`)
    .json();
};

/** Post a message to a Slack channel */
export const postToSlack = async (
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
  console.log(await ky.post(url, { json: payload }).text());
};

/** Run the RescueTime Slack script */
export const rescuetimeSlack = async () => {
  console.log("Started");
  const file = await readFileStr(join(".", "rescuetime-slack.yml"));
  const config: {
    apiKeys: { [index: string]: string };
    webhook: string;
    botName: string;
    botIcon: string;
  } = load(file);
  config.webhook = config.webhook.replace(
    "$WEBHOOK",
    Deno.env.get("WEBHOOK") ?? ""
  );
  for await (const user of Object.keys(config.apiKeys)) {
    const summaries = await fetchDailySummary(
      config.apiKeys[user].replace(
        "$API_KEY",
        Deno.env.get(
          `API_KEY_${user.toLocaleUpperCase().replace(/ /g, "_")}`
        ) ?? ""
      )
    );
    if (!summaries.length) continue;
    await postToSlack(
      config.botName,
      config.botIcon,
      config.webhook,
      user,
      summaries[0]
    );
    console.log(`Posted ${user}'s summary to Slack`);
  }
  console.log("Success");
};

rescuetimeSlack();
