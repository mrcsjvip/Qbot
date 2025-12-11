import { supabase } from '../config/supabase.client';

type Where = Record<string, any>;

export class SupabaseRepo {
  constructor(private readonly table: string, private readonly idField = 'id') {}

  async listByOwner(ownerId: string) {
    this.ensureClient();
    const { data, error } = await supabase!.from(this.table).select('*').eq('owner_id', ownerId);
    if (error) throw error;
    return data ?? [];
  }

  async insert<T extends Record<string, any>>(payload: T) {
    this.ensureClient();
    const { data, error } = await supabase!.from(this.table).insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async findOne(id: string | number, ownerId?: string) {
    this.ensureClient();
    let query = supabase!.from(this.table).select('*').eq(this.idField, id);
    if (ownerId) query = query.eq('owner_id', ownerId);
    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ?? null;
  }

  async update(
    id: string | number,
    patch: Record<string, any>,
    ownerId?: string,
  ) {
    this.ensureClient();
    let query = supabase!.from(this.table).update(patch).eq(this.idField, id);
    if (ownerId) query = query.eq('owner_id', ownerId);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }

  async remove(id: string | number, ownerId: string) {
    this.ensureClient();
    const { error } = await supabase!
      .from(this.table)
      .delete()
      .eq(this.idField, id)
      .eq('owner_id', ownerId);
    if (error) throw error;
    return true;
  }

  async query(where: Where) {
    this.ensureClient();
    let query = supabase!.from(this.table).select('*');
    Object.entries(where).forEach(([k, v]) => {
      query = query.eq(k, v);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  private ensureClient() {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }
  }
}

