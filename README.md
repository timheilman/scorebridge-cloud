## Project Origins

### Serverless - AWS Node.js Typescript

This project was generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).  To view this README at its origin as created by that template, use `git checkout SLS_CREATE_RESULT`.

[Jira](https://theilman.atlassian.net/jira/software/projects/SCOR/boards/1) is the project-tracking software.

### Yan Cui AppSync MasterClass

See Yan Cui's excellent instruction for [GraphQL in the serverless paradigm](https://appsyncmasterclass.com); this repo is an updated-to-summer-2023 follow-along to his video course on AWS AppSync.

## Installation/deployment instructions

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

Export an env var, SB_TEST_AWS_CLI_PROFILE, containing the profile that you use to also:

```
aws sso login --profile <that_profile_name>
```

Also export ADD_USER_API_KEY_EXPIRES_EPOCH_SEC=NaN .  This allows serverless packaging into .serverless to proceed 
even when not deploying.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx run package` to package into ./.serverless
- Run `npx run deploy` to deploy this stack to AWS

### Updating graphql-based typescript types

Although it is checked in, `appsync.d.ts` is a generated file.

Use `npm run gql-types-codegen` to generate typescript types from the gql schema.

## Testing

For now, only the dev environment is enabled.  First, establish a `.env` file at project root using:

```
npm run -- exportEnvDev
```

That file will point at appropriate services for the stage or "env".  Then run integration and/or e2e tests with:

```
npm run -- integration-test
npm run -- e2e-test
```

Integration tests System-Under-Test is everything behind an artificial invocation of lambda code.  Thus NODE_ENV is inspected in production code, and SSO credentials rather than env-provided ones are used when NODE_ENV is test, but otherwise all execution beyond the lambda is real.

E2E tests are as close to acceptance tests as we can get, although user sign up is simulated with cognito idp admin commands.

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
