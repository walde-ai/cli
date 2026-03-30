import { Config } from '@/cli/domain/entities/Config';

/**
 * Port interface for loading configuration
 */
export interface ILoadConfig {
  execute(stage?: string): Promise<Config>;
}
