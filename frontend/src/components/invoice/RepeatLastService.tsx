import { RotateCcw, Calendar, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLastService } from '@/hooks/useLastService'

interface RepeatLastServiceProps {
  customerId?: string
  vehicleId?: string
  onRepeatService: (items: any[]) => void
}

export default function RepeatLastService({ 
  customerId, 
  vehicleId, 
  onRepeatService 
}: RepeatLastServiceProps) {
  const { lastService, loading, repeatLastService } = useLastService(customerId, vehicleId)

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Loading last service...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!lastService) {
    return null
  }

  const handleRepeat = () => {
    const items = repeatLastService()
    onRepeatService(items)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
          <RotateCcw className="w-4 h-4" />
          Repeat Last Service
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Service Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{formatDate(lastService.created_at)}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {lastService.items.length} items
            </Badge>
          </div>

          {/* Total Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Total:</span>
            <div className="flex items-center gap-1 font-medium">
              <IndianRupee className="w-4 h-4" />
              {lastService.total_amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Items Preview */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Items:</div>
            <div className="flex flex-wrap gap-1">
              {lastService.items.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item.part_name} ({item.quantity})
                </Badge>
              ))}
              {lastService.items.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{lastService.items.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Repeat Button */}
          <Button
            onClick={handleRepeat}
            className="w-full"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Repeat This Service
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
