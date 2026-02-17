import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    MoreHorizontal, Plus, Search, FileText, Printer, Trash2,
    ChevronLeft, ChevronRight, Download, Eye, IndianRupee,
    Calendar, User, Car, X, ClipboardList, Send, ArrowRightLeft, Clock, CheckCircle, AlertTriangle
} from "lucide-react"
import { format } from "date-fns"
import { Link, useNavigate } from "react-router-dom"
import { useState, useMemo } from "react"
import { useEstimations, useDeleteEstimation, useUpdateEstimationStatus, useConvertToInvoice } from "@/hooks/useEstimations"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Estimation } from "@/types"
import { pdf } from "@react-pdf/renderer"
import EstimationPDF from "@/components/estimation/EstimationPDF"
import { toast } from "sonner"
import { api } from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const statusConfig: Record<string, { color: string; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-700 hover:bg-gray-200', label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', label: 'Sent' },
    accepted: { color: 'bg-green-100 text-green-700 hover:bg-green-200', label: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-700 hover:bg-red-200', label: 'Rejected' },
    converted: { color: 'bg-purple-100 text-purple-700 hover:bg-purple-200', label: 'Converted' },
}

export function EstimationList() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [estimationToDelete, setEstimationToDelete] = useState<Estimation | null>(null)

    const { data: estimationData, isLoading, error } = useEstimations(page, limit)
    const deleteEstimation = useDeleteEstimation()
    const updateStatus = useUpdateEstimationStatus()
    const convertToInvoice = useConvertToInvoice()

    const handleDownloadPDF = async (estimation: Estimation) => {
        try {
            const response = await api.getEstimation(String(estimation.id))
            if (!response?.data) {
                toast.error("Failed to load estimation details")
                return
            }
            const full = response.data

            const blob = await pdf(<EstimationPDF estimation={full} />).toBlob()
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `Estimation-${full.customer?.name || 'Unknown'}-${full.estimation_number}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            toast.success("Estimation downloaded successfully")
        } catch (error) {
            console.error("Error downloading PDF:", error)
            toast.error("Failed to download estimation")
        }
    }

    const handleStatusChange = async (estimation: Estimation, newStatus: string, label: string) => {
        try {
            await updateStatus.mutateAsync({ id: estimation.id, status: newStatus })
            toast.success(`Estimation marked as ${label}`)
        } catch { /* error handled in hook */ }
    }

    const handleConvert = async (estimation: Estimation) => {
        if (estimation.status !== 'accepted') return
        if (!confirm("Convert this estimation to an invoice? This action cannot be undone.")) return
        try {
            const result = await convertToInvoice.mutateAsync(estimation.id)
            toast.success("Estimation converted to invoice")
            if (result?.data?.invoice_id) {
                navigate(`/invoices/${result.data.invoice_id}`)
            }
        } catch { /* error handled in hook */ }
    }

    const estimations = estimationData?.data || []
    const pagination = estimationData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    const filteredEstimations = useMemo(() => {
        let filtered = [...estimations]

        if (statusFilter !== "all") {
            filtered = filtered.filter((est: Estimation) => est.status === statusFilter)
        }

        if (search.trim()) {
            const query = search.toLowerCase()
            filtered = filtered.filter((est: Estimation) =>
                est.estimation_number?.toLowerCase().includes(query) ||
                est.customer?.name?.toLowerCase().includes(query) ||
                est.vehicle?.vehicle_number?.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [estimations, search, statusFilter])

    const stats = useMemo(() => {
        const total = estimations.reduce((sum: number, est: Estimation) => sum + parseFloat(String(est.grand_total || 0)), 0)
        const pending = estimations.filter((est: Estimation) => est.status === 'draft' || est.status === 'sent').length
        const accepted = estimations.filter((est: Estimation) => est.status === 'accepted').length
        const converted = estimations.filter((est: Estimation) => est.status === 'converted').length

        return { total, pending, accepted, converted, count: estimations.length }
    }, [estimations])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Error loading estimations</p>
                <p className="text-sm text-gray-500 mt-1">Please try again</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Estimations</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage spare parts quotations and estimates</p>
                </div>
                <Link to="/estimations/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Estimation
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Value</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    ₹{stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <IndianRupee className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Accepted</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Converted</p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.converted}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ArrowRightLeft className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by estimation #, customer name, or vehicle..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full lg:w-auto">
                            <TabsList className="flex w-full overflow-x-auto lg:w-auto">
                                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-shrink-0">All</TabsTrigger>
                                <TabsTrigger value="draft" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white flex-shrink-0">Draft</TabsTrigger>
                                <TabsTrigger value="sent" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex-shrink-0">Sent</TabsTrigger>
                                <TabsTrigger value="accepted" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex-shrink-0">Accepted</TabsTrigger>
                                <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex-shrink-0">Rejected</TabsTrigger>
                                <TabsTrigger value="converted" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex-shrink-0">Converted</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold text-gray-900">Estimation #</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Vehicle</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                                    <TableHead className="font-semibold text-gray-900 text-right">Amount</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                    <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={7} className="h-20">
                                                <div className="flex items-center gap-4 animate-pulse">
                                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                                                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredEstimations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <ClipboardList className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900">No estimations found</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {search || statusFilter !== "all"
                                                        ? "Try adjusting your filters"
                                                        : "Create your first estimation to get started"}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEstimations.map((estimation: Estimation) => (
                                        <TableRow key={estimation.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <ClipboardList className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-mono text-sm font-semibold text-gray-900">
                                                        {estimation.estimation_number}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <User className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-gray-900">
                                                            {(estimation.customer?.name)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {estimation.customer?.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Car className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                                            {(estimation.vehicle?.vehicle_number)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {(estimation.vehicle?.model)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {estimation.estimation_date ? format(new Date(estimation.estimation_date), "MMM d, yyyy") : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <IndianRupee className="h-4 w-4 text-gray-600" />
                                                    <span className="font-bold text-gray-900">
                                                        {Number(estimation.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`font-medium ${statusConfig[estimation.status]?.color || ''}`}>
                                                    {statusConfig[estimation.status]?.label || estimation.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/estimations/${estimation.id}`}>
                                                        <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600" aria-label="View estimation">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:bg-green-50 hover:text-green-600"
                                                        onClick={() => window.open(`/estimations/${estimation.id}/print`, '_blank')}
                                                        aria-label="Print estimation"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-52">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <Link to={`/estimations/${estimation.id}`}>
                                                                <DropdownMenuItem>
                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <DropdownMenuItem onClick={() => window.open(`/estimations/${estimation.id}/print`, '_blank')}>
                                                                <Printer className="mr-2 h-4 w-4" />
                                                                Print
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDownloadPDF(estimation)}>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download PDF
                                                            </DropdownMenuItem>
                                                            {/* Status transitions based on current status */}
                                                            {estimation.status === 'draft' && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(estimation, 'sent', 'Sent')}>
                                                                    <Send className="mr-2 h-4 w-4" />
                                                                    Mark as Sent
                                                                </DropdownMenuItem>
                                                            )}
                                                            {estimation.status === 'sent' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(estimation, 'accepted', 'Accepted')}>
                                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                        Mark as Accepted
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(estimation, 'rejected', 'Rejected')}>
                                                                        <X className="mr-2 h-4 w-4 text-red-600" />
                                                                        Mark as Rejected
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {estimation.status === 'accepted' && (
                                                                <DropdownMenuItem onClick={() => handleConvert(estimation)}>
                                                                    <ArrowRightLeft className="mr-2 h-4 w-4 text-purple-600" />
                                                                    Convert to Invoice
                                                                </DropdownMenuItem>
                                                            )}
                                                            {estimation.status === 'converted' && estimation.converted_invoice_id && (
                                                                <Link to={`/invoices/${estimation.converted_invoice_id}`}>
                                                                    <DropdownMenuItem>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        View Invoice
                                                                    </DropdownMenuItem>
                                                                </Link>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                onClick={() => {
                                                                    setEstimationToDelete(estimation)
                                                                    setIsDeleteDialogOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                        <span className="font-semibold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                        <span className="font-semibold text-gray-900">{pagination.total}</span> entries
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows:</span>
                        <Select
                            value={String(limit)}
                            onValueChange={(v) => {
                                setLimit(Number(v))
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="h-9 w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">
                            Page <span className="font-semibold text-gray-900">{page}</span> of{' '}
                            <span className="font-semibold text-gray-900">{pagination.pages}</span>
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        disabled={page >= pagination.pages || isLoading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            Delete Estimation
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete estimation{' '}
                            <span className="font-semibold text-gray-900">{estimationToDelete?.estimation_number}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="sm:mr-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (estimationToDelete) {
                                    deleteEstimation.mutate(String(estimationToDelete.id))
                                    setIsDeleteDialogOpen(false)
                                    setEstimationToDelete(null)
                                }
                            }}
                            disabled={deleteEstimation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Estimation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
