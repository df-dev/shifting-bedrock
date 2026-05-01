> [!WARNING]
> **This is an unofficial fork of [caido-community/shift](https://github.com/caido-community/shift).**
>
> It adds AWS Bedrock provider support via a workaround: credentials are entered in the Shift settings UI and used to call Bedrock directly from the frontend. This approach is not endorsed by the official project — the Caido SDK does not currently expose a backend provider registration API, so a fully integrated solution is not yet possible.
>
> For the official plugin, visit **[caido-community/shift](https://github.com/caido-community/shift)**.

# Shift

Shift is an AI plugin that integrates state-of-the-art LLMs directly into Caido's UI. It allows for LLM-powered free-form HTTP modification in Replay, automatic contextualization of queries, and supports many tools that AI can use to interface with Caido.

<p align="center">
<img src="https://github.com/user-attachments/assets/0641619d-b629-40c6-9aec-dc209deb8491" width=250>
<p/>

Use Cases include:
* `Build out this JSON request body in Replay [Paste Obfuscated JS Code]`
    * **Result**: AI automatically builds the JSON request body from the JS code.
* `Match and Replace this to true` (with a feature flag boolean selected)
    * **Result**: AI creates Match & Replace rule to turn on the feature
* `Add this to scope`
    * **Result**: AI adds the current request to scope
* `Generate a wordlist with all HTTP Verbs`
    * **Result**: AI generates a wordlist with all HTTP verbs and adds it to your hosted files
* `Capitalize the 2nd letter of all query parameters`
    * **Result**: AI uses a Replay search and replace tool to capitalize all 2nd letters of query params
* `Remove all the spaces from the path`
    * **Result**: AI updates the path to reflect the same path but without spaces
* `Add 3 more tags to the JSON request body`
    * **Result**: AI reads the current JSON body and adds 3 more tag objects to the "tags" array.

## Shift Agents

Shift Agents, the new micro-agent framework for Caido users.

Build personalized micro-agents for tasks like XSS exploitation, WAF bypassing, or anything you can think of.

# Installation

### From Releases

1. Download `plugin_package.zip` from the [latest release](https://github.com/df-dev/shifting-bedrock/releases/latest)
2. Install in Caido by clicking the "Install Package" button in-app and uploading the zip

### Build from Source

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build the plugin:

   ```bash
   pnpm build
   ```

3. Install in Caido:
   - Upload the `dist/plugin_package.zip` file in Caido by clicking on the "Install Package" button in-app
