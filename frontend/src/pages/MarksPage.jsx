import MarksManagementModule from '../marks/MarksManagementModule'

export default function MarksPage({ initialRole = 'teacher', currentStudentId }) {
  return <MarksManagementModule initialRole={initialRole} currentStudentId={currentStudentId} />
}
