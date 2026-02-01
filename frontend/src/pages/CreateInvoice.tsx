import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { Plus, Trash2, Search, Save, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useSearchCustomers } from "@/hooks/useCustomers"
import { useSearchParts } from "@/hooks/useParts"
import { useCreateInvoice, useUpdateInvoice, useInvoice } from "@/hooks/useInvoices"
import { toast } from "sonner"

type InvoiceFormValues = {
    customer_id: string
    vehicle_id: string
    mileage: number
    mechanic_name: string
    payment_method: string
    payment_status: 'paid' | 'unpaid' | 'partial'
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

    // Queries
    const { data: searchResults } = useSearchCustomers(customerSearch)
    const { data: partResults } = useSearchParts(partSearch)

    const { register, control, handleSubmit, watch, setValue, reset } = useForm<InvoiceFormValues>({
        defaultValues: {
            mileage: 0,
            payment_status: 'unpaid',
            payment_method: 'cash',
            paid_amount: 0,
            discount_amount: 0,
            items: [{ description: "", quantity: 1, rate: 0, amount: 0, item_type: 'part', unit: 'No', category: 'General' }]
        }
    })

    // Load existing data if editing
    useEffect(() => {
        if (isEditMode && existingInvoice?.data) {
            const invoice = existingInvoice.data
            setSelectedCustomer(invoice.customer)

            reset({
                customer_id: invoice.customer_id,
                vehicle_id: invoice.vehicle_id,
                mileage: invoice.mileage,
                mechanic_name: invoice.mechanic_name,
                payment_method: invoice.payment_method,
                payment_status: invoice.payment_status,
                paid_amount: invoice.paid_amount,
                discount_amount: invoice.discount_amount,
                notes: invoice.notes,
                items: invoice.items.map((i: any) => ({
                    ...i,
                    // Ensure numbers are numbers
                    quantity: Number(i.quantity),
                    rate: Number(i.rate),
                    amount: Number(i.amount)
                }))
            })
        }
    }, [isEditMode, existingInvoice, reset])

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    })

    const items = watch("items")
    const discount = watch("discount_amount") || 0
    const paid = watch("paid_amount") || 0

    // Calculations
    const partsTotal = items
        .filter((i: any) => i.item_type === 'part')
        .reduce((sum: number, i: any) => sum + (Number(i.quantity) * Number(i.rate)), 0)

    const laborTotal = items
        .filter((i: any) => i.item_type === 'labor')
        .reduce((sum: number, i: any) => sum + (Number(i.quantity) * Number(i.rate)), 0)

    const grandTotal = partsTotal + laborTotal - Number(discount)
    const balance = grandTotal - Number(paid)

    const onSubmit = (data: InvoiceFormValues) => {
        if (!data.customer_id || !data.vehicle_id) {
            toast.error("Please select a customer and vehicle")
            return
        }

        const formattedData = {
            ...data,
            items: data.items.map(i => ({
                ...i,
                quantity: Number(i.quantity),
                rate: Number(i.rate),
                amount: Number(i.quantity) * Number(i.rate)
            }))
        }

        if (isEditMode) {
            updateInvoice.mutate({ id: id as string, data: formattedData }, {
                onSuccess: () => {
                    toast.success("Invoice updated successfully")
                    navigate("/invoices")
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to update invoice")
                }
            })
        } else {
            createInvoice.mutate(formattedData, {
                onSuccess: () => {
                    toast.success("Invoice created successfully")
                    navigate("/invoices")
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to create invoice")
                }
            })
        }
    }

    // Effect to update item amounts when quantity/rate changes
    useEffect(() => {
        items.forEach((item: any, index: number) => {
            const amount = Number(item.quantity) * Number(item.rate)
            if (item.amount !== amount) {
                setValue(`items.${index}.amount`, amount)
            }
        })
    }, [items, setValue])

    if (isEditMode && isLoadingInvoice) {
        return <div className="p-8 text-center">Loading invoice details...</div>
    }

    return (
        <div className="space-y-6 max-w-10xl mx-auto pb-10 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">{isEditMode ? "Edit Invoice" : "New Invoice"}</h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    {isEditMode && (
                        <Button size="xl" variant="outline" onClick={() => window.open(`/invoices/${id}/print`, '_blank')} className="flex-1 sm:flex-none">
                            <Printer /> Print
                        </Button>
                    )}
                    <Button size="xl" onClick={handleSubmit(onSubmit)} disabled={createInvoice.isPending || updateInvoice.isPending} className="flex-1 sm:flex-none">
                        {createInvoice.isPending || updateInvoice.isPending ? "Saving..." : <><Save /> Save Invoice</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer & Vehicle Selection */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Customer Search</Label>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <Search className="mr-2 h-4 w-4" />
                                        {selectedCustomer ? selectedCustomer.name : "Search customer..."}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="p-0">
                                    <Command shouldFilter={false}>
                                        <CommandInput placeholder="Search by name or phone..." onValueChange={setCustomerSearch} />
                                        <CommandList>
                                            <CommandEmpty>No customer found.</CommandEmpty>
                                            <CommandGroup heading="Customers">
                                                {searchResults?.data.customers.map((c: any) => (
                                                    <CommandItem
                                                        key={c.id}
                                                        onSelect={() => {
                                                            setSelectedCustomer(c)
                                                            setValue("customer_id", c.id)
                                                            // Auto-select first vehicle if exists
                                                            if (c.vehicles && c.vehicles.length > 0) {
                                                                setValue("vehicle_id", c.vehicles[0].id)
                                                            }
                                                        }}
                                                    >
                                                        <div>
                                                            <p className="font-medium">{c.name}</p>
                                                            <p className="text-xs text-gray-500">{c.phone}</p>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {selectedCustomer && (
                            <>
                                <div className="p-3 bg-gray-50 rounded-md text-sm">
                                    <p className="font-medium">{selectedCustomer.name}</p>
                                    <p>{selectedCustomer.phone}</p>
                                    <p className="text-gray-500">{selectedCustomer.address}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Vehicle</Label>
                                    <Select onValueChange={(val) => setValue("vehicle_id", val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCustomer.vehicles && selectedCustomer.vehicles.map((v: any) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.vehicle_number} - {v.model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label>Current Mileage</Label>
                            <Input type="number" {...register("mileage")} />
                        </div>

                        <div className="space-y-2">
                            <Label>Mechanic Name</Label>
                            <Input {...register("mechanic_name")} placeholder="e.g. Raju" />
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Items */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Items & Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-2 md:grid-cols-12 gap-2 items-end border-b pb-4">
                                    <div className="col-span-2 md:col-span-5">
                                        <Label className="text-xs">Description</Label>
                                        <Input {...register(`items.${index}.description`)} placeholder="Item name" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <Label className="text-xs">Type</Label>
                                        <Select
                                            defaultValue={field.item_type}
                                            onValueChange={(val: any) => setValue(`items.${index}.item_type`, val)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="part">Part</SelectItem>
                                                <SelectItem value="labor">Labor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-1 md:col-span-1">
                                        <Label className="text-xs">Qty</Label>
                                        <Input type="number" step="0.1" {...register(`items.${index}.quantity`)} className="h-9" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <Label className="text-xs">Rate</Label>
                                        <Input type="number" {...register(`items.${index}.rate`)} className="h-9" />
                                    </div>
                                    <div className="col-span-1 md:col-span-1">
                                        <Label className="text-xs">Total</Label>
                                        <div className="h-9 flex items-center text-sm font-medium">
                                            ₹{Number((watch(`items.${index}.quantity`) * watch(`items.${index}.rate`)) || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 h-9 w-9 hover:bg-red-50"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="mt-4 w-full sm:w-auto"
                            onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0, item_type: 'part', unit: 'No', category: 'General' })}
                        >
                            <Plus /> Add Item
                        </Button>

                        {/* Quick Part Add */}
                        <div className="mt-6 pt-6 border-t">
                            <Label className="mb-2 block">Quick Add Part from Catalog</Label>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="lg" variant="secondary" className="w-full justify-start">
                                        <Search /> Search Parts Catalog...
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <Command shouldFilter={false}>
                                        <CommandInput placeholder="Search parts..." onValueChange={setPartSearch} />
                                        <CommandList>
                                            <CommandEmpty>No parts found.</CommandEmpty>
                                            <CommandGroup heading="Parts">
                                                {partResults?.data.map((p: any) => (
                                                    <CommandItem
                                                        key={p.id}
                                                        onSelect={() => {
                                                            append({
                                                                part_id: p.id,
                                                                description: p.name,
                                                                quantity: 1,
                                                                rate: p.default_rate,
                                                                unit: p.unit,
                                                                category: p.category,
                                                                item_type: 'part',
                                                                amount: p.default_rate
                                                            })
                                                            setPartSearch("")
                                                        }}
                                                    >
                                                        <div className="flex justify-between w-full">
                                                            <div>
                                                                <p className="font-medium">{p.name}</p>
                                                                <p className="text-xs text-gray-500">{p.category}</p>
                                                            </div>
                                                            <p className="font-medium">₹{p.default_rate.toFixed(2)}</p>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Totals & Payment */}
                <div className="p-4 border rounded-lg space-y-4 h-fit bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold">Summary</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Parts Total</span>
                            <span>₹{partsTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Labor Total</span>
                            <span>₹{laborTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Discount</span>
                            <Input
                                type="number"
                                className="w-20 text-right h-8"
                                {...register("discount_amount")}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Grand Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="space-y-1">
                            <Label>Payment Status</Label>
                            <Select onValueChange={(val) => setValue("payment_status", val as 'paid' | 'unpaid' | 'partial')} defaultValue="unpaid">
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Amount Paid</Label>
                            <Input
                                type="number"
                                {...register("paid_amount")}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between font-bold text-red-500 border-t pt-2">
                        <span>Balance Due</span>
                        <span>₹{balance.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

