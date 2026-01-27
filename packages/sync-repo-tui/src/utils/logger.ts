/**
 * ロガー
 */

import { terminal } from 'terminal-kit';

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  private log(level: LogLevel, message: string, color: string): void {
    const prefixStr = this.prefix ? `[${this.prefix}] ` : '';
    const levelStr = `[${level}]`;

    terminal[color](`${levelStr} ${prefixStr}${message}\n`);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message, 'blue');
  }

  success(message: string): void {
    this.log(LogLevel.SUCCESS, message, 'green');
  }

  warning(message: string): void {
    this.log(LogLevel.WARNING, message, 'yellow');
  }

  error(message: string): void {
    this.log(LogLevel.ERROR, message, 'red');
  }

  raw(message: string): void {
    terminal(message);
  }

  newline(): void {
    terminal('\n');
  }
}

/**
 * デフォルトロガー
 */
export const logger = new Logger('SyncRepoTUI');
