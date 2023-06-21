import type { AWS } from '@serverless/typescript';

// import hello from '@functions/hello';
import appSync from './serverless.appsync-api';

const serverlessConfiguration: AWS = {
  org: 'theilman',
  app: 'scorebridge-backend-app',
  service: 'scorebridge-backend-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-appsync-plugin'],
  provider: {
    name: 'aws',
    region: 'us-west-2',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  // functions: { hello }, // SCOR-12 no functions needed in ch4.01
  package: {
    individually: true,
    exclude: [
      'package-lock.json',
      'package.json'
    ]
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    appSync
  },
};

module.exports = serverlessConfiguration;
