
import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Plus, Loader2, Trash2 } from "lucide-react"
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

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            address: "",
            vehicles: [{
                vehicle_number: "",
                make: "",
                model: "",
                year: "",
                current_mileage: "",
                insurance_date: ""
            }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "vehicles"
    })

    useEffect(() => {
        if (customerToEdit) {
            reset({
                name: customerToEdit.name,
                phone: customerToEdit.phone,
                email: customerToEdit.email,
                address: customerToEdit.address,
                vehicles: customerToEdit.vehicles && customerToEdit.vehicles.length > 0
                    ? customerToEdit.vehicles
                    : [{ vehicle_number: "", make: "", model: "", year: "", current_mileage: "", insurance_date: "" }]
            })
        } else {
            reset({
                name: "", phone: "", email: "", address: "",
                vehicles: [{ vehicle_number: "", make: "", model: "", year: "", current_mileage: "", insurance_date: "" }]
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
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" {...register("name", { required: "Name is required" })} />
                        {errors.name && <span className="text-sm text-red-500">{errors.name.message as string}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
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

                    <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium">Vehicle Details</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({
                                        vehicle_number: "",
                                        make: "",
                                        model: "",
                                        year: "",
                                        current_mileage: "",
                                        insurance_date: ""
                                    })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Vehicle
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-medium text-sm">Vehicle {index + 1}</h5>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Vehicle Number *</Label>
                                                <Input {...register(`vehicles.${index}.vehicle_number`, { required: "Vehicle number is required" })} placeholder="KA-01-AB-1234" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Make</Label>
                                                <Input {...register(`vehicles.${index}.make`)} placeholder="Maruti Suzuki" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Model</Label>
                                                <Input {...register(`vehicles.${index}.model`)} placeholder="Swift" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Year</Label>
                                                <Input {...register(`vehicles.${index}.year`)} placeholder="2022" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label>Current Mileage</Label>
                                                <Input {...register(`vehicles.${index}.current_mileage`)} placeholder="25000" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Insurance Date</Label>
                                                <Input 
                                                    {...register(`vehicles.${index}.insurance_date`)} 
                                                    type="date" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditMode ? "Update Customer" : "Create Customer"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
