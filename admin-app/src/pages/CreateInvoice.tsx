import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import {
    Plus, Trash2, Save, Printer, Search, AlertTriangle,
    Calculator, CreditCard, User, Car as CarIcon,
    Package, Wrench, Info, Loader2
} from "lucide-react"
import { escape } from "lodash"
import { auditLogger } from "@/lib/audit"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/BackButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useSearchCustomers } from "@/hooks/useCustomers"
import { useSearchParts } from "@/hooks/useParts"
import { useCreateInvoice, useUpdateInvoice, useInvoice } from "@/hooks/useInvoices"
import { useLastService } from "@/hooks/useLastService"
import { useRecentlyUsedParts } from "../hooks/useRecentlyUsedParts"
import { useAuth } from "@/contexts/AuthContext"
import { encryptData, decryptData } from "@/lib/crypto"
import { toast } from "sonner"
import { Combobox } from "@/components/ui/combobox"
import RecentlyUsedParts from "@/components/invoice/RecentlyUsedParts"
import { Textarea } from "@/components/ui/textarea"

type InvoiceFormValues = {
    customer_id: string
    vehicle_id: string
    invoice_date: string
    mileage: number
    mechanic_name: string
    payment_method: string
    payment_status: 'paid' | 'unpaid' | 'partial' | 'pending'
    paid_amount: number
    discount_amount: number
    notes: string
    items: {
        part_id?: string
        description: string
        category: string
        item_type: 'part' | 'labor'
        quantity: number
        rate: number
        unit_price?: number
        unit: string
        amount: number
    }[]
}

