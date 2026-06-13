/**
 * Composition-root helpers that read environment variables for the CLI.
 *
 * Environment access is intentionally isolated to this entry-points
 * module so that the rest of the CLI/SDK code remains free of direct
 * `process.env` references.
 */

/**
 * Returns the API endpoint override supplied via the `WALDE_API_ENDPOINT`
 * environment variable, or `undefined` if it is not set or is empty.
 *
 * This is the channel by which the deploy-pipeline container (and any
 * other automated caller) points `walde push` at the correct Walde API
 * without writing a configuration file.
 */
export function getApiEndpointOverride(): string | undefined {
  const value = process.env.WALDE_API_ENDPOINT;
  return value && value.length > 0 ? value : undefined;
}
