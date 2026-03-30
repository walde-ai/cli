import { FormatPart } from './format-part';

/**
 * Represents a format definition with named parts
 */
export class Format {
  /**
   * Creates a new Format instance
   * @param id - The unique identifier for the format
   * @param name - The name of the format
   * @param parts - Map of part names to FormatPart definitions
   */
  constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly parts: Map<string, FormatPart>
  ) {}

  /**
   * Gets the format name
   * @returns The format name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Gets all format parts
   * @returns Map of part names to FormatPart definitions
   */
  public getParts(): Map<string, FormatPart> {
    return new Map(this.parts);
  }

  /**
   * Gets a specific format part by key
   * @param key - The part key
   * @returns The FormatPart or undefined if not found
   */
  public getPart(key: string): FormatPart | undefined {
    return this.parts.get(key);
  }
}