export default function CreateInvoice() {
    const { id } = useParams()
    const isEditMode = !!id
    const navigate = useNavigate()
    const createInvoice = useCreateInvoice()
    const updateInvoice = useUpdateInvoice()
    const { data: existingInvoice, isLoading: isLoadingInvoice } = useInvoice(id as string)

    const [customerSearch, setCustomerSearch] = useState("")
    const [partSearch, setPartSearch] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Queries
    const { data: searchResults, isLoading: isLoadingCustomers } = useSearchCustomers(customerSearch)
    const { data: partResults, isLoading: isLoadingParts } = useSearchParts(partSearch)

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<InvoiceFormValues>({
        defaultValues: {
            invoice_date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
            mileage: 0,
            payment_status: 'unpaid',
            payment_method: 'cash',
            discount_amount: 0,
            paid_amount: 0,
            notes: "",
            items: []
        }
    })

    const { addRecentPart } = useRecentlyUsedParts()
    const { lastService: lastServiceData } = useLastService(selectedCustomer?.id, watch('vehicle_id'))

    // Handle recently used parts selection
    const handleRecentPartSelect = (part: any) => {
        append({
            part_id: part.id,
            description: part.name,
            category: part.category,
            item_type: 'part',
            quantity: 1,
            rate: part.price,
            unit: 'No',
            amount: part.price
        })
        addRecentPart(part)
        toast.success(`Added ${part.name} to invoice`)
    }

    // Load existing data or draft
    useEffect(() => {
        if (isEditMode && existingInvoice?.data) {
            const invoice = existingInvoice.data
            setSelectedCustomer(invoice.customer)
            setSelectedVehicle(invoice.customer?.vehicles?.find((v: any) => v.id === invoice.vehicle_id))

            reset({
                customer_id: invoice.customer_id,
                vehicle_id: invoice.vehicle_id,
                invoice_date: invoice.invoice_date?.split('T')[0] || new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
                mileage: invoice.mileage,
                mechanic_name: invoice.mechanic_name,
                payment_method: invoice.payment_method,
                payment_status: invoice.payment_status,
                paid_amount: invoice.paid_amount,
                discount_amount: invoice.discount_amount,
                notes: invoice.notes,
                items: (invoice.items || []).map((i: any) => ({
                    ...i,
                    quantity: Number(i.quantity),
                    rate: Number(i.rate || i.unit_price || 0),
                    unit_price: Number(i.rate || i.unit_price || 0),
                    amount: Number(i.amount)
                }))
            })
        } else if (!isEditMode) {
            const loadDraft = async () => {
                // Try sessionStorage first (new encrypted model)
                let draft = sessionStorage.getItem('invoice-draft')
                let isEncrypted = true

                // Fallback to localStorage for migration
                if (!draft) {
                    draft = localStorage.getItem('invoice-draft')
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
                        if (parsedDraft.selectedCustomer) {
                            setSelectedCustomer(parsedDraft.selectedCustomer)
                        }
                        if (parsedDraft.selectedVehicle) {
                            setSelectedVehicle(parsedDraft.selectedVehicle)
                        }
                        if (parsedDraft.formValues) {
                            reset(parsedDraft.formValues)
                            toast.info("Draft restored", { duration: 2000 })
                        }

                        // Migration cleanup: if it was in localStorage, move it to sessionStorage (encrypted) next save
                        if (!isEncrypted) {
                            localStorage.removeItem('invoice-draft')
                        }
                    } catch (e) {
                        console.error("Failed to parse or decrypt draft", e)
                        localStorage.removeItem('invoice-draft')
                        sessionStorage.removeItem('invoice-draft')
                    }
                }
            }
            loadDraft()
        }
    }, [isEditMode, existingInvoice, reset])

    // Auto-save draft (Encrypted & PII stripped)
    const { isAuthenticated, user } = useAuth()
    const formValues = watch()
    useEffect(() => {
        const saveDraft = async () => {
            if (!isEditMode && selectedCustomer && isAuthenticated) {
                const draftData = {
                    formValues,
                    selectedCustomer: {
                        id: selectedCustomer.id,
                        name: selectedCustomer.name,
                        // Strip PII (phone, email, address)
                    },
                    selectedVehicle: selectedVehicle ? {
                        id: selectedVehicle.id,
                        vehicle_number: selectedVehicle.vehicle_number
                        // Strip other vehicle details if needed
                    } : null,
                    timestamp: Date.now()
                }

                try {
                    const encrypted = await encryptData(JSON.stringify(draftData))
                    sessionStorage.setItem('invoice-draft', encrypted)
                    // Also clear old localStorage draft if it somehow exists
                    localStorage.removeItem('invoice-draft')
                } catch (e) {
                    console.error("Failed to encrypt and save draft", e)
                }
            }
        }
        saveDraft()
    }, [formValues, selectedCustomer, selectedVehicle, isEditMode, isAuthenticated])

    const handleClearConfirm = () => {
        sessionStorage.removeItem('invoice-draft')
        localStorage.removeItem('invoice-draft')
        reset({
            invoice_date: new Date().toISOString().split('T')[0],
            mileage: 0,
            payment_status: 'unpaid',
            payment_method: 'cash',
            discount_amount: 0,
            paid_amount: 0,
            notes: "",
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
    const paid = watch("paid_amount") || 0
    const paymentStatus = watch("payment_status")

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

    const balance = useMemo(() => grandTotal - Number(paid), [grandTotal, paid])

    // Auto-update paid amount based on status
    useEffect(() => {
        if (paymentStatus === 'paid') {
            setValue('paid_amount', grandTotal)
        } else if (paymentStatus === 'unpaid') {
            setValue('paid_amount', 0)
        }
    }, [paymentStatus, grandTotal, setValue])

    const onSubmit = async (data: InvoiceFormValues) => {
        if (isSubmitting) return

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
                idempotencyKey: crypto.randomUUID(),
                total_amount: subtotal,
                grand_total: grandTotal,
                balance_amount: balance,
                items: data.items.map(i => {
                    const price = Number(i.rate || 0);
                    return {
                        ...i,
                        quantity: Number(i.quantity),
                        rate: price,
                        unit_price: price,
                        amount: Number(i.quantity) * price
                    };
                })
            }

            let response: any
            if (isEditMode) {
                response = await updateInvoice.mutateAsync({ id: id as string, data: formattedData })

                auditLogger.log({
                    action: 'UPDATE_INVOICE',
                    resource: 'invoice',
                    resourceId: id,
                    performedBy: user?.username || 'unknown',
                    severity: 'medium',
                    changes: {
                        customer_id: data.customer_id,
                        total_amount: formattedData.items.reduce((sum, item) => sum + (item.amount || 0), 0)
                    }
                })

                toast.success("Invoice updated successfully")
                navigate("/invoices")
            } else {
                response = await createInvoice.mutateAsync(formattedData)
                sessionStorage.removeItem('invoice-draft')
                localStorage.removeItem('invoice-draft')

                auditLogger.log({
                    action: 'CREATE_INVOICE',
                    resource: 'invoice',
                    resourceId: response?.data?.id,
                    performedBy: user?.username || 'unknown',
                    severity: 'medium',
                    changes: {
                        customer_id: data.customer_id,
                        total_amount: formattedData.items.reduce((sum, item) => sum + (item.amount || 0), 0)
                    }
                })

                toast.success("Invoice created successfully")
                navigate("/invoices")
            }
        } catch (error: any) {
            console.error("Submission failed:", error)
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} invoice`)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Auto-update item amounts
    useEffect(() => {
        items.forEach((item: any, index: number) => {
            const amount = Number(item.quantity) * Number(item.rate)
            if (item.amount !== amount) {
                setValue(`items.${index}.amount`, amount)
            }
        })
    }, [items, setValue])

    if (isEditMode && isLoadingInvoice) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-gray-500">Loading invoice...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <BackButton fallback="/invoices" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? "Edit Invoice" : "Create Invoice"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode ? "Update invoice details" : "Fill in the details to generate an invoice"}
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
                            onClick={() => window.open(`/invoices/${id}/print`, '_blank')}
                            className="flex-1 sm:flex-none"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting || createInvoice.isPending || updateInvoice.isPending}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting || createInvoice.isPending || updateInvoice.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isEditMode ? "Update Invoice" : "Save Invoice"}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Draft Indicator */}
            {!isEditMode && sessionStorage.getItem('invoice-draft') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold">Draft Auto-saved</p>
                            <p className="text-blue-800 mt-1">
                                Your changes are being saved automatically.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Customer & Vehicle & Service */}
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

                            {selectedCustomer && (
                                <>
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                                                {selectedCustomer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{selectedCustomer.name}</p>
                                                <p className="text-xs text-gray-500">ID: #{selectedCustomer.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-200">
                                            <p>📱 {selectedCustomer.phone || "No phone"}</p>
                                            {selectedCustomer.email && <p>📧 {escape(selectedCustomer.email)}</p>}
                                            {selectedCustomer.address && (
                                                <p className="line-clamp-2">📍 {escape(selectedCustomer.address)}</p>
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
                                                    <p className="text-xs text-purple-700 mt-0.5">
                                                        {escape(selectedVehicle.vehicle_number)}
                                                    </p>
                                                    {selectedVehicle.current_mileage && (
                                                        <p className="text-xs text-purple-600 mt-1">
                                                            Last: {selectedVehicle.current_mileage} km
                                                        </p>
                                                    )}
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
                                    <CardTitle>Service Details</CardTitle>
                                    <CardDescription className="text-xs">Invoice and service info</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-sm">Invoice Date</Label>
                                    <Input
                                        type="date"
                                        {...register("invoice_date", { required: "Date is required" })}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Mileage (km)</Label>
                                    <Input
                                        type="number"
                                        {...register("mileage", { valueAsNumber: true })}
                                        placeholder="0"
                                        className="text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Mechanic Name</Label>
                                <Input
                                    {...register("mechanic_name")}
                                    placeholder="e.g. Prakash"
                                    className="text-sm"
                                />
                            </div>

                            {lastServiceData && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="font-medium text-xs text-blue-900 mb-1.5 flex items-center gap-1">
                                        <Info className="h-3 w-3" />
                                        Last Service
                                    </p>
                                    <div className="text-xs text-blue-700 space-y-0.5">
                                        <p>📅 {new Date(lastServiceData.invoice_date).toLocaleDateString()}</p>
                                        <p>🛣️ {lastServiceData.mileage} km</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Summary - Sticky on desktop */}
                    <div className="lg:sticky lg:top-6">
                        <Card className="shadow-lg border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Calculator className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">Invoice Summary</CardTitle>
                                        <CardDescription className="text-xs">Totals and payment</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Breakdown */}
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
                                        />
                                    </div>
                                </div>

                                {/* Grand Total */}
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-900">Grand Total</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            ₹{grandTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-sm">
                                            <CreditCard className="h-3.5 w-3.5" />
                                            Payment Status
                                        </Label>
                                        <Select
                                            value={watch("payment_status")}
                                            onValueChange={(val) => setValue("payment_status", val as 'paid' | 'unpaid' | 'partial')}
                                        >
                                            <SelectTrigger className="text-sm h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="paid">✅ Paid</SelectItem>
                                                <SelectItem value="unpaid">⏳ Unpaid</SelectItem>
                                                <SelectItem value="partial">💰 Partial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Payment Method</Label>
                                        <Select
                                            value={watch("payment_method")}
                                            onValueChange={(val) => setValue("payment_method", val)}
                                        >
                                            <SelectTrigger className="text-sm h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">💵 Cash</SelectItem>
                                                <SelectItem value="card">💳 Card</SelectItem>
                                                <SelectItem value="upi">📱 UPI</SelectItem>
                                                <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Amount Paid</Label>
                                        <Input
                                            type="number"
                                            {...register("paid_amount", { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className="text-sm font-semibold h-9"
                                        />
                                    </div>
                                </div>

                                {/* Balance */}
                                {balance > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-red-900">Balance Due</span>
                                            <span className="text-lg font-bold text-red-600">
                                                ₹{balance.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {balance < 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-xs text-amber-900">
                                                <p className="font-semibold">Overpayment</p>
                                                <p className="mt-0.5">Excess: ₹{Math.abs(balance).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Items (2 columns wide) */}
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
                            <Button
                                type="button"
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => append({
                                    description: "",
                                    quantity: 1,
                                    rate: 0,
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
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Quick Add Section */}
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
                                            description: part.name,
                                            quantity: 1,
                                            rate: part.default_rate || 0,
                                            unit: part.unit || 'No',
                                            category: part.category || 'General',
                                            item_type: 'part',
                                            amount: part.default_rate || 0
                                        })
                                        addRecentPart(part)
                                        toast.success(`Added ${part.name}`)
                                        setPartSearch("")
                                    }
                                }}
                                isLoading={isLoadingParts}
                                emptyMessage="Start typing to search parts"
                            />

                            {/* Recently Used Parts */}
                            <div className="pt-2">
                                <RecentlyUsedParts onPartSelect={handleRecentPartSelect} />
                            </div>
                        </div>

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
                                                <TableHead className="w-[35%] font-semibold">Description</TableHead>
                                                <TableHead className="w-[15%] font-semibold">Type</TableHead>
                                                <TableHead className="w-[12%] text-center font-semibold">Qty</TableHead>
                                                <TableHead className="w-[15%] text-right font-semibold">Rate</TableHead>
                                                <TableHead className="w-[18%] text-right font-semibold">Amount</TableHead>
                                                <TableHead className="w-[5%]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="md:table-row-group">
                                            {fields.map((field, index) => (
                                                <TableRow key={field.id} className="flex flex-col md:table-row hover:bg-gray-50 border-b md:border-none">
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Description:'] before:font-semibold md:before:content-none before:mr-2">
                                                        <Input
                                                            {...register(`items.${index}.description`, {
                                                                required: "Required"
                                                            })}
                                                            placeholder="Item name"
                                                            className={`text-sm h-9 ${errors.items?.[index]?.description ? "border-red-500" : ""}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Type:'] before:font-semibold md:before:content-none before:mr-2">
                                                        <Select
                                                            value={watch(`items.${index}.item_type`)}
                                                            onValueChange={(val: any) =>
                                                                setValue(`items.${index}.item_type`, val)
                                                            }
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
                                                            className="text-sm h-9 text-right"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 before:content-['Amount:'] before:font-semibold md:before:content-none before:mr-2 md:text-right">
                                                        <div className="font-semibold text-sm text-gray-900 px-2">
                                                            ₹{((watch(`items.${index}.quantity`) || 0) *
                                                                (watch(`items.${index}.rate`) || 0)).toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="flex justify-between items-center md:table-cell py-2 md:before:content-none">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-2 pt-2">
                            <Label className="text-sm font-medium">Additional Notes</Label>
                            <Textarea
                                {...register("notes")}
                                placeholder="Add any additional notes or comments..."
                                rows={3}
                                className="resize-none text-sm"
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
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            Clear Invoice Form
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to clear all fields? This will delete your draft and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsClearDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleClearConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Form
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Floating Action Button for Mobile/Quick Save */}
            <div className="fixed bottom-6 left-6 z-50 md:hidden">
                <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={createInvoice.isPending || updateInvoice.isPending}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-white"
                >
                    {createInvoice.isPending || updateInvoice.isPending ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <Save className="h-6 w-6" />
                    )}
                </Button>
            </div>
        </div>
    )
}