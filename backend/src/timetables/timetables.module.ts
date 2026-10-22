import { Module } from '@nestjs/common';
import { TimetablesController } from './timetables.controller';
import { TimetablesService } from './timetables.service';
import { TimetableSolverService } from './timetables.solver.service';
import { TimetableValidationService } from './timetables.validation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimetablesController],
  providers: [TimetablesService, TimetableSolverService, TimetableValidationService],
  exports: [TimetablesService, TimetableValidationService, TimetableSolverService],
})
export class TimetablesModule {}
