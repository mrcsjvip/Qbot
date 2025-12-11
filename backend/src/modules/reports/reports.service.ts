import { Injectable } from '@nestjs/common';
import { SupabaseRepo } from '../../infra/supabase-repo';
import { supabase } from '../../config/supabase.client';

@Injectable()
export class ReportsService {
  private repo = new SupabaseRepo('reports');
  private mockReports: Array<{ id: string; title: string; uri: string; owner_id: string }> = [];

  list(ownerId: string) {
    if (!supabase) {
      return this.mockReports.filter((r) => r.owner_id === ownerId);
    }
    return this.repo.listByOwner(ownerId);
  }

  get(id: string, ownerId: string) {
    if (!supabase) {
      return (
        this.mockReports.find((r) => r.id === id && r.owner_id === ownerId) ?? {
          id,
          title: `Report ${id}`,
          uri: `/docs/${id}.pdf`,
        }
      );
    }
    const found = this.repo.findOne(id, ownerId);
    return found ?? { id, title: `Report ${id}`, uri: `/docs/${id}.pdf` };
  }

  create(payload: { title: string; uri: string }, ownerId: string) {
    const id = `rep-${Date.now()}`;
    const report = { id, ...payload, owner_id: ownerId };
    if (!supabase) {
      this.mockReports.unshift(report);
      return report;
    }
    this.repo.insert(report);
    return report;
  }
}

