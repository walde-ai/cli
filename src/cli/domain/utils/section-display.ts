/**
 * Convert a camelCase section key to a human-readable display label by
 * splitting on camelCase word boundaries and title-casing each word.
 *
 * Example: 'namingConventions' -> 'Naming Conventions'.
 *
 * @param key - camelCase section key
 * @returns Human-readable display label
 */
export function sectionDisplayLabel(key: string): string {
  if (!key) {
    return '';
  }
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(' ');
  return words
    .map((word) => (word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}
