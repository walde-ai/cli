#!/usr/bin/env node

import { createProgram } from './cli/infra/commands/index.js';
import { DevDependencyFactory } from './cli/infra/factories/dev-dependency-factory.js';
import { CredentialsRepoFactory } from './cli/infra/factories/credentials-repo-factory.js';
import { getCurrentStage } from './cli/infra/commands/common-options.js';
import { S3MockClientFactory } from '@walde.ai/sdk';

declare global {
  var waldeStage: string | undefined;
}

// Dev-specific config from environment
const mockServerEndpoint = process.env.MOCK_SERVER_ENDPOINT || 'http://localhost:3000';
const mockS3Endpoint = process.env.MOCK_S3_ENDPOINT || 'http://localhost:9000';

// Create S3 mock client factory for dev mode
const s3ClientFactory = new S3MockClientFactory(mockS3Endpoint);

const credentialsRepoFactory = new CredentialsRepoFactory(getCurrentStage);

const factory = new DevDependencyFactory({
  endpoint: mockServerEndpoint,
  s3Endpoint: mockS3Endpoint,
  s3ClientFactory: s3ClientFactory
}, credentialsRepoFactory);

const program = createProgram(factory);

program
  .description('CLI tool for Project Writer (Development Mode)')
  .option('--stage <stage>', 'Configuration stage to use (defaults to local)', 'local')
  .option('--endpoint <endpoint>', 'Mock server endpoint', mockServerEndpoint)
  .option('--s3-endpoint <s3Endpoint>', 'Mock S3 endpoint', mockS3Endpoint)
  .hook('preAction', (thisCommand) => {
    // Store stage globally before any subcommand executes
    global.waldeStage = thisCommand.opts().stage || 'local';
  });

program.parse();
