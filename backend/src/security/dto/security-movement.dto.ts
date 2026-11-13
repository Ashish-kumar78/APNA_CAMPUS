import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanGatePassDto {
  @ApiPropertyOptional({ description: 'Scanned digital QR code string', example: 'BPUT-GP-2026-1039-PRIYA-PATRA-APPROVED' })
  @IsString()
  @IsOptional()
  qrCode?: string;

  @ApiPropertyOptional({ description: 'Student roll number for manual lookup', example: '01' })
  @IsString()
  @IsOptional()
  rollNumber?: string;

  @ApiPropertyOptional({ description: 'Pass ID for manual lookup', example: 'GP-2026-1042' })
  @IsString()
  @IsOptional()
  passId?: string;
}

export class RecordMovementDto {
  @ApiProperty({ description: 'Unique Pass ID or WorkflowRequest ID', example: 'GP-2026-1039' })
  @IsString()
  @IsNotEmpty()
  passId!: string;

  @ApiProperty({ description: 'Student Roll Number', example: '02' })
  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @ApiProperty({ description: 'Movement direction (EXIT or ENTRY)', example: 'EXIT', enum: ['EXIT', 'ENTRY'] })
  @IsEnum(['EXIT', 'ENTRY'])
  @IsNotEmpty()
  direction!: 'EXIT' | 'ENTRY';

  @ApiPropertyOptional({ description: 'Gate checkpoint name', example: 'Main Campus Gate 1' })
  @IsString()
  @IsOptional()
  gateName?: string;

  @ApiPropertyOptional({ description: 'Duty Security Guard ID', example: 'SEC-101' })
  @IsString()
  @IsOptional()
  guardId?: string;

  @ApiPropertyOptional({ description: 'Duty Security Guard Name', example: 'Dillip Kumar Pradhan' })
  @IsString()
  @IsOptional()
  guardName?: string;

