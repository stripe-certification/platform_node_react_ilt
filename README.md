# Platform ILT

## Overview

This demo is built with

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

Install dependencies using npm:

Navigate to backend directory

```
cd servers/node/server
```

run

```
npm install
```

Create a `.env` file using the `.env.example` for reference, add your [Stripe API keys](https://dashboard.stripe.com/account/apikeys):

Start local webhook listener

ensure stripe cli is installed `https://stripe.com/docs/stripe-cli#install`

In a new terminal navigate to `/servers/node/server`

```
stripe listen --forward-to localhost:4242/webhook
```

Navigate to frontend directory

```
cd clients/react/client
```

run

```
npm install
```

Create a `.env` file using the `.env.example` for reference, add your [Stripe API keys](https://dashboard.stripe.com/account/apikeys):

## Run the app:

In `servers/node/server` & `clients/react/client`

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running playwright smoke test

Navigate to `/test` directory and run

```
npm install
```

```
npx playwright install --with-deps chromium
```

Note: Playwright installs browsers into a shared system directory by default. If you can only run programs from a specific directory, then you can tell Playwright to install browsers within this project by setting the following environment variable before running the commands above: export PLAYWRIGHT_BROWSERS_PATH=0.

Run smoke test:

```
npx playwright test
```