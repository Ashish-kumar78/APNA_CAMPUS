import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CalendarNotesController } from './calendar-notes.controller';
import { CalendarNotesService } from './calendar-notes.service';

@Module({
  imports: [PrismaModule],
  controllers: [CalendarNotesController],
  providers: [CalendarNotesService],
  exports: [CalendarNotesService],
})
export class CalendarNotesModule {}

