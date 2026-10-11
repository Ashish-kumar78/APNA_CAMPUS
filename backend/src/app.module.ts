import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { MarksModule } from './marks/marks.module';
import { AcademicsModule } from './academics/academics.module';
import { FeesModule } from './fees/fees.module';
import { HostelModule } from './hostel/hostel.module';
import { CanteenModule } from './canteen/canteen.module';
import { CmsModule } from './cms/cms.module';
import { AdminModule } from './admin/admin.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { ExamsModule } from './exams/exams.module';
import { FacultyModule } from './faculty/faculty.module';
import { HodModule } from './hod/hod.module';
import { ReportsModule } from './reports/reports.module';
import { AppController } from './app.controller';

import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'backend', '.env'),
        path.resolve(__dirname, '..', '.env'),
        path.resolve(__dirname, '..', '..', '.env'),
      ],
    }),
    PrismaModule,
    AuthModule,
    StudentsModule,
    MarksModule,
    AcademicsModule,
    FeesModule,
    HostelModule,
    CanteenModule,
    CmsModule,
    AdminModule,
    ChatbotModule,
    EnterpriseModule,
    ExamsModule,
    FacultyModule,
    HodModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
