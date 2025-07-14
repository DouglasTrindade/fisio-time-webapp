import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export const AppointmentsModal = () => {
    return (
        <Dialog >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Event Details</DialogTitle>
                </DialogHeader>
                <form className="space-x-5 mb-4">
                    <input
                        type="text"
                        placeholder="Event Title"
                        value={''}
                        required
                        className="border border-gray-200 p-3 rounded-md text-lg"
                    />
                    <button
                        className="bg-green-500 text-white p-3 mt-5 rounded-md"
                        type="submit"
                    >
                        Add
                    </button>{" "}
                </form>
            </DialogContent>
        </Dialog>
    )
}