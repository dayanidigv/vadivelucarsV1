import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import {
    Plus, Trash2, Save, Printer, Search,
    Calculator, User, Car as CarIcon,
    Package, Wrench, Info, Loader2, ArrowRightLeft
} from "lucide-react"
import { escape } from "lodash"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/BackButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useSearchCustomers } from "@/hooks/useCustomers"
import { useSearchParts, useCreatePart } from "@/hooks/useParts"
import { useCreateEstimation, useUpdateEstimation, useEstimation, useConvertToInvoice } from "@/hooks/useEstimations"
import { useAuth } from "@/contexts/AuthContext"
import { encryptData, decryptData } from "@/lib/crypto"
import { toast } from "sonner"
import { Combobox } from "@/components/ui/combobox"
import { ImageUploadDialog } from "@/components/invoice/ImageUploadDialog"
import { ImportItemsDialog } from "@/components/shared/ImportItemsDialog"
import { Textarea } from "@/components/ui/textarea"
import { CreateCustomerDialog } from "@/components/customer/CreateCustomerDialog"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/types"

type EstimationFormValues = {
    customer_id: string
    vehicle_id: string
    estimation_date: string
    mileage: number
    mechanic_name: string
    validity_period: number
    discount_amount: number
    notes: string
    status: 'draft' | 'sent'
    items: {
        part_id?: string
        part_number?: string
        description: string
        category: string
        item_type: 'part' | 'labor'
        quantity: number
        rate: number
        unit: string
        amount: number
    }[]
}

