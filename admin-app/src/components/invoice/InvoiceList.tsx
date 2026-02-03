import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    MoreHorizontal,
    Plus,
    Search,
    FileText,
    Printer,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    IndianRupee,
    Calendar,
    User,
    Car,
    X,
    TrendingUp,
    Clock
} from "lucide-react"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { useState, useMemo } from "react"
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function InvoiceList() {
    // State
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    // Data Fetching
    const { data: invoiceData, isLoading, error } = useInvoices(page, limit)
    const deleteInvoice = useDeleteInvoice()

    // Derived Data
    const invoices = invoiceData?.data || []
    const pagination = invoiceData?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    // Client-side filtering logic
    const filteredInvoices = useMemo(() => {
        let filtered = [...invoices]

        if (statusFilter !== "all") {
            filtered = filtered.filter((inv: any) => inv.payment_status === statusFilter)
        }

        if (search.trim()) {
            const query = search.toLowerCase()
            filtered = filtered.filter((inv: any) =>
                inv.invoice_number.toLowerCase().includes(query) ||
                inv.customer?.name.toLowerCase().includes(query) ||
                inv.vehicle?.vehicle_number.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [invoices, search, statusFilter])

    // Stats calculation
    const stats = useMemo(() => {
        const total = invoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.grand_total || 0), 0)
        const paid = invoices.filter((inv: any) => inv.payment_status === 'paid').length
        const unpaid = invoices.filter((inv: any) => inv.payment_status === 'unpaid' || inv.payment_status === 'pending').length
        const partial = invoices.filter((inv: any) => inv.payment_status === 'partial').length

        return { total, paid, unpaid, partial, count: invoices.length }
    }, [invoices])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Error loading invoices</p>
                <p className="text-sm text-gray-500 mt-1">Please try again</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all your billing transactions</p>
                </div>
                <Link to="/invoices/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Invoice
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    ₹{stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Paid</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Unpaid</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{stats.unpaid}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Partial</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.partial}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <IndianRupee className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <Card className="border-0 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by invoice #, customer name, or vehicle..."
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

                        {/* Status Filter Tabs */}
                        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full lg:w-auto">
                            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                                <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                    All
                                </TabsTrigger>
                                <TabsTrigger value="paid" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                                    Paid
                                </TabsTrigger>
                                <TabsTrigger value="unpaid" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                                    Unpaid
                                </TabsTrigger>
                                <TabsTrigger value="partial" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                                    Partial
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>

            {/* Table Card */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold text-gray-900">Invoice #</TableHead>
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
                                ) : filteredInvoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900">No invoices found</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {search || statusFilter !== "all"
                                                        ? "Try adjusting your filters"
                                                        : "Create your first invoice to get started"}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvoices.map((invoice: any) => (
                                        <TableRow key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-mono text-sm font-semibold text-gray-900">
                                                        #{invoice.invoice_number}
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
                                                            {invoice.customer?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {invoice.customer?.phone}
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
                                                            {invoice.vehicle?.vehicle_number}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {invoice.vehicle?.model}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {format(new Date(invoice.invoice_date), "MMM d, yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <IndianRupee className="h-4 w-4 text-gray-600" />
                                                    <span className="font-bold text-gray-900">
                                                        {parseFloat(invoice.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`font-medium ${invoice.payment_status === 'paid'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : invoice.payment_status === 'unpaid' || invoice.payment_status === 'pending'
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                        }`}
                                                >
                                                    {invoice.payment_status === 'pending' ? 'Unpaid' : invoice.payment_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/invoices/${invoice.id}`}>
                                                        <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:bg-green-50 hover:text-green-600"
                                                        onClick={() => window.open(`/invoices/${invoice.id}/print`, '_blank')}
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <Link to={`/invoices/${invoice.id}`}>
                                                                <DropdownMenuItem>
                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                            </Link>
                                                            <DropdownMenuItem onClick={() => window.open(`/invoices/${invoice.id}/print`, '_blank')}>
                                                                <Printer className="mr-2 h-4 w-4" />
                                                                Print Invoice
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download PDF
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                onClick={() => {
                                                                    if (confirm("Delete this invoice? This action cannot be undone.")) {
                                                                        deleteInvoice.mutate(String(invoice.id))
                                                                    }
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
                        Showing <span className="font-semibold text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
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
        </div>
    )
}