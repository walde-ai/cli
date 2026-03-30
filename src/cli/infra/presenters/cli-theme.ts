import chalk from 'chalk';

/**
 * CLI color theme for Walde.
 * Colors are defined by role, not by name.
 * - accent: forest green (Walde brand color) — success, section headers, links
 * - body: white — main output text
 * - soft: dark gray — secondary information, labels
 * - error: dark red — errors and problems
 */
export const CliTheme = {
  accent: chalk.hex('#228B22'),
  body: chalk.white,
  soft: chalk.hex('#808080'),
  error: chalk.hex('#8B0000'),
} as const;
