![image](https://user-images.githubusercontent.com/154479/165955293-4e576fef-cd9a-4fc8-853f-22f195f8a7a2.png)

# Build a community around your product with _Squeak!_ by PostHog.

_Squeak!_ is a toolkit for fostering a community in-house. It helps make discussions, resources, and solutions more accessible to the right people.

Learn more at [**squeak.posthog.com**](https://squeak.posthog.com) and star us to follow along.

Want to try it without installing? There's a [**cloud version of Squeak!**](https://squeak.cloud/signup) too.

## Toolkit

Squeak! tools are built for React-based static sites, but many products work with existing docs, knowledge bases, or websites.


| **Product**               | **Description**                                                                              | **Progress** |
|---------------------------|----------------------------------------------------------------------------------------------|--------------|
| Q&A.js                    | Add threaded discussions to any page of your docs or website                                 | Beta         |
| Discussion Warehouse      | A repository to manage shared knowledge threads from Slack, Q&A.js, and other sources        | Beta         |
| Import Slack Threads      | Liberate product-related discussions from Slack and make them discoverable by search engines | Alpha        |
| Auth 2.0                  | OAuth, social logins                                                                         | Summer 2022  |
| Dynamic Open Graph Images | A custom social media graphic for every webpage across your docs or website                  | Summer 2022  |
| Community Profiles        | Bios, badges, activity feed, leaderboards, lists/directories                                 | Summer 2022  |
| Knowledge Repository      | Lightweight, optimized content platform for docs, articles, guides, blogs                    | Summer 2022  |
| Knowledge Search          | Searchable interface for Discussions, Knowledge                                              | Fall 2022    |
| Page Builder              | MDX + Storybook mashup w/ collections, lists, menus                                          | Fall 2022    |
| Dynamic Pages             | Personalized content for each visitor by IP, UTM codes, or CRM                               | Winter 2022  |
| Marketplace               | Allow community to make money from services for the platform                                 | Spring 2023  |


## Docs

Visit the [wiki](https://github.com/PostHog/squeak/wiki) for guides on:

1. [Embeddable widget (JavaScript, React)](https://github.com/PostHog/squeak/wiki/Embeddable-widget-(JS,-React))
1. [Admin portal](https://github.com/PostHog/squeak/wiki/admin-portal)
1. [Integrations](https://github.com/PostHog/squeak/wiki/integrations)
1. [Self-hosting](https://github.com/PostHog/squeak/wiki/self-hosting)
1. [API](https://github.com/PostHog/squeak/wiki/api)
1. [Local development](https://github.com/PostHog/squeak/wiki/local-development)

## Links

- [Roadmap](https://github.com/orgs/PostHog/projects/40)
- Feature request? [Create an issue!](https://github.com/PostHog/squeak/issues)

## About

Squeak! was created by [PostHog](https://posthog.com) out of a need to better support our own customers and move conversations out of our Slack community. Squeak! is open source under MIT.

## Prisma

We use Prisma as our ORM. Prisma works by interpreting a schema file defined in `prisma/schema.prisma` and using a generated client. Prisma generates a strongly-typed client based on the schema file. The client is generated at runtime and not checked into version control. See the [prisma docs about this](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client#keeping-the-query-engine-out-of-version-control-by-default). This means that the prisma client needs to be generated as part of any deployment process. As noted in the prisma docs, the `prisma generate` command is run as a postinstall hook when the prisma library is installed.

On deployment, the database needs to be migrated by running: `npx prisma migrate deploy`. See below for useful docs on production migrations:
* https://www.prisma.io/docs/concepts/components/prisma-migrate#production-and-testing-environments
* https://www.prisma.io/docs/guides/deployment/deploy-database-changes-with-prisma-migrate
* https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-deploy
### Superjson

This project uses [superjson](https://github.com/blitz-js/superjson#using-with-nextjs) to automatically handle serialization issues, primarily with `BigInt`, which we use for certain IDs.