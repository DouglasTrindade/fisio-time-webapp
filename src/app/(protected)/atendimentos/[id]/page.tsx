import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AttendancesShow } from "./_components"

const getAttendance = async (id: string) => {
  return prisma.attendance.findUnique({
    where: { id },
    include: {
      patient: true,
      professional: {
        select: { id: true, name: true },
      },
    },
  })
}

const AttendancesShowPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const attendance = await getAttendance(id)

  if (!attendance) {
    notFound()
  }

  return <AttendancesShow attendance={attendance} />
}

export default AttendancesShowPage
