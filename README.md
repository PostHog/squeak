![image](https://user-images.githubusercontent.com/154479/158293709-86fb1184-0983-41d1-8498-a0608d9c2b61.png)

# Squeak! [BETA]

_Squeak!_ lets you answer user questions, right in your docs. Even better: it lets your community support itself.

After spinning up a server, grab the JavaScript embed code and place wherever you want it to appear on your site. (It works great at the end of your docs template - so visitors can ask questions without leaving the page. And because the questions & answers stay on your site, they'll be useful for others in the future.)

## Requirements

_Squeak!_ is currently self-hosted, but we make deployment simple using a Docker container. You'll need:

- Docker and docker hosting - _Runs client-side widget, admin panel_
- A [Supabase](https://supabase.com) account - _Hosted Postgres database, authentication_
- Mailgun (optional) - _Email notifications for users when someone answers their question_
- Slack (optional) - _Moderator notifications for new questions and community replies_

## Getting started

## 1. Create a project in Supabase

This will take a few minutes. (We'll come back here.)

_Be sure to save your database password. You'll need this later._

## 2. Host the Docker container

We've made it easy to [deploy to DigitalOcean](https://cloud.digitalocean.com/apps/new?repo=https://github.com/posthog/squeak/tree/master&refcode=6a26a2c395b0&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge).

## 3. Configure server's environment variables

Find these in Supabase at:

```
https://app.supabase.io/project/{your-project-id}
```

### Mapping environment variables


| Where to find these values in Supabase   | Environment variable key                   |
|---------------------------------|------------------------------------|
| Project API keys → `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Project API keys → `service_role`  | `SUPABASE_SERVICE_ROLE_KEY`  |
| Project Configuration → `URL`      | `NEXT_PUBLIC_SUPABASE_URL`      |


## 4. Database credentials (optional)

This step will run database migrations when the service is started.

_If you don't enter your credentials, you'll just need to copy/paste a SQL query to create the table structure._

### Build your connection string

Enter your database's password and hostname into the following string.
```
postgresql://postgres:{your-password}@{your-host}:5432/postgres
```

Find your database hostname at the following URL:

```
https://app.supabase.io/project/{your-project-id}/settings/database
```

| Credentials you'll need       | Location in Supabase           |
|---------------------------------|------------------------------------|
| Database hostname        |  Connection info → `Host` |
| Database password        |  _Set when creating project_ |


Use the resulting value in the `DATABASE_URL` field. (Voila, that was the hardest part!)

## 5. Return to your Docker project and name the app

Something like {your-project}-squeak works great.

## 6. Build the app

The deployment will take 2-4 minutes.

### Using DigitalOcean?

- You'll need to set up billing before building. You can host with DigitalOcean for as little as $5 by choosing the _Basic_ plan, then adjusting the _Basic Size_.


## 7. Disable email confirmations in Supabase

While Docker is building, visit the following URL:

```
https://app.supabase.io/project/{your-project-id}/auth/settings
```

Under _Email Auth_, toggle `OFF` _Enable email confirmations_.

This will allow users to post questions without leaving the widget.

_Note: This form sometimes takes a few seconds to update._

## 8. Complete setup process

The first time you run your app, you'll be redirected to:

```
{your-url}.{tld}/setup/welcome
```

## 9. Create database table structure

> Skip this step if you added your database connection string (from step 4)

1. Copy the SQL query from the setup process
1. Visit the Supabase SQL Editor and choose _New query_
1. Paste and run the SQL command
1. Return to the setup process

## 10. Create an login for the admin panel

## 11. Enter Mailgun and Slack credentials (optional)

### Mailgun

1. Find your _Private API key_ in Mailgun and enter it as the `Mailgun API key`
1. Enter the domain name you'll be sending from, your company name, and your site's URL (so the email can link back to it)

### Slack

1. Optionally, create a new Slack channel for Squeak! notifications
1. Copy and replace the app manifest
1. Install to workspace
1. In Slack, visit the _OAuth & Permissions_ page (at `https://api.slack.com/apps/{your-app-id}/oauth
1. Copy the value of `Bot User OAuth Token` and add to the setup wizard
1. After entering your OAuth token, you'll be asked to select your desired Slack channel

## 12. Add the JavaScript snippet to your website or docs!

It can be installed on a single page template, or in a snippet references across your site like a layout template.


---

## More info about tokens and how they're used

Find the values for these keys in your Supabase project.

| Key                           | Required | Description                                                                                                                             |
|-------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes      | Public key used to authenticate with Supabase in the browser, found at `/settings/api`                                                  |
| SUPABASE_SERVICE_ROLE_KEY     | Yes      | Secret key used to authenticate with Supabase on the server, used to bypass Row Level Security, found at `/settings/api`                |
| NEXT_PUBLIC_SUPABASE_URL      | Yes      | Restful endpoint for querying and managing the Supabase DB, found at `/settings/api`                                                    |
| DATABASE_URL                  | No       | The Postgresql connection string, if provided, will automatically run migrations in Supabase on start, found at `/settings/database`, in URI format. (If not provided, we'll provide a SQL query you'll need to copy/paste into Supabase's SQL console.) |

## API

| Task                        | URL             | Docs                          |
|-----------------------------|-----------------|-------------------------------|
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
