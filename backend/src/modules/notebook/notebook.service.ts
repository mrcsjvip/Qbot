import { Injectable } from '@nestjs/common';

@Injectable()
export class NotebookService {
  private active: { sessionId: string; url: string; status: string } | null = null;

  start() {
    const session = {
      sessionId: 'nb-' + Date.now(),
      url: 'http://localhost:8800/tree',
      status: 'running',
    };
    this.active = session;
    return session;
  }

  get(id: string) {
    if (this.active && this.active.sessionId === id) return this.active;
    return null;
  }

  stop(id: string) {
    if (this.active && this.active.sessionId === id) {
      this.active = { ...this.active, status: 'stopped' };
      return this.active;
    }
    return { sessionId: id, status: 'not_found' };
  }

  getActive() {
    return this.active;
  }
}

