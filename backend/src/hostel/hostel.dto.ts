import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AllocateHostelBedDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  studentRoll!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  hostelName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  roomNumber!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  bedNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  floor?: string;
}

export class TransferHostelBedDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  studentRoll!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  newHostelName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  newRoomNumber!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  newBedNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  newFloor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  transferReason?: string;
}

export class VacateHostelBedDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  studentRoll!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class LodgeHostelComplaintDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Plumbing', 'Electrical', 'Cleaning', 'Furniture', 'Civil', 'Network', 'Other'])
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Low', 'Medium', 'High', 'Urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7 * 1024 * 1024)
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;
}

export class CreateGatePassDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  purposeType!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(240)
  destination!: string;

  @IsDateString()
  outDateTime!: string;

  @IsDateString()
  inDateTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  emergencyContact?: string;
}

export class ActionGatePassDto {
  @IsIn(['APPROVE', 'REJECT', 'RECORD_EXIT', 'RECORD_RETURN'])
  action!: 'APPROVE' | 'REJECT' | 'RECORD_EXIT' | 'RECORD_RETURN';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class IssueHostelVisitorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  visitorName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  relation!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  rollNumber!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(500)
  purpose!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  inTime?: string;
}

export class CheckInHostelVisitorDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  badgeNumber?: string;
}

export class UpdateHostelComplaintDto {
  @IsIn(['Pending', 'Assigned', 'Needs Review', 'In Progress', 'Resolved', 'Rejected', 'Closed'])
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  assignedStaff?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  assignedStaffId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolutionNotes?: string;
}
