/**
 * ファイル操作ユーティリティ
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * ディレクトリが存在するかチェック
 */
export function directoryExists(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * ファイルが存在するかチェック
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * ディレクトリ内のファイルを再帰的に取得
 * @param dirPath ディレクトリパス
 * @param pattern ファイルパターン（オプション）
 * @param excludePatterns 除外パターン（オプション）
 */
export function findFiles(
  dirPath: string,
  pattern?: RegExp,
  excludePatterns?: RegExp[]
): string[] {
  const files: string[] = [];

  function traverse(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      // 除外パターンチェック
      if (excludePatterns) {
        const relativePath = path.relative(dirPath, fullPath);
        const isExcluded = excludePatterns.some(p => p.test(relativePath));
        if (isExcluded) {
          continue;
        }
      }

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        // パターンチェック
        if (!pattern || pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }

  if (directoryExists(dirPath)) {
    traverse(dirPath);
  }

  return files;
}

/**
 * ディレクトリを再帰的に作成
 */
export function ensureDirectory(dirPath: string): void {
  if (!directoryExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * ファイルをコピー
 */
export function copyFile(src: string, dest: string): void {
  ensureDirectory(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

/**
 * 一時ディレクトリを作成
 */
export function createTempDir(): string {
  return fs.mkdtempSync('/tmp/sync-repo-tui-');
}

/**
 * 一時ディレクトリを削除
 */
export function removeTempDir(dirPath: string): void {
  if (directoryExists(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}
