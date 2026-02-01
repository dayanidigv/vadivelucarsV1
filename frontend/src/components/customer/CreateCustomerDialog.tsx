
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CreateCustomerDialogProps {
    customerToEdit?: any
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateCustomerDialog({ customerToEdit, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: CreateCustomerDialogProps) {
    const [open, setOpen] = useState(false)
    const isEditMode = !!customerToEdit
    const createCustomer = useCreateCustomer()
    const updateCustomer = useUpdateCustomer()

    // Handle controlled vs uncontrolled state
    const isOpen = controlledOpen !== undefined ? controlledOpen : open
    const setIsOpen = setControlledOpen || setOpen

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            address: "",
            vehicle: {
                vehicle_number: "",
                make: "",
                model: "",
                year: "",
                current_mileage: ""
            }
        }
    })

    useEffect(() => {
        if (customerToEdit) {
            reset({
                name: customerToEdit.name,
                phone: customerToEdit.phone,
                email: customerToEdit.email,
                address: customerToEdit.address,
                // If editing, we might not want to force vehicle edit here if it's separate, 
                // but for now let's leave vehicle empty or handle complex logic later.
                // The current backend create logic supports creating a vehicle WITH customer.
                // Update logic usually updates customer details. Let's assume vehicle is separate or ignored for now in simple update.
            })
        } else {
            reset({
                name: "", phone: "", email: "", address: "",
                vehicle: { vehicle_number: "", make: "", model: "", year: "", current_mileage: "" }
            })
        }
    }, [customerToEdit, reset, isOpen])

    const onSubmit = (data: any) => {
        if (isEditMode) {
            updateCustomer.mutate({ id: customerToEdit.id, data }, {
                onSuccess: () => {
                    setIsOpen(false)
                    toast.success("Customer updated successfully")
                    reset()
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to update customer")
                }
            })
        } else {
            createCustomer.mutate(data, {
                onSuccess: () => {
                    setIsOpen(false)
                    toast.success("Customer created successfully")
                    reset()
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to create customer")
                }
            })
        }
    }

    const isLoading = createCustomer.isPending || updateCustomer.isPending

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register("name", { required: "Name is required" })} />
                        {errors.name && <span className="text-sm text-red-500">{errors.name.message as string}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...register("phone", { required: "Phone is required" })} />
                        {errors.phone && <span className="text-sm text-red-500">{errors.phone.message as string}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input id="email" type="email" {...register("email")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address (Optional)</Label>
                        <Input id="address" {...register("address")} />
                    </div>

                    {!isEditMode && (
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium mb-2">Vehicle Details (Optional)</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>Vehicle Number</Label>
                                    <Input {...register("vehicle.vehicle_number")} placeholder="KA-01-AB-1234" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Model</Label>
                                    <Input {...register("vehicle.model")} placeholder="Swift" />
                                </div>
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditMode ? "Update Customer" : "Create Customer"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
