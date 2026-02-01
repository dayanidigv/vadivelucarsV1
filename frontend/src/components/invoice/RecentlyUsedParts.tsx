import { Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRecentlyUsedParts } from '@/hooks/useRecentlyUsedParts'

interface RecentlyUsedPartsProps {
  onPartSelect: (part: any) => void
}

export default function RecentlyUsedParts({ onPartSelect }: RecentlyUsedPartsProps) {
  const { recentParts, clearRecentParts } = useRecentlyUsedParts()

  if (recentParts.length === 0) {
    return null
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recently Used Parts
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentParts}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {recentParts.map((part) => (
            <Button
              key={part.id}
              variant="outline"
              size="sm"
              onClick={() => onPartSelect(part)}
              className="h-auto p-2 justify-start text-left"
            >
              <div className="flex flex-col items-start">
                <span className="font-medium text-xs">{part.name}</span>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {part.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ₹{part.price}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
