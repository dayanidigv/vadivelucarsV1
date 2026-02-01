
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers"
import { Loader2, Trash2, FileText } from "lucide-react"
import { CreateCustomerDialog } from "./CreateCustomerDialog"
import { useState } from "react"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Button } from "@/components/ui/button"

export function CustomerList() {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useCustomers(page)
    const deleteCustomer = useDeleteCustomer()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        )
    }

    const customers = data?.data || []
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
                <CreateCustomerDialog />
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Vehicles</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.email || "-"}</TableCell>
                                    <TableCell>{customer.address || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        {customer.vehicles?.length || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <CreateCustomerDialog
                                                customerToEdit={customer}
                                                trigger={
                                                    <Button variant="ghost" size="icon">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this customer?")) {
                                                        deleteCustomer.mutate(customer.id)
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
