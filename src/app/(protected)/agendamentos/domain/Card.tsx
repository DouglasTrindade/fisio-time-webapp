import { IconPhone } from '@tabler/icons-react'

interface AppointmentCardProps {
    name: string;
    date: string;
    phone: string;
    status: string
}

export const AppointmentCard = ({ name, date, phone, status }: AppointmentCardProps) => {
    return (
        <div className="flex gap-6 border rounded-lg pb-4 px-4">
            <div className="flex pt-4">
                <div className="border items-center bg-zinc-950 rounded-3xl font-semibold p-2">{date}</div>
            </div>
            <div className="pt-1">
                <div className="text-lg font-bold">{name}</div>
                <div className="flex items-center gap-1 text-xs">
                    <IconPhone size={18} stroke={1} />
                    {phone}
                </div>
            </div>
        </div>
    )
}