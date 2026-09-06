# Install LearningBot / backupBot as a classroom sandbox

> **Scope:** This guide is for studying a historical LINE + Google Apps Script
> prototype. Use a new LINE channel, a new spreadsheet, and a new Drive folder.
> Do not connect it to the original production webhook, spreadsheet, or Drive.

## Before you start

You need:

- A Google account that can create Google Sheets and Apps Script projects.
- A LINE Developers account and a fresh Messaging API channel.
- Node.js 18+ and Git, if using the recommended `clasp` method.
- A test LINE account for talking to the bot.

The code uses an Apps Script web app as the LINE webhook:

```text
LINE user → LINE Messaging API → GAS doPost(e)
         → bound Google Sheet + Drive folder → LINE reply / Flex Message
```

## 1. Make a private sandbox spreadsheet

1. Create a new Google Sheet named `LearningBot Sandbox`.
2. Add the sheets and control rows described in [SHEET_TEMPLATE.md](SHEET_TEMPLATE.md).
3. In Google Drive, create a new folder named `LearningBot uploads`.
4. Open the folder and copy the opaque ID after `/folders/` in its URL. Keep it
   private; it is used later as `DESTINATION_FOLDER_ID`.

## 2. Create a LINE Messaging API channel

1. Sign in to [LINE Developers Console](https://developers.line.biz/console/).
2. Create a provider if you do not already have a test provider.
3. Create a **Messaging API** channel for this sandbox.
4. On the channel's **Messaging API** page, issue a channel access token.
   Prefer the current token type offered by LINE. Copy it somewhere private.
5. Disable the channel's automatic reply and greeting message during testing so
   students do not receive duplicate replies.

Do not put the token in Git, a spreadsheet cell, a screenshot, or a chat
message.

## 3. Put this source into a bound Apps Script project

The simplest reproducible route is `clasp`.

```bash
git clone https://github.com/canlgz/LearningBot-Legacy.git
cd LearningBot-Legacy
npm install --global @google/clasp
clasp login
clasp create --type sheets --title "LearningBot Sandbox" --rootDir src
clasp push
clasp open
```

`clasp create --type sheets` makes a **new** spreadsheet and binds the script
to it. If you already created a spreadsheet in step 1, copy its template sheets
into the newly created sandbox spreadsheet, or create the bound script from the
sheet via **Extensions → Apps Script** and copy the files from `src/`.

In the Apps Script editor, use **Project Settings → Script properties** and add:

| Property | Sandbox value |
| --- | --- |
| `LINE_CHANNEL_ACCESS_TOKEN` | The private token from step 2 |
| `DESTINATION_FOLDER_ID` | The test Drive folder ID from step 1 |
| `LEARNING_CENTER_SHEET_NAME` | `Learning Center` |
| `ADMINISTRATOR_LINE_USER_ID` | Any non-empty placeholder for initial testing; the first direct-chat user becomes that sheet's host |
| `DEFAULT_THUMBNAIL_FILE_ID` | Optional test image ID; leave blank to use the code's fallback image |
| `LINE_NOTIFY_TOKEN` | Leave blank. The historical notification paths safely skip when it is absent. |

Save the project. The first time Apps Script asks for permission, review the
requested Sheet, Drive, and external-request permissions and authorise only
your sandbox project.

## 4. Deploy the web app

1. In Apps Script click **Deploy → New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set access to the public option that allows unauthenticated webhook calls
   (normally **Anyone**). LINE's servers cannot sign in to your Google account.
5. Deploy, finish the Google authorisation flow, and copy the URL ending in
   `/exec`.

Each new deployment may produce a new `/exec` URL. Update LINE whenever that
happens.

## 5. Connect LINE to GAS

1. Return to the channel's **Messaging API** settings in LINE Developers.
2. Paste the GAS `/exec` URL into **Webhook URL**.
3. Turn **Use webhook** on.
4. Use LINE's **Verify** button. A successful verification means LINE reached
   the GAS web app; it does not prove every historical feature works.
5. Add the test bot as a friend, then send a simple text message.

The first message should create a new sheet named after the LINE conversation
ID and a Drive subfolder in `LearningBot uploads`.

## 6. Classroom smoke test

Run these tests in order:

1. Send `你好` and confirm a new worksheet appears.
2. Send a short text and confirm a row is appended from row 9 onward.
3. Send an image or file and confirm a Drive subfolder is created and a record
   is appended.
4. Send `//檔案` to inspect the historical Flex-message browsing workflow.
5. Send `//我是測試者` to observe the early nickname command pattern.

## Troubleshooting

| Symptom | Likely cause | What to check |
| --- | --- | --- |
| LINE Verify fails | GAS access is not public or the wrong URL was copied | Redeploy as a web app and use the exact `/exec` URL. |
| `Missing Script Property` | A required property is absent or misspelled | Check names exactly against step 3. |
| First message does not create a sheet | `templet` is missing or Drive folder access is wrong | Confirm the exact sheet name `templet` and `DESTINATION_FOLDER_ID`. |
| Replies fail but rows are written | Invalid/expired LINE access token | Issue a new token in LINE Developers and update only Script Properties. |
| Reminders do nothing | LINE Notify is intentionally not configured | This is expected in the teaching sandbox; compare the old notification design with a modern Messaging API push implementation. |
| A deployment cannot be created | Too many historical GAS versions | For a new student project this should not occur. Do not delete versions in the original archive merely to run a class exercise. |

## Historical limitations

- This source predates current security and maintainability practices. In
  particular, it does not implement LINE webhook-signature verification.
- Some Drive and LINE behaviours have changed since the original project.
- The notification code was originally written for LINE Notify. It is retained
  as history but disabled by default in this edition.
- Never use student identities or real learning records in the sandbox.

For the maintained successor, use the
[WriteToLearn student setup repository](https://github.com/canlgz/WriteToLearn-Student-Setup).

