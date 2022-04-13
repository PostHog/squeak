![image](https://user-images.githubusercontent.com/154479/158293709-86fb1184-0983-41d1-8498-a0608d9c2b61.png)

# Squeak! [BETA]

_Squeak!_ lets you answer user questions, right in your docs. Even better: it lets your community support itself.

> WIP: Self-host instructions have been removed from here and are being moved to docs/wiki

### Alerts

Squeak! allows you to add alerts via outgoing webhooks to notify external services when new questions are received.

1. Visit the Settings page
1. Under Alerts, click Add alert
1. Choose between Slack notification or Outgoing webhook (see below for a description on both)
1. Enter your webhook URL
1. Click save!

The next time a new question is received, each webhook URL is called.

#### Slack notifications

To set up Slack notifications, follow the instructions in [this article](https://api.slack.com/messaging/webhooks). Once you've received your unique webhook URL, add it to your alerts table. Once added, a Slack notification will be received every time a new question is asked.

1. Create a new [Slack app](https://api.slack.com/apps) (using "from scratch" option)
2. After creating, click _Incoming webhooks_, enable, then _Add new webhook to workspace_
3. Copy new webhook URL from Slack, paste into Squeak! settings

#### Outgoing webhook

Squeak! also supports generic outgoing webhooks. Great for Zapier automations! Each time a new question is asked, a POST request will be sent to your webhook URL with following body:

```
{ subject: 'Test subject', slug: ['/'], body: 'Test question' }
```

## 12. Add the JavaScript snippet to your website or docs!

It can be installed on a single page template, or in a snippet references across your site like a layout template.

Note: If you use React, install the `squeak-react` package instead with `yarn add squeak-react`

### Customization

Set color variables in CSS to override default colors:

```
--squeak-primary-color: black;
--squeak-button-color: blue;
```

This can be added to your widget's embed code by inserting the following above the opening <script> tag:

```
<style>
  :root {
    --squeak-primary-color: #3e3e3e;
    --squeak-button-color: #643eff;
  }
</style>
```

### Importing Slack threads
  
1. Visit Slack tab and follow instructions to create an app from manifest
1. Install where the threads are (presumably with users) that you'd like to port over to Squeak!
1. Paste (YAML) manifest from `/slack`
1. Install to workspace
1. Click _Oauth and permissions_
1. Under _OAuth Tokens for Your Workspace_, copy _Bot User OAuth Token_ and add it to Slack
1. (These instructions are a WIP)
  
---

## More info about tokens and how they're used

Find the values for these keys in your Supabase project.

| Key                           | Required | Description                                                                                                                                                                                                                                              |
| ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes      | Public key used to authenticate with Supabase in the browser, found at `/settings/api`                                                                                                                                                                   |
| SUPABASE_SERVICE_ROLE_KEY     | Yes      | Secret key used to authenticate with Supabase on the server, used to bypass Row Level Security, found at `/settings/api`                                                                                                                                 |
| NEXT_PUBLIC_SUPABASE_URL      | Yes      | Restful endpoint for querying and managing the Supabase DB, found at `/settings/api`                                                                                                                                                                     |
| DATABASE_URL                  | No       | The Postgresql connection string, if provided, will automatically run migrations in Supabase on start, found at `/settings/database`, in URI format. (If not provided, we'll provide a SQL query you'll need to copy/paste into Supabase's SQL console.) |

## API

| Task                        | URL             | Docs                          |
| --------------------------- | --------------- | ----------------------------- |
| Adding a new question       | `/api/question` | [Docs](/docs/api/question.md) |
| Adding a reply to a message | `/api/reply`    | [Docs](/docs/api/reply.md)    |

## Local Development

#### With NextJS Dev (Recommended)

1. `npm install`

1. Setup your environment configuration:

```shell
cp .env.example .env.local
```

Enter the required config from Supabase `.env.local`.

2. Run the DB migrations:

```shell
DATABASE_URL=postgresql://postgres:<YOUR_SUPABASE_DB_PASSWORD>@<YOUR_SUPABASE_DB_HOST>:5432/postgres yarn migrate up
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

### With Docker Image

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine
2. Build the container: `docker build -t squeak .`
3. Run the container:

```shell
docker run \
  -e "NEXT_PUBLIC_SUPABASE_URL=<YOUR URL>" \
  -e "NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR ANON KEY>" \
  -e "SUPABASE_SERVICE_ROLE_KEY=<YOUR SERVICE ROLE KEY>" \
  -e "DATABASE_URL=<YOUR DATABASE_URL>" \
  -p 3000:3000 squeak
```

### Running DB migrations

To run the database migrations, run:

```shell
DATABASE_URL=<YOUR_DATABASE_URL> yarn migrate up
```

### Generating Typescript Types

After running a migration, you can generate typescript types for the database schema:

```shell
npx openapi-typescript "https://htzqlrrygnqeebaspzln.supabase.co/rest/v1/?apikey=<YOUR_NEXT_PUBLIC_SUPABASE_ANON_KEY>" --output @types/supabase.d.ts
```
