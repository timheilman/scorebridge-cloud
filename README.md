<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Welcome to ScoreBridge-Cloud](#welcome-to-scorebridge-cloud)
- [Installation/deployment instructions](#installationdeployment-instructions)
   * [Using NPM](#using-npm)
   * [Updating graphql-based typescript types](#updating-graphql-based-typescript-types)
- [Exporting details to the webapp](#exporting-details-to-the-webapp)
- [Testing](#testing)
- [Template features](#template-features)
   * [Project structure](#project-structure)
   * [3rd party libraries](#3rd-party-libraries)
- [Setting up a new env](#setting-up-a-new-env)
- [Project Origins](#project-origins)
   * [Serverless - AWS Node.js Typescript](#serverless---aws-nodejs-typescript)
   * [Yan Cui AppSync MasterClass](#yan-cui-appsync-masterclass)

<!-- TOC end -->

## Welcome to ScoreBridge-Cloud

In Portland, Oregon, USA there is a [duplicate bridge](https://en.wikipedia.org/wiki/Duplicate_bridge) club run by a guy named Zack.  It is not sanctioned by the [ACBL](https://acbl.org/) and Zack charges no dues – it's purely social and for-fun.  I (Tim) am a club member.  Different club members take turns hosting the game at their homes.

Presently we use Google sheets and extensive macros that Zack has written in them to score the games.  However, it is awkward and error-prone using Google Sheets to enter player identities and scores so I undertook this project to make things easier and less error-prone.

As of December 1, 2023, this project is very much a work-in-progress; it is not yet capable of doing what it intends, which is to replace the Google Sheets and macros. Someday I hope it will be.

The project is in three parts: a [webapp](https://github.com/timheilman/scorebridge-webapp), a [device app](https://github.com/timheilman/scorebridge-device), and this cloud backend. The club admin (Zack) uses the webapp to administer the game and players use the device app to enter identities and scores.  The device app is a React Native app that runs on iOS and Android.  The webapp is a React app that runs in a browser. This cloud backend coordinates interaction between the webapp and device app.  It is serverless, deployed using the serverless npm package.  It uses AWS AppSync, Cognito, DynamoDB, and Lambda.  It is written in TypeScript.

## Installation/deployment instructions

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

Export an env var, SB_TEST_AWS_CLI_PROFILE, containing the profile that you use to also:

```
aws sso login --profile <that_profile_name>
```

Also export CREATE_USER_API_KEY_EXPIRES_EPOCH_SEC=NaN . This allows serverless packaging into .serverless to proceed even when not deploying.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx run package` to package into ./.serverless
- Run `npx run deploy` to deploy this stack to AWS

### Updating graphql-based typescript types

`appsync.d.ts` is a generated file saved in the submodule.

Use `npm run gql-types-codegen` to generate typescript types from the gql schema.

## Exporting details to the webapp

Both the webapp react app running locally and the cypress test harness for it require some exports from this repo. Use `npm run refreshDetailsToWebapp` and see package.json for details.

## Testing

For now, only the dev environment is enabled. First, establish a `.env` file at project root using:

```
npm run -- exportEnvDev
```

That file will point at appropriate services for the stage or "env". Then run E2E tests with:

```
npm run -- test
```

Per Yan Cui's advice, in the serverless paradigm, E2E tests are the high-value tests, whereas integration and unit tests are not worth the effort.  E2E tests are as close to acceptance tests as we can get, although user sign up is simulated with cognito idp admin commands.

## Template features

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   ├── hello
│   │   │   ├── handler.ts      # `Hello` lambda source code
│   │   │   ├── index.ts        # `Hello` lambda Serverless configuration
│   │   │   ├── mock.json       # `Hello` lambda input parameter, if any, for local invocation
│   │   │   └── schema.ts       # `Hello` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts            # Import/export of all lambda configurations
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```

### 3rd party libraries

- See this file at repo tag SLS_CREATE_RESULT for information on good libraries for use with API Gateway, if and when a REST endpoint is needed.
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

## Setting up a new env

Notes from doing it. Problem: must verify "from" email address before cognito can use it in ses.

1. setup a new ~/.aws/config profile and session for the serverless service/aws account, if it doesn't exist yet, like in [example_aws_config.txt](./example_aws_config.txt)
2. e.g. `export SB_TEST_AWS_CLI_PROFILE=ScoreBridge-sbc00-tdh-PowerUser-profile`
3. e.g. `npm run verifyEmail -- scorebridge8+tmpenv@gmail.com ` . That requires clicking a link sent to that address. No ConfigSet, yet.
4. clicky your link
5. Deploy to the env. `npm run deploy<Env>`
6. `aws sso login --profile ${SB_TEST_AWS_CLI_PROFILE}`
7. - non-prod: run `npm run setRecaptchaSecrets<Env>`
   - prod: go into secrets manager and set the prod keys for recaptcha.
8. Go into [SES verified identities](https://us-west-2.console.aws.amazon.com/ses/home?region=us-west-2#/verified-identities) and provide the verified identity a default ConfigSet: the one with a suffix of the <Env> deployed. (This linkage cannot be made in serverless.ts because the creation of the cognito user pool resource tests the email-send and fails the resource creation if the address is not verified in SES, and we cannot pause the deployment to verify the address over at gmail. Couldn't quickly figure out how to do this with CLI so it's console only.)
9. `npm run exportEnv<Env>`
10. run `npm run createAutomatedTestUsers`
11. `npm test` should pass
12. run `npm run refreshExportedDetailsToWebapp`
13. in webapp,
    - `npm start` in one terminal,
    - `npm cypress:open` in another terminal
    - select E2E testing
    - tests should pass

## Project Origins

### Serverless - AWS Node.js Typescript

This project was generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/). To view this README at its origin as created by that template, use `git checkout SLS_CREATE_RESULT`.

[Jira](https://theilman.atlassian.net/jira/software/projects/SCOR/boards/1) is the project-tracking software.

### Yan Cui AppSync MasterClass

See Yan Cui's excellent instruction for [GraphQL in the serverless paradigm](https://appsyncmasterclass.com); this repo is an updated-to-summer-2023 follow-along to his video course on AWS AppSync.

