import { Command } from 'commander';

import { createAssetPushCommand, AssetPushDependencies } from './push';
import { withCommonOptions } from '../common-options';

export type AssetCommandGroupDependencies = {
  push: AssetPushDependencies;
};

export function createAssetCommandGroup(deps: AssetCommandGroupDependencies): Command {
  const assetCommand = new Command('asset');
  assetCommand.alias('assets');
  assetCommand.description('Asset management commands');

  assetCommand.addCommand(withCommonOptions(createAssetPushCommand(deps.push)));

  return assetCommand;
}

export { createAssetPushCommand };
