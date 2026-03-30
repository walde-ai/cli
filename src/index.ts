#!/usr/bin/env node

import { createProgram } from './cli/infra/commands/index.js';
import { ProductionDependencyFactory } from './cli/infra/factories/production-dependency-factory.js';
import { CredentialsRepoFactory } from './cli/infra/factories/credentials-repo-factory.js';
import { getCurrentStage, withCommonOptions } from './cli/infra/commands/common-options.js';

const credentialsRepoFactory = new CredentialsRepoFactory(getCurrentStage);
const factory = new ProductionDependencyFactory(credentialsRepoFactory);
const program = createProgram(factory);

// Apply common options to the root program as well
withCommonOptions(program);

program.parse();
