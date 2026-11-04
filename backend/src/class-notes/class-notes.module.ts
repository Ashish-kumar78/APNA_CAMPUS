import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import {
  ClassNotesController,
  FacultyClassNotesController,
} from './class-notes.controller';
import { ClassNotesService } from './class-notes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClassNotesController, FacultyClassNotesController],
  providers: [ClassNotesService],
  exports: [ClassNotesService],
})
export class ClassNotesModule {}
