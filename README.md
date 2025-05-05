# Stripe Connect Workshop: Pose

<!-- toc -->

- [Pose Overview](#overview)
- [Your tasks for today](#your-tasks-for-today)
  - [Milestone 1: Onboarding a new user](#milestone-1-onboarding-a-new-user)
  - [Milestone 2: Collecting payments for classes](#milestone-2-collecting-payments-for-classes)
  - [Milestone 3: Consuming webhook events to register payment](#milestone-3-consuming-webhook-events-to-register-payment)
  - [Milestone 4: Integrating the Payments and Payouts components](#milestone-4-integrating-the-payments-and-payouts-components)
  - [Milestone 5: Offering working capital via Capital for Platforms](#milestone-5-offering-working-capital-via-capital-for-platforms)
  - [Bonus: Ideas for what to build next](#bonus-ideas-for-what-to-build-next)
- [Setup](#setup)
  - [0. (Stripes-only) Ensure you have a valid directory](#0-stripes-only-ensure-you-have-a-valid-directory)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Set up system dependencies](#2-set-up-system-dependencies)
  - [3. Install dependencies](#3-install-dependencies)
  - [4. Set up your environment variables](#4-set-up-your-environment-variables)
  - [6. Start the client & server](#6-start-the-client--server)
- [Running the Playwright smoke test](#running-the-playwright-smoke-test)
- [Setting up a Capital Loan for an Account](#setting-up-a-capital-loan-for-an-account)

<!-- tocstop -->

## Pose Overview

Pose is a sample application that helps people run yoga studios. Its users – businesses like Brooklyn Yoga – can set up a list of instructors and studios, schedule classes, and charge customers to attend them.

Pose demonstrates a few features:

- Creating a Connect account and gathering KYC information using [Connect embedded components](https://docs.stripe.com/connect/get-started-connect-embedded-components)
- Charging customers through [Payment Links](https://docs.stripe.com/connect/payment-links) and collecting platform revenue through application fees
- Consuming webhook events to record new registration payments
- Integrating other embedded components to let users manage customer payments and payouts
- A minimal integration of [Capital for Platforms](https://docs.stripe.com/capital/overview), letting Pose give Brooklyn Yoga access to working capital

Note that this app isn’t a reference implementation of Stripe Connect, this code should not be used in production. It is a teaching tool, deliberately simplified to help demonstrate some key features.

## Your tasks for today

You can find every place which needs updates by searching for `TODO` comments, but here are a collection of milestones to help guide your progress. Also, you can use the video below to see how the app operates when everything is behaving correctly.

### Milestone 1: Onboarding a new user

You'll need to create a new Connect account, configure the controller appropriately, and then use the embedded components for collecting KYC data.

### Milestone 2: Collecting payments for workshops

You'll be using PaymentLinks to charge class attendees prior to a workshop. You'll need to complete the code to create a workshop to include creating a PaymentLink that can be used by class attendees to pay.

### Milestone 3: Consuming webhook events to register payment

To keep track of paid workshop attendees you'll need to listen for the `checkout.session.completed` event and update the attendee count.

### Milestone 4: Integrating the Payments and Payouts components

Use the Connect embedded components to complete the user's dashboard and show them the payments they've received as well as their payouts.

### Milestone 5: Offering working capital via Capital for Platforms

Use the Connect embedded components to offer your users loans. Use the `Finances` page to show the offer and subsequently display information about disbursment and repayment. See the [Setting up a Capital Loan for an Account](#setting-up-a-capital-loan-for-an-account) section of this README for tips on how to create a within your Stripe dashboard to test in Pose.

### Bonus: Ideas for what to build next

- Give the user the ability delete a workshop from the `Schedule` page. Deleting a workshop should also refund any payments that had already been collected for it.
- Add a customer facing Checkout page for workshop attendees. Customers should be able to 'login' using their email address, and the workshop id should be pulled out of the ULR query params. Create a Stripe Customer resource based on the email address and use Embedded Checkout to collect the customer's payment.

## First-time setup instructions

### 0. (Stripes-only) Ensure you have a valid directory

```bash
mkdir -p ~/stripe
cd ~/stripe
```

### 1. Clone the repository

If you're unfamiliar with cloning repositories, we have instructions below depending on whether or not you have an SSH key.

<details open>

<summary>My GitHub account has an SSH key</summary>

```bash
git clone git@github.com:stripe-certification/billing_node_react_ilt.git
cd billing_node_react_ilt
```

</details>

<details>

<summary>My GitHub account doesn't have an SSH key</summary>

You can quickly clone the repo by using the GitHub CLI.  You can install it via:

- Unix systems with `brew`: `brew install gh`
- Windows systems: `winget install --id GitHub.cli`
- Other: https://github.com/cli/cli#installation

```bash
brew install gh
gh auth login
gh repo clone stripe-certification/billing_node_react_ilt
cd billing_node_react_ilt
```

</details>
   
### 2. Set up system dependencies

You can install the Stripe CLI with brew by running:

```bash
brew install stripe/stripe-cli/stripe
``` 
If you're on a Windows machine or don't have `brew`, check [here](https://docs.stripe.com/stripe-cli) for other installation commands.

We'll use Node v22.15.0 on this application.  You can set it up with [`nodenv`](https://github.com/nodenv/nodenv) by running:

```bash
nodenv install 22.15.0
nodenv local 22.15.0
```

If you don't already have `nodenv` installed, then you can do so with their [easy installation](https://github.com/nodenv/nodenv-installer#nodenv-installer) package: `npx @nodenv/nodenv-installer`.

### 3. Install dependencies

The client and server run separately in this project, so we recommend opening two terminals side-by-side -- that way you can see any error messages from them both at the same time.

If you have a terminal open in VS Code, you can split it by pressing `cmd + \`.

In the first terminal, install the server dependencies:

```bash
cd ./code/server
npm install
```

In the second terminal, install the client dependencies:

```bash
cd ./code/client
npm install
```

### 4. Set up your environment variables

You'll need to set up the environment variables on both sides of the project.

1. Go to the Dashboard's [API key page](https://dashboard.stripe.com/test/apikeys) so that you'll have the publishable and secret keys on hand.
2. Run `stripe login` to get your CLI synced with your account. Once that's complete, run `stripe listen --print-secret` to get your webhook secret.
3. From your terminal in `code/server`, run `cp ./.env.example .env` to set up your `.env` file. Plug in the values for the Stripe secret, publishable, and webhook keys.
4. From your terminal in `code/client`, run `cp ./.env.example .env` to set up your `.env` file. Plug in the value for the Stripe publishable key.

### 6. Start the client & server

1. From your terminal in `code/server`, run `npm run dev`.
2. From your terminal in `code/client`, run `npm run dev`.
3. Open `localhost:3000` and the Pose app should open right up!

## Running the Playwright smoke test

There's a minimal smoke test written in Playwright to ensure that the application still starts once the Stripe integration has been redacted. Run it with the following commands:

```
npm install
export PLAYWRIGHT_BROWSERS_PATH=0
npx playwright install --with-deps chromium
npx playwright test
```

Note: Playwright installs browsers into a shared system directory by default. The environment variable exported above tells it to install browsers directly into this project folder, which is helpful on corporate devices which only allow binaries to be run from particular directories. If you don't have that constraint, then the variable can be omitted.

## Setting up a Capital Loan for an Account

- Within the Pose app, create a new user and complete the account onboarding
- Within your Stripe Dashboard click "Capital" under Products
- Click "Set up" and then "Create" from within the "Financing Offers" tab
- Fill out the offer form and select the account you just created. What status you pick will determine what the user sees in the Capital component back in Pose.
- If you select a status of 'Undelivered' the account will be prompted to fill out the application. After they fill out the application, you will need to go back to the dashboard and click on the '...' by offer and select "approve and disperse funds".
- If you click the status of 'delivered' the loan will immediately show up in the user's account on Pose and they won't be shown an offer first.
- Once the loan has been delivered to the user, the user can make manual payments on the loan from their bank acount, or you can see automatic payments happening after a customer has signed up for a class.
- You can only create one active offer for an account at a time in test mode.
