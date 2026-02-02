import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers"
import { Loader2, Trash2, FileText, AlertTriangle } from "lucide-react"
import { CreateCustomerDialog } from "./CreateCustomerDialog"
import { useState } from "react"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function CustomerList() {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useCustomers(page)
    const deleteCustomer = useDeleteCustomer()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<any>(null)

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        )
    }

    const customers = data?.data || []
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    const confirmDelete = (customer: any) => {
        setCustomerToDelete(customer)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (customerToDelete) {
            await deleteCustomer.mutateAsync(customerToDelete.id)
            setIsDeleteDialogOpen(false)
            setCustomerToDelete(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
                <CreateCustomerDialog />
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
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
                                                onClick={() => confirmDelete(customer)}
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

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-medium text-foreground">{customerToDelete?.name}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {customerToDelete?.vehicles?.length > 0 && (
                        <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">Warning: Associated Vehicles</p>
                                    <p className="mt-1">
                                        This customer has <strong>{customerToDelete.vehicles.length} vehicle(s)</strong> associated with them.
                                        Deleting this customer might cause data inconsistencies if invoices exist for these vehicles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteCustomer.isPending}
                        >
                            {deleteCustomer.isPending ? "Deleting..." : "Delete Customer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
