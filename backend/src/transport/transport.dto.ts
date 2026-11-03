import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  busNumber!: string;

  @IsString()
  @IsNotEmpty()
  fleetCode!: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  driver?: string;

  @IsString()
  @IsOptional()
  driverPhone?: string;

  @IsString()
  @IsOptional()
  routeName?: string;

  @IsString()
  @IsOptional()
  depot?: string;

  @IsString()
  @IsOptional()
  fuelType?: string;

  @IsString()
  @IsOptional()
  fitnessExpiry?: string;

  @IsString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  odometerKm?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  busNumber?: string;

  @IsString()
  @IsOptional()
  fleetCode?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  driver?: string;

  @IsString()
  @IsOptional()
  driverPhone?: string;

  @IsString()
  @IsOptional()
  routeName?: string;

  @IsString()
  @IsOptional()
  depot?: string;

  @IsString()
  @IsOptional()
  fuelType?: string;

  @IsString()
  @IsOptional()
  fitnessExpiry?: string;

  @IsString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  odometerKm?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVehicleStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @IsString()
  @IsOptional()
  licenseExpiry?: string;

  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @IsString()
  @IsOptional()
  assignedBus?: string;

  @IsString()
  @IsOptional()
  shift?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseCategory?: string;

  @IsString()
  @IsOptional()
  licenseExpiry?: string;

  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @IsString()
  @IsOptional()
  assignedBus?: string;

  @IsString()
  @IsOptional()
  shift?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  routeNumber?: string;

  @IsString()
  @IsOptional()
  morningDeparture?: string;

  @IsString()
  @IsOptional()
  eveningArrival?: string;

  @IsOptional()
  stops?: any; // String or Array

  @IsNumber()
  @IsOptional()
  farePerSemester?: number;

  @IsString()
  @IsOptional()
  busNumber?: string;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  driverContact?: string;

  @IsNumber()
  @IsOptional()
  totalCapacity?: number;
}

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  routeNumber?: string;

  @IsString()
  @IsOptional()
  morningDeparture?: string;

  @IsString()
  @IsOptional()
  eveningArrival?: string;

  @IsOptional()
  stops?: any;

  @IsNumber()
  @IsOptional()
  farePerSemester?: number;

  @IsString()
  @IsOptional()
  busNumber?: string;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  driverContact?: string;

  @IsNumber()
  @IsOptional()
  totalCapacity?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  disruptionNote?: string;
}

export class UpdateRouteDisruptionDto {
  @IsString()
  @IsOptional()
  disruptionNote?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class AllocatePassDto {
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @IsString()
  @IsNotEmpty()
  regNo!: string;

  @IsString()
  @IsOptional()
  rollNumber?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  semester?: string;

  @IsString()
  @IsNotEmpty()
  routeName!: string;

  @IsString()
  @IsNotEmpty()
  stopName!: string;

  @IsNumber()
  @IsOptional()
  fareAmount?: number;

  @IsBoolean()
  @IsOptional()
  feePaid?: boolean;

  @IsBoolean()
  @IsOptional()
  autoApprove?: boolean;
}

export class ActionPassDto {
  @IsString()
  @IsNotEmpty()
  action!: string; // 'approve' | 'cancel' | 'expire' | 'renew'

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  tripName!: string;

  @IsString()
  @IsOptional()
  routeNumber?: string;

  @IsString()
  @IsNotEmpty()
  routeName!: string;

  @IsString()
  @IsNotEmpty()
  busNumber!: string;

  @IsString()
  @IsNotEmpty()
  driverName!: string;

  @IsString()
  @IsOptional()
  shift?: string;

  @IsString()
  @IsNotEmpty()
  departureTime!: string;

  @IsString()
  @IsOptional()
  estimatedArrival?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  passengersCount?: number;

  @IsString()
  @IsOptional()
  date?: string;
}

export class ActionTripDto {
  @IsString()
  @IsNotEmpty()
  action!: string; // 'start' | 'complete' | 'delay' | 'cancel'

  @IsNumber()
  @IsOptional()
  delayMinutes?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  busNumber!: string;

