import { Command } from 'commander';
import chalk from 'chalk';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { CommandApiCall } from '@/cli/domain/interactors/command-api-call';
import { Runtime } from '@/cli/infra/runtime';

export type CurlDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
};

/**
 * Creates the curl command
 */
export function createCurlCommand(deps: CurlDependencies): Command {
  const command = new Command('curl');
  
  command
    .description('Make HTTP requests to Writer API')
    .argument('<path>', 'API path to request')
    .option('-X, --request <method>', 'HTTP method (GET, POST, PUT, DELETE)', 'GET')
    .option('-d, --data <data>', 'Request body data (JSON string)')
    .option('-H, --header <header>', 'Additional headers (format: "Key: Value")', collectHeaders, [])
    .action(async (path: string, options) => {
      await executeCurl(deps, path, options);
    });

  return command;
}

/**
 * Collect multiple header options
 */
function collectHeaders(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

/**
 * Execute the curl command
 */
async function executeCurl(deps: CurlDependencies, path: string, options: any): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    
    // Parse request body if provided
    let requestBody;
    if (options.data) {
      try {
        requestBody = JSON.parse(options.data);
      } catch (error) {
        console.error(chalk.red('Invalid JSON in request body'));
        process.exit(1);
      }
    }

    // Parse headers
    const headers: Record<string, string> = {};
    for (const header of options.header) {
      const [key, ...valueParts] = header.split(':');
      if (!key || valueParts.length === 0) {
        console.error(chalk.red(`Invalid header format: ${header}. Use "Key: Value" format.`));
        process.exit(1);
      }
      headers[key.trim()] = valueParts.join(':').trim();
    }

    const commandApiCall = new CommandApiCall(deps.credentialsProvider, deps.configLoader);
    
    const response = await commandApiCall.execute({
      method: options.request.toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE',
      endpoint: path,
      data: requestBody,
      headers: Object.keys(headers).length > 0 ? headers : undefined
    });

    // Output response
    if (typeof response === 'object') {
      console.log(JSON.stringify(response, null, 2));
    } else {
      console.log(response);
    }
  });
}
