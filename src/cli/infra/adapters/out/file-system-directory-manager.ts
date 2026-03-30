import { DirectoryManager } from '@/cli/domain/ports/out/directory-manager';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * File system implementation of DirectoryManager
 */
export class FileSystemDirectoryManager implements DirectoryManager {
  /**
   * Checks if a directory is empty
   * @param path - Directory path to check
   * @returns Promise resolving to true if directory is empty
   */
  public async isEmpty(path: string): Promise<boolean> {
    try {
      const files = await fs.readdir(path);
      return files.length === 0;
    } catch (error) {
      throw new Error(`Failed to check if directory is empty: ${(error as Error).message}`);
    }
  }

  /**
   * Creates a directory (including parent directories)
   * @param path - Directory path to create
   */
  public async createDirectory(path: string): Promise<void> {
    try {
      await fs.mkdir(path, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory '${path}': ${(error as Error).message}`);
    }
  }

  /**
   * Checks if a path exists
   * @param path - Path to check
   * @returns Promise resolving to true if path exists
   */
  public async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Recursively scans directory for all files
   * @param directoryPath - Directory path to scan
   * @returns Promise resolving to array of file paths
   */
  public async scanFilesRecursively(directoryPath: string): Promise<string[]> {
    try {
      const files: string[] = [];
      const entries = await fs.readdir(directoryPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(directoryPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.scanFilesRecursively(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Add file to results
          files.push(fullPath);
        }
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to scan directory '${directoryPath}': ${(error as Error).message}`);
    }
  }
}
