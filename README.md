This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Running the tests

Unit suites mock Prisma, but three suites create and delete real rows:

- `features/audit-log/__tests__/integration.test.ts`
- `features/lab-order/__tests__/service.test.ts`
- `app/api/integration/his/lab-order/__tests__/route.test.ts`

They run **only** against the dedicated `moncip_lis_test` database, and they fail — never skip — when that database is missing, unreachable or misdirected. A red `pnpm test` without that database is the intended behaviour: the alternative is a green run that silently proves nothing.

One-time setup, from the repository root — a database of its own on the development Postgres server:

```bash
docker compose -f compose.dev.yaml exec moncip-lis-db createdb -U moncip_lis moncip_lis_test
pnpm db:test:migrate        # applies prisma/migrations to moncip_lis_test
```

`compose.dev.yaml` also defines a `moncip-lis-db-test` service that is a completely separate server (Postgres on `:5433`, database already created). Start it instead if you would rather not keep a test database next to the development one, and point `.env.test.local` at `moncip-lis-db-test:5432` (`localhost:5433` from the host).

Both scripts read `.env.test.local`, so it needs to exist (it is git-ignored):

```bash
DATABASE_URL="postgresql://moncip_lis:moncip_lis@moncip-lis-db:5432/moncip_lis_test?schema=public"
```

Then run everything against that database:

```bash
pnpm test:db
```

`env -u DATABASE_URL` in those scripts is not decoration. The dev container exports `DATABASE_URL` through compose's `env_file`, and a variable that is already set wins over `--env-file` **and** over every `.env*` file `@next/env` loads — which is also why plain `pnpm test` refuses to run the database suites there instead of quietly using the development database.

The check itself lives in `test/support/test-database.ts`. `jest.config.ts` loads env through `nextJest`/`@next/env`, which skips `.env.local` when `NODE_ENV=test` and never overrides an exported variable, so the only trustworthy input is the `DATABASE_URL` the run actually resolved. Each database suite calls `assertTestDatabaseUrl()` at load time and `assertTestDatabaseReady()` in `beforeAll`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
