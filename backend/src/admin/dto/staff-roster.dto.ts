import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStaffRosterDto {
  @ApiPropertyOptional({ description: 'Staff category (WARDEN, SECURITY, CANTEEN, SUPPORT, OTHER)', example: 'WARDEN' })
  @IsString()
  @IsOptional()
  staffType?: string;

  @ApiPropertyOptional({ description: 'Staff category alias (warden, security, canteen, support)', example: 'warden' })
  @IsString()
  @IsOptional()
  roleCategory?: string;

  @ApiProperty({ description: 'Full staff name', example: 'Rajesh Kumar Jena' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'Male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Role or job category', example: 'Chief Hostel Warden' })
  @IsString()
  @IsOptional()
  roleOrCategory?: string;

  @ApiPropertyOptional({ description: 'Canteen outlet or maintenance zone', example: 'Central Food Court' })
  @IsString()
  @IsOptional()
  outletOrZone?: string;

  @ApiPropertyOptional({ description: 'Assigned hostel or security gate post', example: 'Gandhi Boys Residence (Hostel 1)' })
  @IsString()
  @IsOptional()
  assignedHostelOrPost?: string;

  @ApiPropertyOptional({ description: 'Assigned area alias', example: 'Boys Hostel Block A' })
  @IsString()
  @IsOptional()
  assignedArea?: string;

  @ApiPropertyOptional({ description: 'Office room or desk location', example: 'Ground Floor, Warden Office A-01' })
  @IsString()
  @IsOptional()
  roomOffice?: string;

  @ApiPropertyOptional({ description: 'Phone contact', example: '+91 94370 11223' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'warden.rajesh@apnacampus.edu.in' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Duty shift schedule', example: '24x7 Resident Duty' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Security badge number or staff ID', example: 'SG-OD-4421' })
  @IsString()
  @IsOptional()
  badgeNumber?: string;

  @ApiPropertyOptional({ description: 'FSSAI License number for canteen staff', example: 'FSSAI-OD-2024-9981' })
  @IsString()
  @IsOptional()
  fssaiLicense?: string;

  @ApiPropertyOptional({ description: 'Emergency contact telephone', example: '+91 98610 88210' })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Speciality / Culinary or Maintenance expertise', example: 'Special Meals, Hygiene & Nutrition' })
  @IsString()
  @IsOptional()
  speciality?: string;

  @ApiPropertyOptional({ description: 'Vocational or academic qualification', example: 'ITI Electrical / Certified' })
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional({ description: 'Assigned external agency if contract staff', example: 'Falcon Security Services' })
  @IsString()
  @IsOptional()
  agencyCompany?: string;

  @ApiPropertyOptional({ description: 'Assigned agency alias' })
  @IsString()
  @IsOptional()
  assignedAgency?: string;

  @ApiPropertyOptional({ description: 'Hostel category (Boys Hostel / Girls Hostel)', example: 'Boys Hostel' })
  @IsString()
  @IsOptional()
  hostelCategory?: string;

  @ApiPropertyOptional({ description: 'Staff status', example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Blood group', example: 'B+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ description: 'Hostel residents count', example: 120 })
  @IsOptional()
  residentsCount?: number;

  @ApiPropertyOptional({ description: 'Total beds in hostel', example: 150 })
  @IsOptional()
  totalBeds?: number;

  @ApiPropertyOptional({ description: 'Joining year', example: '2023' })
  @IsString()
  @IsOptional()
  joiningYear?: string;
}

export class UpdateStaffRosterDto {
  @ApiPropertyOptional({ description: 'Staff category (WARDEN, SECURITY, CANTEEN, SUPPORT, OTHER)', example: 'WARDEN' })
  @IsString()
  @IsOptional()
  staffType?: string;

  @ApiPropertyOptional({ description: 'Full staff name', example: 'Rajesh Kumar Jena' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'Male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Role or job category', example: 'Chief Hostel Warden' })
  @IsString()
  @IsOptional()
  roleOrCategory?: string;

  @ApiPropertyOptional({ description: 'Canteen outlet or maintenance zone', example: 'Central Food Court' })
  @IsString()
  @IsOptional()
  outletOrZone?: string;

  @ApiPropertyOptional({ description: 'Assigned hostel or security gate post', example: 'Gandhi Boys Residence (Hostel 1)' })
  @IsString()
  @IsOptional()
  assignedHostelOrPost?: string;

  @ApiPropertyOptional({ description: 'Assigned area alias', example: 'Boys Hostel Block A' })
  @IsString()
  @IsOptional()
  assignedArea?: string;

  @ApiPropertyOptional({ description: 'Office room or desk location', example: 'Ground Floor, Warden Office A-01' })
  @IsString()
  @IsOptional()
  roomOffice?: string;

  @ApiPropertyOptional({ description: 'Phone contact', example: '+91 94370 11223' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'warden.rajesh@apnacampus.edu.in' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Duty shift schedule', example: '24x7 Resident Duty' })
  @IsString()
  @IsOptional()
  shift?: string;

  @ApiPropertyOptional({ description: 'Security badge number or staff ID', example: 'SG-OD-4421' })
  @IsString()
  @IsOptional()
  badgeNumber?: string;

  @ApiPropertyOptional({ description: 'FSSAI License number for canteen staff', example: 'FSSAI-OD-2024-9981' })
  @IsString()
  @IsOptional()
  fssaiLicense?: string;

  @ApiPropertyOptional({ description: 'Emergency contact telephone', example: '+91 98610 88210' })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Speciality / Culinary or Maintenance expertise', example: 'Special Meals, Hygiene & Nutrition' })
  @IsString()
  @IsOptional()
  speciality?: string;

  @ApiPropertyOptional({ description: 'Vocational or academic qualification', example: 'ITI Electrical / Certified' })
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional({ description: 'Assigned external agency if contract staff', example: 'Falcon Security Services' })
  @IsString()
  @IsOptional()
  agencyCompany?: string;

  @ApiPropertyOptional({ description: 'Assigned agency alias' })
  @IsString()
  @IsOptional()
  assignedAgency?: string;

  @ApiPropertyOptional({ description: 'Hostel category (Boys Hostel / Girls Hostel)', example: 'Boys Hostel' })
  @IsString()
  @IsOptional()
  hostelCategory?: string;

  @ApiPropertyOptional({ description: 'Active duty status (Active, On-Leave, Inactive)', example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Blood group', example: 'B+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ description: 'Hostel residents count', example: 120 })
  @IsOptional()
  residentsCount?: number;

  @ApiPropertyOptional({ description: 'Total beds in hostel', example: 150 })
  @IsOptional()
  totalBeds?: number;

  @ApiPropertyOptional({ description: 'Joining year', example: '2023' })
  @IsString()
  @IsOptional()
  joiningYear?: string;
}
