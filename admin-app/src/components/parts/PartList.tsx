
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useParts, useDeletePart } from "@/hooks/useParts"
import { Loader2, Trash2, FileText } from "lucide-react"
import { CreatePartDialog } from "./CreatePartDialog"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Button } from "@/components/ui/button"

export function PartList() {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useParts(undefined, page)
    const deletePart = useDeletePart()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        )
    }

    const parts = data?.data || []
    const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Parts Catalog</h2>
                <CreatePartDialog />
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Default Rate</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No parts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            parts.map((part: any) => (
                                <TableRow key={part.id}>
                                    <TableCell className="font-medium">{part.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{part.category}</Badge>
                                    </TableCell>
                                    <TableCell>{part.unit}</TableCell>
                                    <TableCell className="text-right">₹{part.default_rate}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`inline-block w-2 h-2 rounded-full ${part.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <CreatePartDialog
                                                partToEdit={part}
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
                                                    if (confirm("Are you sure you want to delete this part?")) {
                                                        deletePart.mutate(part.id)
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
