/**
 * Interface defining a format part that can validate values
 */
export interface FormatPart {
  /**
   * Validates if the given value can be mapped to this format part
   * @param value - The value to validate
   * @returns true if the value is valid for this format part
   */
  validate(value: unknown): boolean;
}
