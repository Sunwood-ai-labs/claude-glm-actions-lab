/**
 * 進捗表示
 */

import { terminal } from 'terminal-kit';

export class ProgressDisplay {
  private current = 0;
  private total = 0;
  private message = '';

  constructor(total: number, message: string) {
    this.total = total;
    this.message = message;
  }

  /**
   * 進捗を表示
   */
  show(): void {
    terminal('\n');
    this.update(0);
  }

  /**
   * 進捗を更新
   */
  update(current: number): void {
    this.current = current;
    this.render();
  }

  /**
   * 次に進む
   */
  next(): void {
    this.current++;
    this.render();
  }

  /**
   * メッセージを更新
   */
  setMessage(message: string): void {
    this.message = message;
    this.render();
  }

  /**
   * レンダリング
   */
  private render(): void {
    // カーソルを行頭に移動してクリア
    terminal.eraseLine();
    terminal.moveTo(1, undefined);

    const percentage = Math.floor((this.current / this.total) * 100);
    const bar = this.createBar(percentage);

    terminal.cyan(`${this.message}: `);
    terminal.green(`${bar} `);
    terminal(`${this.current}/${this.total} (${percentage}%)`);
  }

  /**
   * プログレスバーを作成
   */
  private createBar(percentage: number): string {
    const width = 30;
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;

    return `[${'='.repeat(filled)}${' '.repeat(empty)}]`;
  }

  /**
   * 完了
   */
  complete(): void {
    terminal('\n');
    terminal.green('✓ 完了\n');
  }

  /**
   * エラー表示
   */
  error(message: string): void {
    terminal('\n');
    terminal.red(`✗ ${message}\n`);
  }
}

/**
 * インライン進捗表示（簡易版）
 */
export class InlineProgress {
  private message = '';

  constructor(message: string) {
    this.message = message;
  }

  /**
   * メッセージを表示
   */
  show(): void {
    terminal.cyan(`${this.message}...`);
  }

  /**
   * 成功
   */
  success(): void {
    terminal.eraseLine();
    terminal.moveTo(1, undefined);
    terminal.green(`✓ ${this.message}\n`);
  }

  /**
   * エラー
   */
  error(message?: string): void {
    terminal.eraseLine();
    terminal.moveTo(1, undefined);
    terminal.red(`✗ ${this.message}${message ? `: ${message}` : ''}\n`);
  }

  /**
   * 警告
   */
  warning(message?: string): void {
    terminal.eraseLine();
    terminal.moveTo(1, undefined);
    terminal.yellow(`⚠ ${this.message}${message ? `: ${message}` : ''}\n`);
  }
}
