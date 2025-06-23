# DCAP Asset Explorer

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). Alternatively, you can install Next.js and build the app as follows:

```bash
npm i next@latest
npm run build
# or
yarn add next@latest
yarn build
# or
pnpm i next@latest
pnpm build
# or
bun add next@latest
bun build
```

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

Afterwards, create the `.env` file according to either the example `example.env.local` or `example.env.compellio`. These files are pre-configured for either deployments that are based on a local Registry (i.e.: [DCAP.Web](https://github.com/compellio/dcap.web)) or for deployments that are connected to the Compellio Registry.

When done creating the `.env` file, open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Info about Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
