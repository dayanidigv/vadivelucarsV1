
import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers"
import { useCarModels } from "@/hooks/useCarModels"
import type { Customer, CreateCustomerInput, CarModel } from "@/types"
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
import { Combobox } from "@/components/ui/combobox"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface CreateCustomerDialogProps {
    customerToEdit?: Customer
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onSuccess?: (customer: Customer) => void
    mode?: 'dialog' | 'drawer'
}

export function CreateCustomerDialog({
    customerToEdit,
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    onSuccess,
    mode = 'dialog'
}: CreateCustomerDialogProps) {
    const [open, setOpen] = useState(false)
    const isEditMode = !!customerToEdit
    const createCustomer = useCreateCustomer()
    const updateCustomer = useUpdateCustomer()
    const { data: carModels } = useCarModels()

    // Handle controlled vs uncontrolled state
    const isOpen = controlledOpen !== undefined ? controlledOpen : open
    const setIsOpen = setControlledOpen || setOpen

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm({
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

    const watchedVehicles = watch("vehicles")

    // Get unique makes
    const makeOptions = useMemo(() => {
        const models = carModels || []
        const uniqueMakes = Array.from(new Set(models.map((m: CarModel) => m.make))).sort()
        return uniqueMakes.map(make => ({ label: make, value: make }))
    }, [carModels])

    // Get models for each vehicle
    const getModelOptions = (index: number) => {
        const make = watchedVehicles[index]?.make
        const models = carModels || []
        if (!make) return []
        return models
            .filter((m: CarModel) => m.make === make)
            .map((m: CarModel) => ({ label: m.model, value: m.model }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }

    useEffect(() => {
        if (customerToEdit) {
            reset({
                name: customerToEdit.name,
                phone: customerToEdit.phone || "",
                email: customerToEdit.email || "",
                address: customerToEdit.address || "",
                vehicles: customerToEdit.vehicles && customerToEdit.vehicles.length > 0
                    ? customerToEdit.vehicles.map((v: any) => ({
                        ...v,
                        vehicle_number: v.vehicle_number || "",
                        make: v.make || "",
                        model: v.model || "",
                        year: v.year || "",
                        current_mileage: v.current_mileage || "",
                        insurance_date: v.insurance_date || ""
                    }))
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
        // Ensure empty strings are sent as null for phone/email/address
        const cleanData: CreateCustomerInput = {
            name: data.name,
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
            vehicles: data.vehicles.map((v: any) => ({
                vehicle_number: v.vehicle_number,
                make: v.make || undefined,
                model: v.model || undefined,
                year: v.year ? parseInt(v.year) : undefined
            }))
        }

        if (isEditMode && customerToEdit) {
            updateCustomer.mutate({ id: customerToEdit.id, data: cleanData }, {
                onSuccess: () => {
                    setIsOpen(false)
                    toast.success("Customer updated successfully")
                    reset()
                },
                onError: (error: Error) => {
                    toast.error(error.message || "Failed to update customer")
                }
            })
        } else {
            createCustomer.mutate(cleanData, {
                onSuccess: (response: any) => {
                    setIsOpen(false)
                    toast.success("Customer created successfully")
                    reset()
                    if (onSuccess && response.data) {
                        onSuccess(response.data)
                    }
                },
                onError: (error: Error) => {
                    toast.error(error.message || "Failed to create customer")
                }
            })
        }
    }

    const isLoading = createCustomer.isPending || updateCustomer.isPending

    const FormContent = (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name", { required: "Name is required" })} />
                {errors.name && <span className="text-sm text-red-500">{errors.name.message as string}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" {...register("phone")} placeholder="9876543210" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" type="email" {...register("email")} placeholder="customer@example.com" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input id="address" {...register("address")} placeholder="Salem" />
            </div>

            <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900 font-bold">Vehicle Details</h4>
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
                        className="h-8 shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                    </Button>
                </div>

                <div className="space-y-6 pb-20 sm:pb-0">
                    {fields.map((field, index) => (
                        <div key={field.id} className="border-2 rounded-xl p-5 space-y-4 relative bg-gray-50/30">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                        V{index + 1}
                                    </div>
                                    <h5 className="font-bold text-sm text-gray-700">Vehicle {index + 1}</h5>
                                </div>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Vehicle Number *</Label>
                                    <Input
                                        {...register(`vehicles.${index}.vehicle_number`, { required: "Vehicle number is required" })}
                                        placeholder="TN 30 AB 1234"
                                        className="uppercase"
                                    />
                                    {errors.vehicles?.[index]?.vehicle_number && (
                                        <span className="text-xs text-red-500">{(errors.vehicles[index] as any).vehicle_number.message}</span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Make</Label>
                                    <Combobox
                                        placeholder="Select make..."
                                        searchPlaceholder="Search make..."
                                        options={makeOptions}
                                        value={watchedVehicles[index]?.make}
                                        onChange={(val) => {
                                            setValue(`vehicles.${index}.make`, val)
                                            setValue(`vehicles.${index}.model`, "") // Reset model when make changes
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Model</Label>
                                    <Combobox
                                        placeholder={watchedVehicles[index]?.make ? "Select model..." : "Select make first"}
                                        searchPlaceholder="Search model..."
                                        options={getModelOptions(index)}
                                        value={watchedVehicles[index]?.model}
                                        onChange={(val) => setValue(`vehicles.${index}.model`, val)}
                                        disabled={!watchedVehicles[index]?.make}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Year</Label>
                                    <Input {...register(`vehicles.${index}.year`)} placeholder="2022" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Current Mileage</Label>
                                    <Input {...register(`vehicles.${index}.current_mileage`)} placeholder="25000" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Insurance Date</Label>
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

            <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t sm:relative sm:p-0 sm:border-0 sm:mt-6">
                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95 font-bold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isEditMode ? "Update Customer" : "Create Customer"}
                </Button>
            </div>
        </form>
    )

    if (mode === 'drawer') {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    {trigger ? trigger : (
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    )}
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-[600px] w-full overflow-y-auto p-0">
                    <div className="p-6">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-2xl font-bold">{isEditMode ? "Edit Customer" : "Add New Customer"}</SheetTitle>
                        </SheetHeader>
                        {FormContent}
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

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
                {FormContent}
            </DialogContent>
        </Dialog>
    )
}
