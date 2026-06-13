#!/usr/bin/env node

import { createProgram } from './cli/infra/commands/index.js';
import { ProductionDependencyFactory } from './cli/infra/factories/production-dependency-factory.js';
import { CredentialsRepoFactory } from './cli/infra/factories/credentials-repo-factory.js';
import { ConfigLoaderFactory } from './cli/infra/factories/config-loader-factory.js';
import { getCurrentStage, withCommonOptions } from './cli/infra/commands/common-options.js';
import { getApiEndpointOverride } from './entry-points/env-config.js';

// Composition root: inject environment-derived configuration overrides
// so that library/infrastructure code never reads environment variables
// directly. `WALDE_API_ENDPOINT` is the highest-priority source for the
// SDK's API endpoint and is the channel by which the deploy-pipeline
// container points `walde push` at the correct Walde API.
ConfigLoaderFactory.setEndpointOverride(getApiEndpointOverride());

const credentialsRepoFactory = new CredentialsRepoFactory(getCurrentStage);
const factory = new ProductionDependencyFactory(credentialsRepoFactory);
const program = createProgram(factory);

// Apply common options to the root program as well
withCommonOptions(program);

program.parse();
