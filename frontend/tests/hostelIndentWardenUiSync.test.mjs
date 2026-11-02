import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('Testing Warden and Admin Indent UI Modernization...');

const hostelInventorySectionPath = path.resolve('frontend/src/components/hostel/HostelInventorySection.jsx');
const wardenInventoryReqPath = path.resolve('frontend/src/components/hostel/WardenInventoryRequisition.jsx');
const cssPath = path.resolve('frontend/src/components/hostel/HostelIndentSection.css');

assert.ok(fs.existsSync(hostelInventorySectionPath), 'HostelInventorySection.jsx must exist');
assert.ok(fs.existsSync(wardenInventoryReqPath), 'WardenInventoryRequisition.jsx must exist');
assert.ok(fs.existsSync(cssPath), 'HostelIndentSection.css must exist');

const hostelInventoryContent = fs.readFileSync(hostelInventorySectionPath, 'utf8');
const wardenInventoryContent = fs.readFileSync(wardenInventoryReqPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 1. Verify HostelInventorySection.jsx role adaptability and modern elements
assert.ok(
  hostelInventoryContent.includes('Hostel Warden (Requisitioner)'),
  'HostelInventorySection must support Hostel Warden (Requisitioner) role pill badge'
);
assert.ok(
  hostelInventoryContent.includes('Hostel Admin (Sanction Authority)'),
  'HostelInventorySection must support Hostel Admin (Sanction Authority) role pill badge'
);
assert.ok(
  hostelInventoryContent.includes('indent-hero-banner'),
  'HostelInventorySection must have indent-hero-banner'
);
assert.ok(
  hostelInventoryContent.includes('indent-kpi-grid'),
  'HostelInventorySection must have indent-kpi-grid'
);
assert.ok(
  hostelInventoryContent.includes('indent-alert-banner'),
  'HostelInventorySection must have indent-alert-banner'
);
assert.ok(
  hostelInventoryContent.includes('indent-toolbar-card'),
  'HostelInventorySection must have indent-toolbar-card'
);
assert.ok(
  hostelInventoryContent.includes('indent-btn-action-primary') && hostelInventoryContent.includes('Raise Indent'),
  'HostelInventorySection must have Raise Indent action button'
);
assert.ok(
  hostelInventoryContent.includes('PDF Export'),
  'HostelInventorySection must have PDF export button'
);
assert.ok(
  hostelInventoryContent.includes('Excel Export'),
  'HostelInventorySection must have Excel export button'
);

// 2. Verify WardenInventoryRequisition.jsx modernization in Tab 3 (my-requests)
assert.ok(
  wardenInventoryContent.includes('indent-hero-banner'),
  'WardenInventoryRequisition Tab 3 must use modern indent-hero-banner'
);
assert.ok(
  wardenInventoryContent.includes('indent-kpi-grid'),
  'WardenInventoryRequisition Tab 3 must use modern indent-kpi-grid'
);
assert.ok(
  wardenInventoryContent.includes('indent-alert-banner'),
  'WardenInventoryRequisition Tab 3 must use modern indent-alert-banner'
);
assert.ok(
  wardenInventoryContent.includes('indent-toolbar-card'),
  'WardenInventoryRequisition Tab 3 must use modern indent-toolbar-card'
);
assert.ok(
  wardenInventoryContent.includes('indent-table-container-modern'),
  'WardenInventoryRequisition Tab 3 must use indent-table-container-modern'
);
assert.ok(
  wardenInventoryContent.includes('indent-data-table-modern'),
  'WardenInventoryRequisition Tab 3 must use indent-data-table-modern'
);
assert.ok(
  wardenInventoryContent.includes('Hostel Warden (Requisitioner)'),
  'WardenInventoryRequisition Tab 3 must have Hostel Warden (Requisitioner) badge'
);

// 3. Verify CSS rules
assert.ok(
  cssContent.includes('.indent-table-container-modern'),
  'CSS must include .indent-table-container-modern'
);
assert.ok(
  cssContent.includes('.indent-data-table-modern'),
  'CSS must include .indent-data-table-modern'
);
assert.ok(
  cssContent.includes('.indent-hero-badge.warden'),
  'CSS must style .indent-hero-badge.warden'
);

console.log('✓ All Warden and Admin Indent UI modernization checks passed successfully!');
