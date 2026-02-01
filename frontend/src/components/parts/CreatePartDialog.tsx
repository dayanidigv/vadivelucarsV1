
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreatePart, useUpdatePart } from "@/hooks/useParts"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CreatePartDialogProps {
    partToEdit?: any
    trigger?: React.ReactNode
}

export function CreatePartDialog({ partToEdit, trigger }: CreatePartDialogProps) {
    const [open, setOpen] = useState(false)
    const isEditMode = !!partToEdit
    const createPart = useCreatePart()
    const updatePart = useUpdatePart()

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            category: "",
            unit: "No",
            default_rate: ""
        }
    })

    useEffect(() => {
        if (partToEdit) {
            reset({
                name: partToEdit.name,
                category: partToEdit.category,
                unit: partToEdit.unit,
                default_rate: partToEdit.default_rate
            })
        } else {
            reset({ name: "", category: "", unit: "No", default_rate: "" })
        }
    }, [partToEdit, reset, open])

    const onSubmit = (data: any) => {
        const formattedData = {
            ...data,
            default_rate: Number(data.default_rate)
        }

        if (isEditMode) {
            updatePart.mutate({ id: partToEdit.id, data: formattedData }, {
                onSuccess: () => {
                    setOpen(false)
                    toast.success("Part updated successfully")
                    reset()
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to update part")
                }
            })
        } else {
            createPart.mutate(formattedData, {
                onSuccess: () => {
                    setOpen(false)
                    toast.success("Part created successfully")
                    reset()
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to create part")
                }
            })
        }
    }

    const isLoading = createPart.isPending || updatePart.isPending

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Part
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Part" : "Add New Part"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Part Name *</Label>
                        <Input id="name" {...register("name", { required: "Name is required" })} />
                        {errors.name && <span className="text-sm text-red-500">{errors.name.message as string}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Input 
                            id="category" 
                            {...register("category", { required: "Category is required" })} 
                            placeholder="Enter category (e.g., Engine, Body, Electrical)"
                        />
                        {errors.category && <span className="text-sm text-red-500">{errors.category.message as string}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select onValueChange={(val) => setValue("unit", val)} defaultValue="No">
                            <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="No">No (Number)</SelectItem>
                                <SelectItem value="Ltrs">Ltrs</SelectItem>
                                <SelectItem value="Kgs">Kgs</SelectItem>
                                <SelectItem value="Set">Set</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="default_rate">Default Rate (₹) *</Label>
                        <Input
                            id="default_rate"
                            type="number"
                            step="0.01"
                            {...register("default_rate", { required: "Rate is required" })}
                        />
                        {errors.default_rate && <span className="text-sm text-red-500">{errors.default_rate.message as string}</span>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditMode ? "Update Part" : "Create Part"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
