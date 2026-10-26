import { signal } from '@angular/core';
import type { ShyLogEntry, ShyLogSink } from '@shyland-dev/utils';

export interface StoredLog extends ShyLogEntry {
  id: number;
  at: number;
}

const MAX = 200;

/**
 * Sink do logger do app: guarda as últimas entradas num signal para a página "Logger ao vivo" mostrar.
 * Fica fora do DI porque `provideShyLogger({ sink })` recebe a instância na hora de montar o app.
 * Em produção `ngDevMode` é false, o logger vira no-op e este sink nunca é chamado.
 */
class LogStore implements ShyLogSink {
  private seq = 0;
  readonly entries = signal<StoredLog[]>([]);

  write(entry: ShyLogEntry): void {
    const item: StoredLog = { ...entry, id: ++this.seq, at: Date.now() };
    this.entries.update((l) => [item, ...l].slice(0, MAX));
    // Espelha no console como o sink padrão faria, para o DevTools continuar útil.
    const fn = entry.level === 'debug' ? 'log' : entry.level;
    console[fn](`[shy:${entry.namespace}]`, ...entry.args);
  }

  clear(): void {
    this.entries.set([]);
  }
}

export const logStore = new LogStore();

/** Verdadeiro no `ng serve` (build de desenvolvimento); falso no build de produção, onde o logger da utils é vazio. */
declare const ngDevMode: boolean | undefined;
export const isDevBuild = typeof ngDevMode === 'undefined' || !!ngDevMode;
