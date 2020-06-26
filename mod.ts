import { load } from "https://deno.land/x/js_yaml_port/js-yaml.js";
import { join } from "https://deno.land/std@0.51.0/path/mod.ts";
import { readFileStr } from "https://deno.land/std@0.51.0/fs/mod.ts";

/** Fetch RescueTime daily summary for user */
export const fetchDailySummary = async (
  apiKey: string
): Promise<{
  //
}> => {
  const response = await fetch(
    `https://www.rescuetime.com/anapi/daily_summary_feed?key=${apiKey}`
  );
  if (!response.ok) throw new Error("Unable to fetch");
  return response.json();
};

export const postToSlack = async (message: string) => {
  console.log(message);
};

export const rescuetimeSlack = async () => {
  console.log("Running");
  const file = await readFileStr(join(".", "rescuetime-slack.yml"));
  const config: { apiKeys: string[] } = load(file);
  for await (const key of config.apiKeys) {
    const summary = await fetchDailySummary(key);
    console.log(summary);
  }
};

rescuetimeSlack();
