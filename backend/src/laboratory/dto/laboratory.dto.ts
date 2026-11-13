import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, Min } from 'class-validator';

export class CreateRequisitionDto {
  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsString()
  @IsNotEmpty()
  labCode!: string;

  @IsString()
  @IsNotEmpty()
  equipmentName!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(1)
  requestedQuantity!: number;

  @IsNumber()
  @IsOptional()
  estimatedCost?: number;

  @IsString()
  @IsOptional()
  @IsIn(['Low', 'Normal', 'High', 'Critical'])
  urgency?: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ReviewRequisitionDto {
  @IsString()
  @IsIn(['APPROVE', 'REJECT'])
  action!: 'APPROVE' | 'REJECT';

  @IsString()
  @IsOptional()
  adminRemarks?: string;
}

export class IssueStockDto {
  @IsNumber()
  @Min(1)
  issuedQuantity!: number;

  @IsString()
  @IsOptional()
  adminRemarks?: string;
}

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsString()
  @IsNotEmpty()
  labCode!: string;

  @IsString()
  @IsOptional()
  equipmentCode?: string;

  @IsString()
  @IsNotEmpty()
  equipmentName!: string;

  @IsString()
  @IsNotEmpty()
  issueType!: string;

  @IsString()
  @IsOptional()
  @IsIn(['Low', 'Medium', 'High', 'Critical'])
  priority?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class ReviewComplaintDto {
  @IsString()
  @IsIn(['APPROVE', 'REJECT'])
  action!: 'APPROVE' | 'REJECT';

  @IsString()
  @IsOptional()
  assignedTechnician?: string;

  @IsString()
  @IsOptional()
  adminRemarks?: string;
}

export class UpdateWorkOrderDto {
  @IsString()
  @IsIn(['In Progress', 'Waiting for Parts', 'Completed', 'Closed'])
  status!: 'In Progress' | 'Waiting for Parts' | 'Completed' | 'Closed';

  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}

export class RecordPracticalAttendanceDto {
  @IsNumber()
  @Min(0)
  presentStudents!: number;

  @IsOptional()
  presentRollNumbers?: string[];
}

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  equipmentCode!: string;

  @IsString()
  @IsNotEmpty()
  equipmentName!: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsString()
  @IsNotEmpty()
  labCode!: string;

  @IsString()
  @IsOptional()
  labName?: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  purchaseInfo?: string;
}

export class UpdateEquipmentDto {
  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  availableQuantity?: number;

  @IsNumber()
  @IsOptional()
  issuedQuantity?: number;

  @IsString()
  @IsOptional()
  lastServiced?: string;
}
