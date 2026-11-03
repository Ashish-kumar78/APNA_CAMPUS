import MarksManagementModule from '../marks/MarksManagementModule'

export default function MarksPage({ initialRole = 'teacher', currentStudentId, student, account }) {
  return <MarksManagementModule initialRole={initialRole} currentStudentId={currentStudentId} student={student} account={account} />
}
