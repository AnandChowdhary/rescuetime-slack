# ⏰ RescueTime Slack

This is a starter template for building Deno packages in TypeScript, with GitHub Actions-powered CI, tests, CLI, and Semantic Release on GitHub and npm.

[![Deno CI](https://github.com/AnandChowdhary/rescuetime-slack/workflows/RescueTime%20Slack/badge.svg)](https://github.com/AnandChowdhary/rescuetime-slack/actions)
[![GitHub](https://img.shields.io/github/license/AnandChowdhary/rescuetime-slack)](https://github.com/AnandChowdhary/rescuetime-slack/blob/master/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/AnandChowdhary/rescuetime-slack)](https://github.com/AnandChowdhary/rescuetime-slack/graphs/contributors)
[![RescueTime Slack](https://img.shields.io/badge/deno-starter-brightgreen)](https://denorg.github.io/starter/)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-blue)](https://github.com/AnandChowdhary/rescuetime-slack)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![Screenshot of bot message](./assets/screenshot.png)

## ⭐ Getting started

The code in [`mod.ts`](./mod.ts) fetches your RescueTime daily statistics and posts it on Slack using a webhook configured in [`rescuetime-slack.yml`](./rescuetime-slack.yml):

```yml
webhook: https://hooks.slack.com/services/$WEBHOOK
apiKeys:
  "Anand Chowdhary": "$API_KEY"
```

More people can be added under the `apiKeys` key in the YAML file. For each user, `$API_KEY` is replaced by the API key for their name, stored in GitHub Secrets; for example "Anand Chowdhary" transforms to `API_KEY_ANAND_CHOWDHARY`. The `$WEBHOOK` environment variable has the Slack webhook.

## 👩‍💻 Automation

A GitHub Actions [workflow](./.github/workflows/deno.yml) runs the following script every alternate day to update this repo:

```bash
deno run --allow-net --allow-write --allow-read --allow-env --unstable mod.ts
```

## 📄 License

[MIT](./LICENSE) © [Anand Chowdhary](https://anandchowdhary.com)
