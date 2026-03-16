import { useState, useEffect } from "react"
import { ArrowRightLeft, Search, Loader2, Check, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { Invoice, Estimation, InvoiceItem, EstimationItem } from "@/types"

type ImportSource = 'estimation' | 'invoice'

interface ImportedItem {
    part_id?: string
    part_number?: string
    description: string
    category: string
    item_type: 'part' | 'labor'
    quantity: number
    rate: number
    unit_price?: number
    unit: string
    amount: number
}

interface ImportItemsDialogProps {
    source: ImportSource
    onItemsImported: (items: ImportedItem[]) => void
    trigger?: React.ReactNode
}

export function ImportItemsDialog({ source, onItemsImported, trigger }: ImportItemsDialogProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [list, setList] = useState<(Invoice | Estimation)[]>([])
    const [selectedDoc, setSelectedDoc] = useState<Invoice | Estimation | null>(null)
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
    const [step, setStep] = useState<'select' | 'items'>('select')

    const label = source === 'estimation' ? 'Estimation' : 'Invoice'

    useEffect(() => {
        if (!open) return
        fetchList()
    }, [open])

    const fetchList = async () => {
        setIsLoading(true)
        try {
            if (source === 'estimation') {
                const res = await api.getEstimations(1, 50, undefined, true)
                setList(res.data || [])
            } else {
                const res = await api.getInvoices(1, 50, '', '', true)
                setList(res.data || [])
            }
        } catch {
            toast.error(`Failed to load ${label.toLowerCase()}s`)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelect = (doc: Invoice | Estimation) => {
        if (doc.items?.length) {
            setSelectedDoc(doc)
            setSelectedItems(new Set(doc.items.map((_, i) => i)))
            setStep('items')
        } else {
            toast.error(`No items found in this ${label.toLowerCase()}`)
        }
    }

    const toggleItem = (index: number) => {
        setSelectedItems(prev => {
            const next = new Set(prev)
            if (next.has(index)) next.delete(index)
            else next.add(index)
            return next
        })
    }

    const handleImport = () => {
        if (!selectedDoc?.items) return
        const items: ImportedItem[] = selectedDoc.items
            .filter((_, i) => selectedItems.has(i))
            .map(item => {
                if (source === 'estimation') {
                    const ei = item as EstimationItem
                    return {
                        part_id: ei.part_id,
                        description: ei.description,
                        category: ei.category || 'General',
                        item_type: ei.item_type || 'part',
                        quantity: ei.quantity,
                        rate: ei.rate,
                        unit_price: ei.rate,
                        unit: ei.unit || 'No',
                        amount: ei.amount,
                    }
                } else {
                    const ii = item as InvoiceItem
                    return {
                        part_id: ii.part_id,
                        part_number: '',
                        description: ii.description,
                        category: ii.category || 'General',
                        item_type: ii.item_type || 'part',
                        quantity: ii.quantity,
                        rate: ii.rate || ii.unit_price,
                        unit: ii.unit || 'No',
                        amount: ii.amount,
                    }
                }
            })

        onItemsImported(items)
        toast.success(`Imported ${items.length} item${items.length > 1 ? 's' : ''}`)
        resetAndClose()
    }

    const resetAndClose = () => {
        setOpen(false)
        setStep('select')
        setSelectedDoc(null)
        setSelectedItems(new Set())
        setSearch("")
        setList([])
    }

    const filteredList = list.filter(doc => {
        if (!search) return true
        const q = search.toLowerCase()
        const number = source === 'estimation'
            ? (doc as Estimation).estimation_number
            : (doc as Invoice).invoice_number
        const customerName = doc.customer?.name || ''
        const vehicleNumber = doc.vehicle?.vehicle_number || ''
        return number?.toLowerCase().includes(q)
            || customerName.toLowerCase().includes(q)
            || vehicleNumber.toLowerCase().includes(q)
    })

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true) }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button type="button" size="sm" variant="outline">
                        <ArrowRightLeft className="h-4 w-4 mr-1" />
                        Import from {label}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select'
                            ? `Select ${label} to Import Items`
                            : `Import Items from ${label}`
                        }
                    </DialogTitle>
                </DialogHeader>

                {step === 'select' && (
                    <div className="flex flex-col gap-3 flex-1 min-h-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={`Search ${label.toLowerCase()}s by number, customer, vehicle...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto border rounded-lg min-h-0 max-h-[50vh]">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : filteredList.length === 0 ? (
                                <div className="text-center py-12 text-sm text-gray-500">
                                    No {label.toLowerCase()}s found
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredList.map(doc => {
                                        const number = source === 'estimation'
                                            ? (doc as Estimation).estimation_number
                                            : (doc as Invoice).invoice_number
                                        const date = source === 'estimation'
                                            ? (doc as Estimation).estimation_date
                                            : (doc as Invoice).invoice_date
                                        return (
                                            <button
                                                key={doc.id}
                                                type="button"
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                                                onClick={() => handleSelect(doc)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium">{number}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {doc.customer?.name} • {doc.vehicle?.vehicle_number}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">₹{doc.grand_total?.toLocaleString('en-IN')}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {date ? new Date(date).toLocaleDateString('en-IN') : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 'items' && selectedDoc?.items && (
                    <div className="flex flex-col gap-3 flex-1 min-h-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="self-start -ml-2"
                            onClick={() => { setStep('select'); setSelectedDoc(null) }}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to list
                        </Button>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {selectedItems.size} of {selectedDoc.items.length} items selected
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (selectedItems.size === selectedDoc.items!.length) {
                                        setSelectedItems(new Set())
                                    } else {
                                        setSelectedItems(new Set(selectedDoc.items!.map((_, i) => i)))
                                    }
                                }}
                            >
                                {selectedItems.size === selectedDoc.items.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto border rounded-lg min-h-0 max-h-[40vh] divide-y">
                            {selectedDoc.items.map((item, index) => (
                                <label
                                    key={index}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedItems.has(index)}
                                        onCheckedChange={() => toggleItem(index)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.item_type === 'labor' ? 'Labor' : 'Part'} • Qty: {item.quantity} • Rate: ₹{item.rate?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-right whitespace-nowrap">
                                        ₹{item.amount?.toLocaleString('en-IN')}
                                    </p>
                                </label>
                            ))}
                        </div>

                        <Button
                            type="button"
                            onClick={handleImport}
                            disabled={selectedItems.size === 0}
                            className="w-full"
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Import {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
