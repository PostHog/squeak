# Squeak

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Image

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine
2. Build the container: `docker build -t squeak .`
3. Run the container: `docker run -e "SUPABASE_URL=<YOUR URL>" -e "SUPABASE_ANON_KEY=<YOUR ANON KEY>" -p 3000:3000 squeak`
