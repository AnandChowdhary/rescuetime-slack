import { load } from "https://deno.land/x/js_yaml_port/js-yaml.js";
import { join } from "https://deno.land/std@0.51.0/path/mod.ts";
import { readFileStr } from "https://deno.land/std@0.51.0/fs/mod.ts";

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
  const response = await fetch(
    `https://www.rescuetime.com/anapi/daily_summary_feed?key=${apiKey}`
  );
  if (!response.ok) throw new Error("Unable to fetch");
  return response.json();
};

/** Post a message to a Slack channel */
export const postToSlack = async (
  user: string,
  data: RescueTimeDailySummary
) => {
  console.log({
    text: `${user}'s RescueTime summary for ${data.date}:`,
  });
};

/** Run the RescueTime Slack script */
export const rescuetimeSlack = async () => {
  console.log("Started");
  const file = await readFileStr(join(".", "rescuetime-slack.yml"));
  const config: {
    apiKeys: { [index: string]: string };
    webhook: string;
  } = load(file);
  for await (const user of Object.keys(config.apiKeys)) {
    const summaries = await fetchDailySummary(config.apiKeys[user]);
    if (!summaries.length) continue;
    await postToSlack(user, summaries[0]);
    console.log(`Posted ${user}'s summary to Slack`);
  }
  console.log("Success");
};

rescuetimeSlack();
