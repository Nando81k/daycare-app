import { TeacherMessagesPageView } from "@/components/teacher/teacher-messages-page"
import { getTeacherMessagesData } from "@/lib/dal/teacher"

export default async function TeacherMessagesPage() {
  const data = await getTeacherMessagesData()

  return (
    <TeacherMessagesPageView
      classroomName={data.classroomName}
      threads={data.threads}
      families={data.families}
    />
  )
}
