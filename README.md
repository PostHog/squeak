# Squeak

Once you have access to the [environment variables](#configuration) you'll need, deploy the example using Digital Ocean:

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/PostHog/squeak/tree/master)

## Getting Started

...

## Configuration

| Key                           | Required | Description                                                                                                                             |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_SUPABASE_URL      | Yes      | Restful endpoint for querying and managing the Supabase DB, found at `/settings/api`                                                    |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes      | Public key used to authenticate with Supabase in the browser, found at `/settings/api`                                                  |
| SUPABASE_SERVICE_ROLE_KEY     | Yes      | Secret key used to authenticate with Supabase on the server, used to bypass Row Level Security, found at `/settings/api`                |
| DATABASE_URL                  | No       | The Postgresql connection string, if provided, will automatically run migrations on start, found at `/settings/database`, in URI format |

## Local Development

#### With NextJS Dev (Recommended)

1. Setup your environment configuration:

```shell
cp .env.example .env.local
```

Enter the required config from Supabase 2. Run the DB migrations:

```shell
DATABASE_URL=<YOUR DATABASE URL> ya rn run migrate up
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

### Generating Typescript Types

After running a migration, you can generate typescript types for the database schema:

```shell
npx openapi-typescript "https://htzqlrrygnqeebaspzln.supabase.co/rest/v1/?apikey=<YOUR_NEXT_PUBLIC_SUPABASE_ANON_KEY>" --output @types/supabase.d.ts
```
