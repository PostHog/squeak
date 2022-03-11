![image](https://user-images.githubusercontent.com/154479/157802608-64ec4809-21e7-412c-876b-888b97851859.png)

# Squeak!

Squeak! lets you answer questions, right in your docs. Even better: it lets your community support itself.

After spinning up a server, grab the JavaScript embed code and place wherever you want it to appear on your site. (It works great at the end of your docs template - so visitors can ask questions without leaving the page. And because the questions & answers stay on your site, they'll be useful for others in the future.

## Requirements

Squeak! is currently self-hosted, but we make deployment simple using a Docker image.

1. Host a Docker image - Runs client-side widget and connects to integrations
1. A [Supabase](https://supabase.com) account (to host the Postgres database, and for authentication)
1. Mailgun (optional) - Email notifications for users when someone answers their question
1. Slack (optional) - Moderator notifications for new questions and community replies

## Getting started

1. Create a project in [Supabase](https://supabase.com).
1. Open the project and go to Authentication → Settings, and disable _Enable email confirmations_.
1. Host the Docker image (easy with [Digital Ocean](https://cloud.digitalocean.com/apps/new?repo=https://github.com/posthog/squeak/tree/master))

    [![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/posthog/squeak/tree/master)
1. Look up environment variables in your Supabase project and add them to your Docker build
1. Visit _yoursqueakinstance.com_`/setup` and follow the wizard!

## Configuration

Find the values for these keys in your Supabase project.

| Key                           | Required | Description                                                                                                                             |
|-------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| NEXT_PUBLIC_SUPABASE_URL      | Yes      | Restful endpoint for querying and managing the Supabase DB, found at `/settings/api`                                                    |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes      | Public key used to authenticate with Supabase in the browser, found at `/settings/api`                                                  |
| SUPABASE_SERVICE_ROLE_KEY     | Yes      | Secret key used to authenticate with Supabase on the server, used to bypass Row Level Security, found at `/settings/api`                |
| DATABASE_URL                  | No       | The Postgresql connection string, if provided, will automatically run migrations on start, found at `/settings/database`, in URI format |

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
DATABASE_URL=<YOUR DATABASE URL> yarn migrate up
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