const statusConfig: Record<string, { color: string; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', label: 'Sent' },
    accepted: { color: 'bg-green-100 text-green-700', label: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
    converted: { color: 'bg-purple-100 text-purple-700', label: 'Converted' },
}

export default function CreateEstimation() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()
    const createEstimation = useCreateEstimation()
    const updateEstimation = useUpdateEstimation()
    const convertToInvoice = useConvertToInvoice()
    const { data: existingEstimation, isLoading: isLoadingEstimation } = useEstimation(id as string)

    const [customerSearch, setCustomerSearch] = useState("")
    const [partSearch, setPartSearch] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showFloatingAdd, setShowFloatingAdd] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowFloatingAdd(false)
            } else {
                setShowFloatingAdd(true)
            }
            setLastScrollY(currentScrollY)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    const { data: searchResults, isLoading: isLoadingCustomers } = useSearchCustomers(customerSearch)
    const { data: partResults, isLoading: isLoadingParts } = useSearchParts(partSearch)
    const createPart = useCreatePart()

    // Create new part on-the-fly from combobox
    const handleCreateNewPart = async (name: string) => {
        try {
            const result = await createPart.mutateAsync({
                name,
                category: 'General',
                default_rate: 0,
                unit: 'No',
                is_active: true
            })
            if (result?.data) {
                append({
                    part_id: result.data.id,
                    part_number: '',
                    description: result.data.name,
                    quantity: 1,
                    rate: "" as any,
                    unit: result.data.unit || 'No',
                    category: result.data.category || 'General',
                    item_type: 'part',
                    amount: 0
                })
                toast.success(`Created and added "${name}"`)
                setPartSearch("")
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create part')
        }
    }

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EstimationFormValues>({
        defaultValues: {
            estimation_date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
            mileage: 0,
            validity_period: 15,
            discount_amount: 0,
            notes: "",
            status: 'draft',
            items: []
        }
    })

    const existingStatus = existingEstimation?.data?.status
    const isReadOnly = existingStatus === 'accepted' || existingStatus === 'rejected' || existingStatus === 'converted'

    // Load existing data or draft
    useEffect(() => {
        if (isEditMode && existingEstimation?.data) {
            const est = existingEstimation.data
            setSelectedCustomer(est.customer)
            setSelectedVehicle(est.vehicle || est.customer?.vehicles?.find((v: any) => v.id === est.vehicle_id))

            reset({
                customer_id: est.customer_id,
                vehicle_id: est.vehicle_id,
                estimation_date: est.estimation_date?.split('T')[0] || new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
                mileage: est.mileage,
                mechanic_name: est.mechanic_name,
                validity_period: est.validity_period || 15,
                discount_amount: est.discount_amount,
                notes: est.notes,
                status: est.status === 'draft' || est.status === 'sent' ? est.status : 'draft',
                items: (est.items || []).map((i: any) => ({
                    ...i,
                    part_number: i.part_number || '',
                    quantity: Number(i.quantity),
                    rate: Number(i.rate),
                    amount: Number(i.amount)
                }))
            })
        } else if (!isEditMode) {
            const loadDraft = async () => {
                let draft = sessionStorage.getItem('estimation-draft')
                let isEncrypted = true

                if (!draft) {
                    draft = localStorage.getItem('estimation-draft')
                    isEncrypted = false
                }

                if (draft) {
                    try {
                        let finalDraft = draft
                        if (isEncrypted) {
                            const decrypted = await decryptData(draft)
                            if (!decrypted) throw new Error("Decryption failed")
                            finalDraft = decrypted
                        }

                        const parsedDraft = JSON.parse(finalDraft)
                        if (parsedDraft.selectedCustomer) setSelectedCustomer(parsedDraft.selectedCustomer)
                        if (parsedDraft.selectedVehicle) setSelectedVehicle(parsedDraft.selectedVehicle)
                        if (parsedDraft.formValues) {
                            reset(parsedDraft.formValues)
                            toast.info("Draft restored", { duration: 2000 })
                        }

                        if (!isEncrypted) localStorage.removeItem('estimation-draft')
                    } catch (e) {
                        console.error("Failed to parse or decrypt draft", e)
                        localStorage.removeItem('estimation-draft')
                        sessionStorage.removeItem('estimation-draft')
                    }
                }
            }
            loadDraft()
        }
    }, [isEditMode, existingEstimation, reset])

    // Auto-save draft
    const { isAuthenticated, user } = useAuth()
    const formValues = watch()
    useEffect(() => {
        const saveDraft = async () => {
            if (!isEditMode && selectedCustomer && isAuthenticated) {
                const draftData = {
                    formValues,
                    selectedCustomer: { id: selectedCustomer.id, name: selectedCustomer.name },
                    selectedVehicle: selectedVehicle ? { id: selectedVehicle.id, vehicle_number: selectedVehicle.vehicle_number } : null,
                    timestamp: Date.now()
                }
                try {
                    const encrypted = await encryptData(JSON.stringify(draftData))
                    sessionStorage.setItem('estimation-draft', encrypted)
                    localStorage.removeItem('estimation-draft')
                } catch (e) {
                    console.error("Failed to encrypt and save draft", e)
                }
            }
        }
        saveDraft()
    }, [formValues, selectedCustomer, selectedVehicle, isEditMode, isAuthenticated])

    const handleClearConfirm = () => {
        sessionStorage.removeItem('estimation-draft')
        localStorage.removeItem('estimation-draft')
        reset({
            estimation_date: new Date().toISOString().split('T')[0],
            mileage: 0,
            validity_period: 15,
            discount_amount: 0,
            notes: "",
            status: 'draft',
            items: [],
            customer_id: "",
            vehicle_id: "",
            mechanic_name: ""
        })
        setSelectedCustomer(null)
        setSelectedVehicle(null)
        setCustomerSearch("")
        setPartSearch("")
        setIsClearDialogOpen(false)
        toast.success("Form cleared")
    }

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    })

    const items = watch("items")
    const discount = watch("discount_amount") || 0

    // Calculations
    const partsTotal = useMemo(() =>
        items
            .filter((i: any) => i.item_type === 'part')
            .reduce((sum: number, i: any) => sum + (Number(i.quantity) * Number(i.rate)), 0),
        [items]
    )

    const laborTotal = useMemo(() =>
        items
            .filter((i: any) => i.item_type === 'labor')
            .reduce((sum: number, i: any) => sum + (Number(i.quantity) * Number(i.rate)), 0),
        [items]
    )

    const subtotal = useMemo(() => partsTotal + laborTotal, [partsTotal, laborTotal])
    const grandTotal = useMemo(() => subtotal - Number(discount), [subtotal, discount])

    // Auto-update item amounts
    useEffect(() => {
        items.forEach((item: any, index: number) => {
            const amount = Number(item.quantity) * Number(item.rate)
            if (item.amount !== amount) {
                setValue(`items.${index}.amount`, amount)
            }
        })
    }, [items, setValue])

    const onSubmit = async (data: EstimationFormValues) => {
        if (isSubmitting) return
        if (isReadOnly) return

        if (!data.customer_id || !data.vehicle_id) {
            toast.error("Please select a customer and vehicle")
            return
        }

        if (data.items.length === 0) {
            toast.error("Please add at least one item")
            return
        }

        setIsSubmitting(true)

        try {
            const formattedData = {
                ...data,
                created_by: user?.id,
                items: data.items.map(i => ({
                    ...i,
                    quantity: Number(i.quantity),
                    rate: Number(i.rate),
                    amount: Number(i.quantity) * Number(i.rate)
                }))
            }

            if (isEditMode) {
                await updateEstimation.mutateAsync({ id: id as string, data: formattedData })
                toast.success("Estimation updated successfully")
                navigate("/estimations")
            } else {
                await createEstimation.mutateAsync(formattedData)
                sessionStorage.removeItem('estimation-draft')
                localStorage.removeItem('estimation-draft')
                toast.success("Estimation created successfully")
                navigate("/estimations")
            }
        } catch (error: any) {
            console.error("Submission failed:", error)
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} estimation`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConvert = async () => {
        if (!id || existingStatus !== 'accepted') return
        if (!confirm("Convert this estimation to an invoice? This action cannot be undone.")) return
        try {
            const result = await convertToInvoice.mutateAsync(id)
            toast.success("Estimation converted to invoice")
            if (result?.data?.invoice_id) {
                navigate(`/invoices/${result.data.invoice_id}`)
            }
        } catch { /* error handled in hook */ }
    }

    if (isEditMode && isLoadingEstimation) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-gray-500">Loading estimation...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <BackButton fallback="/estimations" />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isEditMode ? "Edit Estimation" : "Create Estimation"}
                            </h1>
                            {isEditMode && existingStatus && (
                                <Badge className={statusConfig[existingStatus]?.color}>
                                    {statusConfig[existingStatus]?.label}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {isReadOnly
                                ? "This estimation is read-only"
                                : isEditMode ? "Update estimation details" : "Fill in the details to create an estimation"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {!isEditMode && (
                        <Button
                            variant="outline"
                            onClick={() => setIsClearDialogOpen(true)}
                            className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
                    {isEditMode && (
                        <Button
                            variant="outline"
                            onClick={() => window.open(`/estimations/${id}/print`, '_blank')}
                            className="flex-1 sm:flex-none"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    )}
                    {existingStatus === 'accepted' && (
                        <Button
                            onClick={handleConvert}
                            disabled={convertToInvoice.isPending}
                            className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700"
                        >
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Convert to Invoice
                        </Button>
                    )}
                    {!isReadOnly && (
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting || createEstimation.isPending || updateEstimation.isPending}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting || createEstimation.isPending || updateEstimation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isEditMode ? "Update Estimation" : "Save Estimation"}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Draft Indicator */}
            {!isEditMode && sessionStorage.getItem('estimation-draft') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold">Draft Auto-saved</p>
                            <p className="text-blue-800 mt-1">Your changes are being saved automatically.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Converted link */}
            {existingStatus === 'converted' && existingEstimation?.data?.converted_invoice_id && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <ArrowRightLeft className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <div className="text-sm text-purple-900">
                            <p className="font-semibold">This estimation has been converted to an invoice.</p>
                            <Button
                                variant="link"
                                className="p-0 h-auto text-purple-700 underline"
                                onClick={() => navigate(`/invoices/${existingEstimation?.data?.converted_invoice_id}`)}
                            >
                                View Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Customer Selection */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle>Customer Details</CardTitle>
                                    <CardDescription className="text-xs">Select customer and vehicle</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1 text-sm">
                                    Customer <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Combobox
                                            placeholder="Search customer..."
                                            searchPlaceholder="Type to search..."
                                            onSearch={setCustomerSearch}
                                            value={watch("customer_id")}
                                            selectedLabel={escape(selectedCustomer?.name)}
                                            options={(searchResults?.data?.customers || []).map((c: any) => ({
                                                label: `${c.name} - ${c.phone || "No phone"}`,
                                                value: c.id
                                            }))}
                                            onChange={(val) => {
                                                if (isReadOnly) return
                                                const customer = searchResults?.data?.customers?.find((c: any) => c.id === val)
                                                if (customer) {
                                                    setSelectedCustomer(customer)
                                                    setValue("customer_id", customer.id)
                                                    if (customer.vehicles && customer.vehicles.length > 0) {
                                                        setValue("vehicle_id", customer.vehicles[0].id)
                                                        setSelectedVehicle(customer.vehicles[0])
                                                        setValue("mileage", customer.vehicles[0].current_mileage || 0)
                                                    }
                                                }
                                            }}
                                            isLoading={isLoadingCustomers}
                                            emptyMessage="Start typing to search customers"
                                        />
                                    </div>
                                    {!isReadOnly && (
                                        <CreateCustomerDialog
                                            mode="drawer"
                                            onSuccess={(newCustomer: Customer) => {
                                                setCustomerSearch("")
                                                setSelectedCustomer(newCustomer)
                                                setValue("customer_id", newCustomer.id, { shouldValidate: true })
                                                if (newCustomer.vehicles && newCustomer.vehicles.length > 0) {
                                                    const vehicle = newCustomer.vehicles[0]
                                                    setValue("vehicle_id", vehicle.id, { shouldValidate: true })
                                                    setSelectedVehicle(vehicle)
                                                    setValue("mileage", vehicle.current_mileage || 0, { shouldValidate: true })
                                                }
                                            }}
                                            trigger={
                                                <Button type="button" variant="outline" size="icon" className="shrink-0 h-10 w-10 border-blue-200 text-blue-600 hover:bg-blue-50" title="Add New Customer">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            {selectedCustomer && (
                                <>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                                                {selectedCustomer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{selectedCustomer.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-200">
                                            <p>{selectedCustomer.phone || "No phone"}</p>
                                            {selectedCustomer.address && (
                                                <p className="line-clamp-2">{escape(selectedCustomer.address)}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1 text-sm">
                                            Vehicle <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={watch("vehicle_id")}
                                            onValueChange={(val) => {
                                                if (isReadOnly) return
                                                setValue("vehicle_id", val)
                                                const vehicle = selectedCustomer.vehicles.find((v: any) => v.id === val)
                                                if (vehicle) {
                                                    setSelectedVehicle(vehicle)
                                                    setValue("mileage", vehicle.current_mileage || 0)
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedCustomer.vehicles?.map((v: any) => (
                                                    <SelectItem key={v.id} value={v.id}>
                                                        {v.vehicle_number} - {v.make} {v.model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedVehicle && (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <CarIcon className="h-4 w-4 text-purple-600 mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-purple-900">{escape(selectedVehicle.make)} {escape(selectedVehicle.model)}</p>
                                                    <p className="text-xs text-purple-700 mt-0.5">{escape(selectedVehicle.vehicle_number)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Service Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Wrench className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle>Estimation Details</CardTitle>
                                    <CardDescription className="text-xs">Date, validity, and notes</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-sm">Date</Label>
                                    <Input
                                        type="date"
                                        {...register("estimation_date", { required: "Date is required" })}
                                        className="text-sm"
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Validity (days)</Label>
                                    <Input
                                        type="number"
                                        {...register("validity_period", { valueAsNumber: true })}
                                        placeholder="15"
                                        className="text-sm"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-sm">Mileage (km)</Label>
                                    <Input
                                        type="number"
                                        {...register("mileage", { valueAsNumber: true })}
                                        placeholder="0"
                                        className="text-sm"
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Mechanic Name</Label>
                                    <Input
                                        {...register("mechanic_name")}
                                        placeholder="e.g. Prakash"
                                        className="text-sm"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <div className="lg:sticky lg:top-6">
                        <Card className="shadow-lg border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Calculator className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Estimation Summary</CardTitle>
                                        <CardDescription className="text-xs">Totals breakdown</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <Package className="h-3.5 w-3.5 text-purple-500" />
                                            Parts Total
                                        </span>
                                        <span className="font-semibold">₹{partsTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-1.5">
                                            <Wrench className="h-3.5 w-3.5 text-blue-500" />
                                            Labor Total
                                        </span>
                                        <span className="font-semibold">₹{laborTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="text-gray-700">Subtotal</span>
                                        <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-gray-600">Discount</span>
                                        <Input
                                            type="number"
                                            className="w-24 h-8 text-right text-sm"
                                            {...register("discount_amount", { valueAsNumber: true })}
                                            placeholder="0"
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-900">Grand Total</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            ₹{grandTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Items */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle>Items & Services</CardTitle>
                                    <CardDescription className="text-xs">
                                        {fields.length} {fields.length === 1 ? 'item' : 'items'} added
                                    </CardDescription>
                                </div>
                            </div>
                            {!isReadOnly && (
                                <div className="flex items-center gap-2">
                                    <ImportItemsDialog
                                        source="invoice"
                                        onItemsImported={(items) => {
                                            items.forEach((item) => {
                                                append({
                                                    part_id: item.part_id,
                                                    description: item.description,
                                                    part_number: item.part_number || '',
                                                    category: item.category,
                                                    item_type: item.item_type,
                                                    quantity: item.quantity,
                                                    rate: item.rate,
                                                    unit: item.unit,
                                                    amount: item.amount,
                                                })
                                            })
                                        }}
                                    />
                                    <ImageUploadDialog
                                        onItemsExtracted={(items) => {
                                            items.forEach((item) => {
                                                append({
                                                    description: item.description,
                                                    part_number: '',
                                                    quantity: item.quantity,
                                                    rate: item.rate || ("" as any),
                                                    amount: item.quantity * (item.rate || 0),
                                                    item_type: 'part',
                                                    unit: 'No',
                                                    category: 'General'
                                                })
                                            })
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={() => append({
                                            description: "",
                                            part_number: "",
                                            quantity: 1,
                                            rate: "" as any,
                                            amount: 0,
                                            item_type: 'part',
                                            unit: 'No',
                                            category: 'General'
                                        })}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Item
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Quick Add */}
                        {!isReadOnly && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <Label className="text-sm font-semibold flex items-center gap-1.5">
                                    <Search className="h-4 w-4" />
                                    Quick Add from Parts Catalog
                                </Label>
                                <Combobox
                                    placeholder="Search parts..."
                                    searchPlaceholder="Type to search parts..."
                                    onSearch={setPartSearch}
                                    value=""
                                    options={(partResults?.data || []).map((p: any) => ({
                                        label: `${p.name} - ₹${p.default_rate?.toFixed(2) || 0}`,
                                        value: p.id
                                    }))}
                                    onChange={(val) => {
                                        if (!val) return
                                        const part = partResults?.data?.find((p: any) => p.id === val)
                                        if (part) {
                                            append({
                                                part_id: part.id,
                                                part_number: '',
                                                description: part.name,
                                                quantity: 1,
                                                rate: part.default_rate || 0,
                                                unit: part.unit || 'No',
                                                category: part.category || 'General',
                                                item_type: 'part',
                                                amount: part.default_rate || 0
                                            })
                                            toast.success(`Added ${part.name}`)
                                            setPartSearch("")
                                        }
                                    }}
                                    isLoading={isLoadingParts}
                                    emptyMessage="Start typing to search parts"
                                    creatable
                                    onCreateNew={handleCreateNewPart}
                                />
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="border rounded-lg overflow-hidden">
                            {fields.length === 0 ? (
                                <div className="bg-gray-50 p-12 text-center">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-gray-900 mb-1">No items added yet</p>
                                    <p className="text-xs text-gray-500">
                                        Click "Add Item" or search parts to get started
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table className="w-full">
                                        <TableHeader className="hidden md:table-header-group">
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="w-[12%] font-semibold">Part No.</TableHead>
                                                <TableHead className="w-[28%] font-semibold">Description</TableHead>
                                                <TableHead className="w-[12%] font-semibold">Type</TableHead>
                                                <TableHead className="w-[10%] text-center font-semibold">Qty</TableHead>
                                                <TableHead className="w-[14%] text-right font-semibold">Rate</TableHead>
                                                <TableHead className="w-[16%] text-right font-semibold">Amount</TableHead>
                                                <TableHead className="w-[5%]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="md:table-row-group">
                                            {fields.map((field, index) => (
                                                <TableRow key={field.id} className="flex flex-col md:table-row hover:bg-gray-50 border-b md:border-none">
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Part_No:'] before:font-semibold md:before:content-none before:mr-2">
                                                        <Input
                                                            {...register(`items.${index}.part_number`)}
                                                            placeholder="Part #"
                                                            className="text-sm h-9"
                                                            disabled={isReadOnly}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Description:'] before:font-semibold md:before:content-none before:mr-2">
                                                        <Input
                                                            {...register(`items.${index}.description`, { required: "Required" })}
                                                            placeholder="Item name"
                                                            className={`text-sm h-9 ${errors.items?.[index]?.description ? "border-red-500" : ""}`}
                                                            disabled={isReadOnly}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Type:'] before:font-semibold md:before:content-none before:mr-2">
                                                        <Select
                                                            value={watch(`items.${index}.item_type`)}
                                                            onValueChange={(val: any) => {
                                                                if (!isReadOnly) setValue(`items.${index}.item_type`, val)
                                                            }}
                                                            disabled={isReadOnly}
                                                        >
                                                            <SelectTrigger className="text-sm h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="part">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Package className="h-3 w-3 text-purple-500" />
                                                                        Part
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="labor">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Wrench className="h-3 w-3 text-blue-500" />
                                                                        Labor
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Qty:'] before:font-semibold md:before:content-none before:mr-2 md:text-center">
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            {...register(`items.${index}.quantity`, {
                                                                required: "Required",
                                                                valueAsNumber: true,
                                                                min: 0.1
                                                            })}
                                                            className="text-sm h-9 text-center"
                                                            disabled={isReadOnly}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Rate:'] before:font-semibold md:before:content-none before:mr-2 md:text-right">
                                                        <Input
                                                            type="number"
                                                            {...register(`items.${index}.rate`, {
                                                                required: "Required",
                                                                valueAsNumber: true,
                                                                min: 0
                                                            })}
                                                            placeholder="Enter rate"
                                                            className="text-sm h-9 text-right"
                                                            disabled={isReadOnly}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Amount:'] before:font-semibold md:before:content-none before:mr-2 md:text-right">
                                                        <div className="font-semibold text-sm text-gray-900 px-2">
                                                            ₹{((watch(`items.${index}.quantity`) || 0) *
                                                                (watch(`items.${index}.rate`) || 0)).toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 md:before:content-none">
                                                        {!isReadOnly && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => remove(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 pt-2">
                            <Label className="text-sm font-medium">Additional Notes</Label>
                            <Textarea
                                {...register("notes")}
                                placeholder="Add any additional notes or comments..."
                                rows={3}
                                className="resize-none text-sm"
                                disabled={isReadOnly}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Clear Confirmation Dialog */}
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            Clear Estimation Form
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to clear all fields? This will delete your draft and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClearConfirm} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Form
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Floating Save Button (Mobile) */}
            {!isReadOnly && (
                <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 md:hidden ${
                    showFloatingAdd ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-90 pointer-events-none"
                }`}>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={createEstimation.isPending || updateEstimation.isPending}
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-white"
                    >
                        {createEstimation.isPending || updateEstimation.isPending ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <Save className="h-6 w-6" />
                        )}
                    </Button>
                </div>
            )}

            {/* Floating Add Item Button */}
            {!isReadOnly && (
                <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 md:hidden ${
                    showFloatingAdd ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-90 pointer-events-none"
                }`}>
                    <Button
                        type="button"
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-2xl bg-green-600 hover:bg-green-700 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-white"
                        onClick={() => append({
                            description: "",
                            part_number: "",
                            quantity: 1,
                            rate: "" as any,
                            amount: 0,
                            item_type: 'part',
                            unit: 'No',
                            category: 'General'
                        })}
                        title="Add new item"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </div>
    )
}
