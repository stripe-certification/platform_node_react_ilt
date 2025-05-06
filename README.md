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

You can find every place which needs updates by searching for `Training TODO` comments, but here are a collection of milestones to help guide your progress. Also, you can use the video below to see how the app operates when everything is behaving correctly.

### Milestone 1: Onboarding a new user

You'll need to create a new Connect account, configure the controller appropriately, and then use the Connect embedded components for collecting KYC data.

Complete the server code that currently creates a new Pose user to also create a corresponding Stripe account:

- The account should have transfer and card payment capabilities.
- The Pose application will pay the Stripe fees and will assume liability for any losses the account can't pay. It will also be responsible for collecting KYC information.
- The new account does not need access to the Stripe dashboard.
- Store the Pose database id for this user in the metadata of the Stripe account.

Once you've create a Stripe account associated with the user, complete the Dashboard page within the Pose client to display the Connect embedded account components to the user.

- The Pose client layout includes an `EmbeddedComponentContext` class which handles the initialization required by the Connect components. Before you can use one of the Connect components, you'll need to complete the context to initialize and provide a StripeConnectInstance. Complete the `useEffect` function in the context to fetch a client secret, make a server call to create an AccountSession object and then initialize a StripeConnectInstance. You can use the following CSS styles in your call to `loadConnectAndInitialize` to make the components appear integrated into the application:

```
 appearance: {
          overlays: 'dialog',
          variables: {
            fontFamily: 'Sohne, inherit',

            colorPrimary: '#312356',

            buttonPrimaryColorBackground: '#312356',
            buttonPrimaryColorText: '#f4f4f5',

            badgeSuccessColorBackground: '#D7F4CC',
            badgeSuccessColorText: '#264F47',
            badgeSuccessColorBorder: '#BDDAB3',

            badgeWarningColorBackground: '#FFEACC',
            badgeWarningColorText: '#C95B4D',
            badgeWarningColorBorder: '#FFD28C',

            badgeDangerColorBackground: '#FFEACC',
            badgeDangerColorText: '#C95B4D',
            badgeDangerColorBorder: '#FFD28C',
          },
        },
```

- Within the server's account session service, complete the function `createAccountSession`. You should enable the following components: `account_management`, `account_onboarding`, `notification_banner`, `payments`, `payouts`, `capital_financing`, `capital_financing_application`, `capital_financing_promotion`. `disable_stripe_user_authentication` and `external_account_collection` should both be set to true for components that have that feature.
- Back in the client, use the notification banner to display any account onboarding messages from Stripe to the user.
- Next display either the account management or onboarding component based on whether the user has completed submitting their KYC details.
- Display the tax setting and registration components.

Lastly you'll need to listen for `account.updated` webhook events so you know when a user has completed their Stripe onboarding.

- You'll start by adding code that constructs the event object from the payload sent by Stripe to your webhook the handler.
- Use the helper method `isPoseAccount` to confirm the event object is a Stripe account of a Pose user.
- You can then call User service's `handleAccountUpdate` function to update the status of the account within the Pose database.

### Milestone 2: Collecting payments for classes

The next step is to populate the workshop schedule. For each workshop you will create a PaymentLink to faciliate paid reservations. The instructors can share these with their clients and on social media posts

To get started creating workshops you'll need to first create instructors and studios. You can create them within the Team page of the app. Once you have some studios and instructors, complete the code within the server's workshop service to add a PaymentLink to the workshop during creation.

You'll start by creating a Price object. You will use the params that are passed to the function to populate the price attributes:

- The price's nickname should be set to the `name` param.
- Use the `amount` param in caluculating the `unit_amount`.
- The price's `product_data` attribute should have a `name` field of the format `<instructor.name> - <name param>`.
- The price should be created within the connected account.

Use your newly create price to create a PaymentLink:

- The payment link should be created within the connected account.
- The payment link should have the following metadata fields populated: `instructorId`, `studioId`, `instructorName`, `studioName` and `workshopId`.
- This metadata should be set both on the payment link as well as on the associated PaymentIntent.
- A customer should always be created when the payment link is used.
- The payment link should use the price id and be limited to purchasing one reservation per checkout instance.
- The studio capacity should determine the number of times the payment link can be used.

You can test your payment links by viewing the schedule of workshops in the application and clicking the `Copy` icon next to one of the events to grab the payment link's URL. Paste it into a new browser window to complete the reservation.

### Milestone 3: Consuming webhook events to register payment

You'll need to keep track of paid reservations so you don't oversell a workshop. For this milestone you'll add handling `checkout.session.completed` events to your webhook listener.

- You can use the helper method `isCheckoutSession` to confirm the the object in the event payload is a Checkout session.
- You can call the `incrementEventAttendees` function within the User service to update the count of attendees.

### Milestone 4: Integrating the Payments and Payouts components

Once the user has received some payments for workshop reservations, it's time to flesh out their Dashboard to show them their payments and when they will receive their money.

- Add the Connect Payments embedded component to the Payments page within the user's Dashboard.
- Add the Connect Payouts embedded component to the Payouts page within the user's Dashboard.

### Milestone 5: Offering working capital via Capital for Platforms

The last thing we'll do is use the Connect embeed components within the Finances page to show Captial loan offers and disbursment and repayment activity.

- Update the Finances page to show the Connect embedded components for Capital Financing and Promotion.

See the [Setting up a Capital Loan for an Account](#setting-up-a-capital-loan-for-an-account) section of this README for tips on how to create a within your Stripe dashboard to test in Pose.

### Bonus: Ideas for what to build next

- Give the user the ability delete a workshop from the `Schedule` page. Deleting a workshop should also refund any payments that had already been collected for it.
- Add a customer facing Checkout page for workshop attendees. Customers should be able to 'log in' using their email address, and the workshop id should be pulled out of the URL's query params. Create a Stripe Customer resource based on the email address and use Embedded Checkout to collect the customer's payment. Confirm your webhook listener is updating attendee counts when someone checkouts through this flow.

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