  @ApiPropertyOptional({ description: 'Guard observation remarks', example: 'Luggage inspected. Exited via turnstile 2.' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Student Full Name' })
  @IsString()
  @IsOptional()
  studentName?: string;

  @ApiPropertyOptional({ description: 'Unique UUID for offline queue synchronization deduplication' })
  @IsString()
  @IsOptional()
  offlineSyncId?: string;
}

export class WalkInVisitorDto {
  @ApiProperty({ description: 'Full name of visitor', example: 'Mr. Ramesh Nayak' })
  @IsString()
  @IsNotEmpty()
  visitorName!: string;

  @ApiProperty({ description: 'Relation to student', example: 'Father' })
  @IsString()
  @IsNotEmpty()
  relation!: string;

  @ApiProperty({ description: 'Host student full name', example: 'Rakesh Das' })
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @ApiProperty({ description: 'Host student roll number', example: '01' })
  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @ApiProperty({ description: 'Visit purpose', example: 'Delivering study material and prescription medications' })
  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @ApiPropertyOptional({ description: 'Visitor phone number', example: '+91 94370 12345' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Government ID proof number', example: 'XXXX-XXXX-9842' })
  @IsString()
  @IsOptional()
  idProofNumber?: string;

  @ApiPropertyOptional({ description: 'Physical gate pass badge issued', example: 'BADGE-V-14' })
  @IsString()
  @IsOptional()
  badgeNumber?: string;

  @ApiPropertyOptional({ description: 'Gate checkpoint', example: 'Gate 1' })
  @IsString()
  @IsOptional()
  gateNumber?: string;

  @ApiPropertyOptional({ description: 'Require live host student approval before entry' })
  @IsOptional()
  requiresStudentApproval?: boolean;
}

export class VerifyVisitorCodeDto {
  @ApiProperty({ description: '6-digit pre-approved visitor entry code', example: '782914' })
  @IsString()
  @IsNotEmpty()
  verificationCode!: string;
}

export class ReportSecurityIncidentDto {
  @ApiProperty({ description: 'Incident title', example: 'Unauthorized Exit Attempt Without Approved Outpass' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Affected Student Roll Number', example: '01' })
  @IsString()
  @IsOptional()
  affectedRollNumber?: string;

  @ApiPropertyOptional({ description: 'Student Name', example: 'Rakesh Das' })
  @IsString()
  @IsOptional()
  studentName?: string;

  @ApiPropertyOptional({ description: 'Hostel Name', example: 'Gandhi Boys Residence' })
  @IsString()
  @IsOptional()
  hostelName?: string;

  @ApiPropertyOptional({ description: 'Incident Category', example: 'Gate Perimeter Breach' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Detailed guard statement of incident' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ description: 'Incident severity level', example: 'high', enum: ['low', 'medium', 'high', 'critical'] })
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiPropertyOptional({ description: 'Gate checkpoint where incident occurred', example: 'Main Campus Gate 1' })
  @IsString()
  @IsOptional()
  gateName?: string;
}

export class SyncOfflineQueueDto {
  @ApiProperty({ description: 'Array of queued physical movements recorded offline' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordMovementDto)
  movements!: RecordMovementDto[];
}

export class GenerateDynamicQrDto {
  @ApiPropertyOptional({ description: 'User ID for QR identity' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Role (STUDENT, FACULTY, STAFF, etc.)' })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({ description: 'Identity type' })
  @IsString()
  @IsOptional()
  identityType?: string;

  @ApiPropertyOptional({ description: 'Roll or Employee ID' })
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiPropertyOptional({ description: 'Full Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Department or Branch' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Designation or Job Title' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ description: 'Hostel Name' })
  @IsString()
  @IsOptional()
  hostelName?: string;

  @ApiPropertyOptional({ description: 'Room Number' })
  @IsString()
  @IsOptional()
  roomNumber?: string;
}

export class VerifyDynamicQrDto {
  @ApiProperty({ description: '10-second Dynamic QR token string' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiPropertyOptional({ description: 'Gate checkpoint ID or code' })
  @IsString()
  @IsOptional()
  checkpointId?: string;

  @ApiPropertyOptional({ description: 'Gate name' })
  @IsString()
  @IsOptional()
  gateName?: string;

  @ApiPropertyOptional({ description: 'Gate type (MAIN_CAMPUS or HOSTEL_GATE)' })
  @IsString()
  @IsOptional()
  gateType?: 'MAIN_CAMPUS' | 'HOSTEL_GATE' | 'ENGINEERING_BLOCK' | 'ACADEMIC_BLOCK' | 'PERIMETER';

  @ApiPropertyOptional({ description: 'Movement direction (ENTRY or EXIT or AUTO)' })
  @IsString()
  @IsOptional()
  direction?: 'ENTRY' | 'EXIT' | 'AUTO';

  @ApiPropertyOptional({ description: 'Guard remarks' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class StudentMovementRequestDto {
  @ApiProperty({ description: 'Movement type (ROUTINE_ENTRY, ROUTINE_EXIT, DAY_OUT, LEAVE, OVERNIGHT_LEAVE, LATE_RETURN, EMERGENCY_LEAVE)' })
  @IsString()
  @IsNotEmpty()
  movementType!: string;

  @ApiProperty({ description: 'Reason for departure/movement' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiProperty({ description: 'Destination' })
  @IsString()
  @IsNotEmpty()
  destination!: string;

  @ApiProperty({ description: 'Expected departure datetime ISO string' })
  @IsString()
  @IsNotEmpty()
  outDateTime!: string;

  @ApiProperty({ description: 'Expected return datetime ISO string' })
  @IsString()
  @IsNotEmpty()
  expectedInDateTime!: string;

  @ApiPropertyOptional({ description: 'Parent approval requirement flag' })
  @IsOptional()
  parentApprovalRequired?: boolean;

  @ApiPropertyOptional({ description: 'Hostel Name' })
  @IsString()
  @IsOptional()
  hostelName?: string;

  @ApiPropertyOptional({ description: 'Room Number' })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Student Name' })
  @IsString()
  @IsOptional()
  studentName?: string;

  @ApiPropertyOptional({ description: 'Student Roll Number' })
  @IsString()
  @IsOptional()
  studentRoll?: string;
}

export class InviteVisitorDto {
  @ApiProperty({ description: 'Visitor full name' })
  @IsString()
  @IsNotEmpty()
  visitorName!: string;

  @ApiProperty({ description: 'Relation to student or staff' })
  @IsString()
  @IsNotEmpty()
  relation!: string;

  @ApiProperty({ description: 'Purpose of visit' })
  @IsString()
  @IsNotEmpty()
  purpose!: string;

  @ApiPropertyOptional({ description: 'Visitor phone' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Expected visit date & time' })
  @IsString()
  @IsOptional()
  expectedArrival?: string;

  @ApiPropertyOptional({ description: 'Expected visit date' })
  @IsString()
  @IsOptional()
  expectedVisitDate?: string;

  @ApiPropertyOptional({ description: 'Expected arrival time' })
  @IsString()
  @IsOptional()
  expectedArrivalTime?: string;

  @ApiPropertyOptional({ description: 'Expected departure time' })
  @IsString()
  @IsOptional()
  expectedDepartureTime?: string;

  @ApiPropertyOptional({ description: 'Number of accompanying visitors' })
  @IsOptional()
  numberOfVisitors?: number;

  @ApiPropertyOptional({ description: 'ID verification status' })
  @IsString()
  @IsOptional()
  idVerificationStatus?: string;
}

export class ShiftHandoverAckDto {
  @ApiProperty({ description: 'Shift code or handover ID' })
  @IsString()
  @IsNotEmpty()
  shiftCode!: string;

  @ApiProperty({ description: 'Incoming Guard ID' })
  @IsString()
  @IsNotEmpty()
  incomingGuardId!: string;

  @ApiProperty({ description: 'Incoming Guard Name' })
  @IsString()
  @IsNotEmpty()
  incomingGuardName!: string;

  @ApiPropertyOptional({ description: 'Handover remarks or checklist confirmation' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CorrectSecurityRecordDto {
  @ApiProperty({ description: 'Unique identifier of the record to correct', example: 'mov-1001' })
  @IsString()
  @IsNotEmpty()
  recordId!: string;

  @ApiProperty({ description: 'Type of security record', enum: ['MOVEMENT', 'PASS', 'VISITOR', 'INCIDENT'], example: 'MOVEMENT' })
  @IsString()
  @IsNotEmpty()
  recordType!: 'MOVEMENT' | 'PASS' | 'VISITOR' | 'INCIDENT';

  @ApiProperty({ description: 'Field to correct', example: 'gateName' })
  @IsString()
  @IsNotEmpty()
  fieldToCorrect!: string;

  @ApiPropertyOptional({ description: 'Current or old value before correction', example: 'Main Campus Gate 1' })
  @IsString()
  @IsOptional()
  oldValue?: string;

  @ApiProperty({ description: 'New corrected value', example: 'Hostel Complex Gate 2' })
  @IsString()
  @IsNotEmpty()
  newValue!: string;

  @ApiProperty({ description: 'Mandatory reason and explanation for the record correction', example: 'Optical barrier turnstile 2 logged wrong gate assignment due to physical sensor mis-sync' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}



