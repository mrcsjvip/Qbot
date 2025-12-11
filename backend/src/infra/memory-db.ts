type Predicate<T> = (row: T) => boolean;
type Updater<T> = (row: T) => T;

/**
 * Very lightweight in-memory “DB” to ease future replacement (e.g., Supabase/SQL).
 * Tables are just arrays keyed by name; operations are synchronous.
 */
export class MemoryDB {
  private tables = new Map<string, any[]>();

  list<T = any>(table: string): T[] {
    return this.tables.get(table)?.slice() ?? [];
  }

  insert<T = any>(table: string, row: T): T {
    const arr = this.tables.get(table) ?? [];
    arr.unshift(row);
    this.tables.set(table, arr);
    return row;
  }

  find<T = any>(table: string, pred: Predicate<T>): T | undefined {
    return this.list<T>(table).find(pred);
  }

  update<T = any>(
    table: string,
    pred: Predicate<T>,
    updater: Updater<T>,
  ): T | undefined {
    const arr = this.tables.get(table) ?? [];
    const idx = arr.findIndex(pred as any);
    if (idx >= 0) {
      const updated = updater(arr[idx]);
      arr[idx] = updated;
      this.tables.set(table, arr);
      return updated;
    }
    return undefined;
  }

  remove<T = any>(table: string, pred: Predicate<T>): number {
    const arr = this.tables.get(table) ?? [];
    const kept = arr.filter((row) => !pred(row));
    this.tables.set(table, kept);
    return arr.length - kept.length;
  }
}

// Shared singleton so modules share state; easy to swap with real persistence later.
export const memoryDb = new MemoryDB();

