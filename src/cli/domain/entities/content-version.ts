import { Format } from './format';
import { ContentPart } from '@walde.ai/sdk';
import { Locale } from '@/cli/domain/types/locale';

/**
 * Represents a version of user-created content with a specific format and parts
 */
export class ContentVersion {
  public readonly locale: Locale = 'en-us';

  /**
   * Creates a new ContentVersion instance
   * @param id - The unique identifier for the content version (undefined for new versions)
   * @param contentId - The identifier of the content this version belongs to
   * @param name - The name of the content at this version
   * @param key - The key/slug of the content at this version
   * @param format - The format definition for this content version
   * @param parts - Map of part keys to ContentPart instances
   */
  constructor(
    public readonly id: string | undefined,
    public readonly contentId: string,
    public readonly name: string,
    public readonly key: string,
    public readonly format: Format,
    private readonly parts: Map<string, ContentPart<any>>
  ) {
    this.parts = new Map(parts);
  }

  /**
   * Gets all content parts
   * @returns Map of part keys to ContentPart instances
   */
  public getParts(): Map<string, ContentPart<any>> {
    return this.parts;
  }

  /**
   * Creates a new ContentVersion with a different contentId
   * @param newContentId - The new content identifier
   * @returns New ContentVersion instance with updated contentId
   */
  public cloneWithNewContentId(newContentId: string): ContentVersion {
    return new ContentVersion(
      this.id,
      newContentId,
      this.name,
      this.key,
      this.format,
      this.parts
    );
  }
}
