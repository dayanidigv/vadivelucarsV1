import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Trash2, Edit, AlertTriangle, Users, Phone, Mail, MapPin, Car, Search, Plus } from "lucide-react"
import { CreateCustomerDialog } from "./CreateCustomerDialog"
import { escape } from "lodash"
import { useState } from "react"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { auditLogger } from "@/lib/audit"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { BackButton } from "../ui/BackButton"

export function CustomerList() {
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const { data, isLoading } = useCustomers(page)
    const deleteCustomer = useDeleteCustomer()
    const { user: currentUser } = useAuth()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<any>(null)

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-gray-500">Loading customers...</p>
            </div>
        )
    }

    const customers = data?.data || []
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    const filteredCustomers = customers.filter((customer: any) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchQuery)) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const confirmDelete = (customer: any) => {
        setCustomerToDelete(customer)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (customerToDelete) {
            await deleteCustomer.mutateAsync(customerToDelete.id)

            auditLogger.log({
                action: 'DELETE_CUSTOMER',
                resource: 'customer',
                resourceId: customerToDelete.id,
                performedBy: currentUser?.username || 'unknown',
                severity: 'medium',
                changes: { name: customerToDelete.name }
            })

            setIsDeleteDialogOpen(false)
            setCustomerToDelete(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Customers</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your customer database</p>
                    </div>
                </div>
                <CreateCustomerDialog
                    trigger={
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                        </Button>
                    }
                />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Vehicles</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {customers.reduce((sum: number, c: any) => sum + (c.vehicles?.length || 0), 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Car className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Current Page</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{page} of {pagination.pages}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-green-600">{page}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                                <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                                <TableHead className="font-semibold text-gray-900">Location</TableHead>
                                <TableHead className="font-semibold text-gray-900 text-center">Vehicles</TableHead>
                                <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Users className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">No customers found</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {searchQuery ? "Try adjusting your search" : "Get started by adding your first customer"}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer: any) => (
                                    <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-semibold text-blue-600">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{escape(customer.name)}</p>
                                                    <p className="text-xs text-gray-500">ID: #{customer.id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                    <span className="text-gray-900">{customer.phone || "No phone"}</span>
                                                </div>
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-gray-600">{customer.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {customer.address ? (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600 line-clamp-2">{escape(customer.address)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                                <Car className="h-3 w-3" />
                                                {customer.vehicles?.length || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <CreateCustomerDialog
                                                    customerToEdit={customer}
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-red-50 hover:text-red-600"
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
            </div>

            {/* Pagination */}
            {filteredCustomers.length > 0 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={pagination.pages}
                    onPageChange={setPage}
                    hasNext={page < pagination.pages}
                    hasPrev={page > 1}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            Delete Customer
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{customerToDelete?.name}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {customerToDelete?.vehicles?.length > 0 && (
                        <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                            <div className="flex gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900">
                                    <p className="font-semibold">Warning: Associated Vehicles</p>
                                    <p className="mt-1 text-amber-800">
                                        This customer has <strong>{customerToDelete.vehicles.length} vehicle(s)</strong> associated with them.
                                        Deleting this customer might cause data inconsistencies if invoices exist for these vehicles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                            onClick={handleDelete}
                            disabled={deleteCustomer.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteCustomer.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Customer
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}