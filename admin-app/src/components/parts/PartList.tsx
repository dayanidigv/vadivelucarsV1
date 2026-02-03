import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useParts, useDeletePart } from "@/hooks/useParts"
import { Loader2, Trash2, FileText, AlertTriangle, Package, Search, Plus, Wrench, Layers } from "lucide-react"
import { CreatePartDialog } from "./CreatePartDialog"
import { escape } from "lodash"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Button } from "@/components/ui/button"
import type { Part } from "@/types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { BackButton } from "../ui/BackButton"

export function PartList() {
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const { data, isLoading } = useParts(undefined, page)
    const deletePart = useDeletePart()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [partToDelete, setPartToDelete] = useState<Part | null>(null)

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-gray-500">Loading parts catalog...</p>
            </div>
        )
    }

    const parts = data?.data || []
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    // Client-side filtering for now
    const filteredParts = parts.filter((part: Part) =>
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const confirmDelete = (part: Part) => {
        setPartToDelete(part)
        setIsDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (partToDelete) {
            await deletePart.mutateAsync(partToDelete.id)
            setIsDeleteDialogOpen(false)
            setPartToDelete(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Parts Catalog</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage inventory items and services</p>
                    </div>
                </div>
                <CreatePartDialog
                    trigger={
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    }
                />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Items</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Parts</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{parts.filter((p: Part) => p.is_active).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Layers className="h-6 w-6 text-purple-600" />
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
                        placeholder="Search by name or category..."
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
                                <TableHead className="font-semibold text-gray-900">Name</TableHead>
                                <TableHead className="font-semibold text-gray-900">Category</TableHead>
                                <TableHead className="font-semibold text-gray-900">Unit</TableHead>
                                <TableHead className="font-semibold text-gray-900 text-right">Default Rate</TableHead>
                                <TableHead className="font-semibold text-gray-900 text-center">Status</TableHead>
                                <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredParts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">No items found</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {searchQuery ? "Try adjusting your search" : "Get started by adding your first item"}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredParts.map((part: Part) => (
                                    <TableRow key={part.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                                                    {part.category === 'Labor' ? <Wrench className="h-4 w-4 text-gray-500" /> : <Package className="h-4 w-4 text-gray-500" />}
                                                </div>
                                                {escape(part.name)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                                                {part.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{part.unit}</TableCell>
                                        <TableCell className="text-right font-medium">₹{part.default_rate}</TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${part.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {part.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <CreatePartDialog
                                                    partToEdit={part}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => confirmDelete(part)}
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
            {filteredParts.length > 0 && (
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
                            Delete Item
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{partToDelete?.name}</span>?
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
                            onClick={handleDelete}
                            disabled={deletePart.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deletePart.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Item
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
