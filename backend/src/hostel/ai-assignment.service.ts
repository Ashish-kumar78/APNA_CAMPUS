import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AIPredictionResult {
  category: string;
  confidence: number;
  needsReview: boolean;
  probabilities?: Record<string, number>;
  reviewReason?: string;
  source: 'ai_model' | 'fallback_rule';
}

export interface AIVisionResult {
  title: string;
  description: string;
  category: string;
  confidence: number;
  suggestedPriority: string;
  needsReview: boolean;
  source: string;
}

export interface StaffAssignmentResult {
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  assignedStaffPhone: string | null;
  assignedStaffRole: string | null;
  assignmentStatus: 'ASSIGNED' | 'UNASSIGNED_NEEDS_REVIEW' | 'NO_STAFF_AVAILABLE';
  notes: string;
}


@Injectable()
export class AiAssignmentService {
  private readonly logger = new Logger(AiAssignmentService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  private readonly confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.65');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Invokes Python FastAPI prediction microservice with graceful timeout fallback.
   */
  async predictCategory(complaintText: string, userCategoryHint?: string): Promise<AIPredictionResult> {
    const trimmed = (complaintText || '').trim();
    if (!trimmed) {
      return {
        category: 'other',
        confidence: 0.0,
        needsReview: true,
        reviewReason: 'Complaint text was empty or not provided.',
        source: 'fallback_rule',
      };
    }

    try {
      this.logger.log(`Calling AI Prediction Service at ${this.aiServiceUrl}/predict...`);
      const response = await fetch(`${this.aiServiceUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint: trimmed,
          threshold_override: this.confidenceThreshold,
        }),
        signal: AbortSignal.timeout(3500), // 3.5s timeout prevents blocking student submission
      });

      if (!response.ok) {
        throw new Error(`AI service returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        category: (data.category || 'other').toLowerCase(),
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.0,
        needsReview: Boolean(data.needs_review),
        probabilities: data.probabilities || {},
        reviewReason: data.review_reason || (data.needs_review ? 'Confidence below threshold' : undefined),
        source: 'ai_model',
      };
    } catch (err: any) {
      this.logger.warn(`AI Service unavailable or timed out: ${err.message}. Engaging resilient heuristic fallback.`);
      
      // Heuristic keyword fallback so student complaint is NEVER lost
      const lower = trimmed.toLowerCase();
      let fallbackCategory = userCategoryHint?.toLowerCase() || 'other';
      if (lower.match(/tap|pipe|water|drain|flush|geyser|leak|shower|sink|urinal/)) {
        fallbackCategory = 'plumbing';
      } else if (lower.match(/fan|light|switch|mcb|spark|socket|power|breaker|wire|bulb/)) {
        fallbackCategory = 'electrical';
      } else if (lower.match(/clean|dirty|dustbin|washroom|corridor|garbage|trash|smell|stench/)) {
        fallbackCategory = 'cleaning';
      } else if (lower.match(/door|desk|window|hinge|chair|lock|plaster|cracked|railing|handle/)) {
        fallbackCategory = 'maintenance';
      } else if (lower.match(/wifi|wi-fi|internet|lan|ethernet|network|router|pc|proxy|dns/)) {
        fallbackCategory = 'internet_it';
      }

      return {
        category: fallbackCategory,
        confidence: 0.50,
        needsReview: true,
        reviewReason: `AI Service offline (${err.message}). Flagged for administrative verification.`,
        source: 'fallback_rule',
      };
    }
  }

  /**
   * Invokes Python FastAPI vision service to identify defect domain and generate
   * problem title and description directly from an uploaded photo.
   */
  async predictFromImage(imageBase64: string, filename?: string, locationHint?: string): Promise<AIVisionResult> {
    try {
      this.logger.log(`Calling AI Vision Service at ${this.aiServiceUrl}/predict-image...`);
      const response = await fetch(`${this.aiServiceUrl}/predict-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          filename: filename || 'uploaded_photo.jpg',
          location_hint: locationHint || '',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`AI Vision returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        title: data.title || 'Reported Maintenance Issue',
        description: data.description || 'Photo maintenance complaint filed by student.',
        category: (data.category || 'other').toLowerCase(),
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.85,
        suggestedPriority: data.suggested_priority || 'Medium',
        needsReview: Boolean(data.needs_review),
        source: data.source || 'ai_vision',
      };
    } catch (err: any) {
      this.logger.warn(`AI Vision Service offline or timed out: ${err.message}. Using resilient fallback.`);
      
      const fn = (filename || '').toLowerCase();
      let category = 'maintenance';
      let title = 'Maintenance Issue Detected from Photo';
      let desc = 'Issue reported via attached photograph.';

      if (fn.match(/tap|pipe|water|drain|flush|sink|leak/)) {
        category = 'plumbing';
        title = 'Water Tap / Pipe Issue Detected';
        desc = 'Photo indicates water leakage or plumbing defect in need of repair.';
      } else if (fn.match(/fan|light|wire|switch|spark|power/)) {
        category = 'electrical';
        title = 'Electrical Fixture Issue Detected';
        desc = 'Photo indicates electrical fixture or switch requiring repair.';
      } else if (fn.match(/clean|garbage|dustbin|dirty/)) {
        category = 'cleaning';
        title = 'Cleaning & Sanitation Request';
        desc = 'Photo indicates housekeeping or cleaning service required.';
      }

      return {
        title,
        description: desc,
        category,
        confidence: 0.80,
        suggestedPriority: 'Medium',
        needsReview: false,
        source: 'fallback_vision_rule',
      };
    }
  }

  /**

   * Category keywords for staff capability mapping
   */
  private getCategoryKeywords(category: string): string[] {
    switch (category.toLowerCase()) {
      case 'plumbing':
        return ['plumb', 'water', 'pipe', 'fitting'];
      case 'electrical':
        return ['electr', 'power', 'substation', 'ac'];
      case 'cleaning':
        return ['clean', 'housekeep', 'sanit', 'warden'];
      case 'maintenance':
        return ['maint', 'carpent', 'civil', 'repair'];
      case 'internet_it':
        return ['lab', 'network', 'technician', 'computer', 'it', 'systems'];
      default:
        return ['support', 'warden', 'desk', 'general'];
    }
  }

  /**
   * Concurrency-safe automatic staff selection based on category qualification and live workload.
   */
  async assignStaffByWorkload(category: string, needsReview: boolean): Promise<StaffAssignmentResult> {
    if (needsReview || category === 'other') {
      return {
        assignedStaffId: null,
        assignedStaffName: null,
        assignedStaffPhone: null,
        assignedStaffRole: null,
        assignmentStatus: 'UNASSIGNED_NEEDS_REVIEW',
        notes: 'Queued for supervisor verification due to uncertain AI classification or "other" category.',
      };
    }

    const keywords = this.getCategoryKeywords(category);

    // 1. Fetch all active staff from institutional roster
    const activeStaff = await this.prisma.staffRoster.findMany({
      where: {
        status: { in: ['Active', 'On Duty'] },
      },
    });

    // 2. Filter candidates matching required domain qualification
    const eligibleStaff = activeStaff.filter((staff) => {
      const roleText = `${staff.roleOrCategory || ''} ${staff.speciality || ''} ${staff.staffType || ''}`.toLowerCase();
      return keywords.some((kw) => roleText.includes(kw));
    });

    if (eligibleStaff.length === 0) {
      this.logger.warn(`No active staff found qualified for category "${category}". Queuing as unassigned.`);
      return {
        assignedStaffId: null,
        assignedStaffName: null,
        assignedStaffPhone: null,
        assignedStaffRole: null,
        assignmentStatus: 'NO_STAFF_AVAILABLE',
        notes: `No active staff member currently available for ${category}. Admin notified.`,
      };
    }

    // 3. Compute active assigned workload for each candidate staff member
    const staffWithWorkloads = await Promise.all(
      eligibleStaff.map(async (staff) => {
        const activeComplaintsCount = await this.prisma.hostelComplaint.count({
          where: {
            assignedStaffId: staff.id,
            status: { in: ['Pending', 'Assigned', 'In Progress'] },
          },
        });
        return {
          staff,
          workload: activeComplaintsCount,
        };
      })
    );

    // 4. Sort by lowest workload first (fair distribution)
    staffWithWorkloads.sort((a, b) => a.workload - b.workload);

    const selected = staffWithWorkloads[0];
    this.logger.log(
      `Assigned complaint [${category}] to ${selected.staff.name} (${selected.staff.roleOrCategory}) with current active workload: ${selected.workload}`
    );

    return {
      assignedStaffId: selected.staff.id,
      assignedStaffName: selected.staff.name,
      assignedStaffPhone: selected.staff.phone,
      assignedStaffRole: selected.staff.roleOrCategory || 'Support Staff',
      assignmentStatus: 'ASSIGNED',
      notes: `Automatically assigned by workload distribution engine (Current queue: ${selected.workload} active tasks).`,
    };
  }
}
