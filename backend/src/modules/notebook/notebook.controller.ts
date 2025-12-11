import { Controller, Get, Param, Post } from '@nestjs/common';
import { NotebookService } from './notebook.service';

@Controller('notebook/sessions')
export class NotebookController {
  constructor(private readonly notebookService: NotebookService) {}

  @Get('active')
  active() {
    return this.notebookService.getActive();
  }

  @Post()
  start() {
    return this.notebookService.start();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.notebookService.get(id);
  }

  @Post(':id/stop')
  stop(@Param('id') id: string) {
    return this.notebookService.stop(id);
  }
}

