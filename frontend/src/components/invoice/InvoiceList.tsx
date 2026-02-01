
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices"
import { format } from "date-fns"
import { Plus, Trash2, FileText, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { PaginationControls } from "@/components/ui/pagination-controls"

export function InvoiceList() {
    const [page, setPage] = useState(1)
    const { data, isLoading, error } = useInvoices(page)
    const deleteInvoice = useDeleteInvoice()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        )
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error loading invoices</div>
    }

    const invoices = data?.data || []
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
                <Link to="/invoices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="p-2 m-2">
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice: any) => (
                                <TableRow key={invoice.id} className="mb-8">
                                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{invoice.customer?.name}</div>
                                        <div className="text-sm text-gray-500">{invoice.customer?.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{invoice.vehicle?.vehicle_number}</div>
                                        <div className="text-sm text-gray-500">{invoice.vehicle?.model}</div>
                                    </TableCell>
                                    <TableCell>{format(new Date(invoice.invoice_date), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="text-right font-medium">₹{Number(invoice.grand_total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.payment_status === "paid"
                                                ? "bg-green-100 text-green-800"
                                                : invoice.payment_status === "partial"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {invoice.payment_status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/invoices/${invoice.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this invoice?")) {
                                                        deleteInvoice.mutate(invoice.id)
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationControls
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={setPage}
                hasNext={page < pagination.pages}
                hasPrev={page > 1}
            />
        </div>
    )
}
