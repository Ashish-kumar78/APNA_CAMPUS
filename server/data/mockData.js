// This legacy Express example has no user accounts. The canonical authentication
// and user store are provided by the NestJS backend and MongoDB Atlas.
export function findUserByEmail(_email) {
  return undefined;
}

export function listUsers() {
  return [];
}

export const dashboardData = {
  student: {
    name: 'Aarav Sharma',
    studentId: 'CF-2025-1184',
    cgpa: 8.79,
    attendance: 92.5,
    pendingFees: 18950,
    currentSemester: 5,
    notices: [
      { title: 'Semester registration window', category: 'Academic' },
      { title: 'Placement drive on 12 Oct', category: 'Placement' },
    ],
  },
  admin: {
    totalStudents: 12450,
    totalFaculty: 580,
    attendance: 91.4,
    feesCollected: '₹7.4 Cr',
    pendingFees: '₹29.5 Lakh',
    placementOffers: 412,
  },
};