  @IsString()
  @IsOptional()
  fleetCode?: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  serviceProvider?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  nextServiceDue?: string;

  @IsNumber()
  @IsOptional()
  odometerKm?: number;
}

export class CreateFuelLogDto {
  @IsString()
  @IsNotEmpty()
  busNumber!: string;

  @IsString()
  @IsOptional()
  fleetCode?: string;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  fuelType?: string;

  @IsNumber()
  @IsNotEmpty()
  quantityLitres!: number;

  @IsNumber()
  @IsNotEmpty()
  pricePerLitre!: number;

  @IsNumber()
  @IsOptional()
  totalCost?: number;

  @IsNumber()
  @IsOptional()
  odometerKm?: number;

  @IsString()
  @IsOptional()
  bunkName?: string;

  @IsString()
  @IsOptional()
  receiptNo?: string;

  @IsString()
  @IsOptional()
  date?: string;
}

export class CreateFeeRecordDto {
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @IsString()
  @IsNotEmpty()
  routeName!: string;

  @IsString()
  @IsNotEmpty()
  semester!: string;

  @IsNumber()
  @IsNotEmpty()
  feeAmount!: number;

  @IsNumber()
  @IsOptional()
  paidAmount?: number;

  @IsString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  receiptNo?: string;
}

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @IsString()
  @IsNotEmpty()
  routeName!: string;

  @IsString()
  @IsOptional()
  busNumber?: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class CreateAccidentDto {
  @IsString()
  @IsNotEmpty()
  busNumber!: string;

  @IsString()
  @IsOptional()
  routeName?: string;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  immediateResponse?: string;

  @IsString()
  @IsOptional()
  emergencyAssistance?: string;
}

export class CreateParkingDto {
  @IsString()
  @IsNotEmpty()
  bayNumber!: string;

  @IsString()
  @IsOptional()
  busNumber?: string;

  @IsString()
  @IsOptional()
  fleetCode?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  assignedDriver?: string;

  @IsBoolean()
  @IsOptional()
  plugInCharging?: boolean;
}

export class CreateStaffAttendanceDto {
  @IsString()
  @IsNotEmpty()
  staffName!: string;

  @IsString()
  @IsNotEmpty()
  designation!: string;

  @IsString()
  @IsOptional()
  assignedBus?: string;

  @IsString()
  @IsNotEmpty()
  shift!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsOptional()
  date?: string;
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  targetGroup!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  author?: string;
}

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  studentName!: string;

  @IsString()
  @IsNotEmpty()
  rollNumber!: string;

  @IsString()
  @IsOptional()
  currentRoute?: string;

  @IsString()
  @IsOptional()
  requestedRoute?: string;

  @IsString()
  @IsOptional()
  requestedStop?: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ActionRequestDto {
  @IsString()
  @IsNotEmpty()
  decision!: string; // 'Approved' | 'Rejected'

  @IsString()
  @IsOptional()
  reviewNotes?: string;
}

export class CreateSafetyInspectionDto {
  @IsString()
  @IsNotEmpty()
  busNumber!: string;

  @IsString()
  @IsOptional()
  fleetCode?: string;

  @IsString()
  @IsNotEmpty()
  inspector!: string;

  @IsString()
  @IsOptional()
  score?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  findings?: string;

  @IsOptional()
  checklist?: any;
}

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  routesActive!: string;

  @IsNumber()
  @IsOptional()
  busesDeployed?: number;

  @IsNumber()
  @IsOptional()
  studentsTransported?: number;

  @IsString()
  @IsNotEmpty()
  frequency!: string;
}

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  @IsNotEmpty()
  inStock!: number;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  unitCost?: number;

  @IsString()
  @IsOptional()
  supplier?: string;
}

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsString()
  @IsNotEmpty()
  section!: string;

  @IsBoolean()
  @IsOptional()
  canView?: boolean;

  @IsBoolean()
  @IsOptional()
  canCreate?: boolean;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean;

  @IsBoolean()
  @IsOptional()
  canUpdate?: boolean;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean;

  @IsBoolean()
  @IsOptional()
  canExport?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageSettings?: boolean;
}
