/**
 * Interface for directory operations
 */
export interface DirectoryManager {
  /**
   * Checks if a directory is empty
   * @param path - Directory path to check
   * @returns Promise resolving to true if directory is empty
   */
  isEmpty(path: string): Promise<boolean>;

  /**
   * Creates a directory
   * @param path - Directory path to create
   */
  createDirectory(path: string): Promise<void>;

  /**
   * Checks if a path exists
   * @param path - Path to check
   * @returns Promise resolving to true if path exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Recursively scans directory for all files
   * @param directoryPath - Directory path to scan
   * @returns Promise resolving to array of file paths
   */
  scanFilesRecursively(directoryPath: string): Promise<string[]>;
}
