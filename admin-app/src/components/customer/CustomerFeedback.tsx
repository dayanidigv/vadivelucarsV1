import { useState } from 'react'
import { MessageSquare, Send, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CustomerFeedbackProps {
  customerId: string
  invoiceId?: string
}

export default function CustomerFeedback({ customerId, invoiceId }: CustomerFeedbackProps) {
  const [feedback, setFeedback] = useState({
    type: 'complaint' as 'complaint' | 'feedback',
    rating: 0,
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!feedback.subject.trim() || !feedback.message.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      // This would be a new API endpoint
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          invoice_id: invoiceId,
          ...feedback
        })
      })

      if (response.ok) {
        toast.success('Your feedback has been submitted successfully')
        setSubmitted(true)
        setFeedback({
          type: 'complaint',
          rating: 0,
          subject: '',
          message: ''
        })
      } else {
        toast.error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-4">
            Your feedback has been received. We'll get back to you soon.
          </p>
          <Button onClick={handleReset}>Submit Another Feedback</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback & Complaints
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type */}
          <div>
            <Label>Feedback Type</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={feedback.type === 'complaint' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedback(prev => ({ ...prev, type: 'complaint' }))}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                Complaint
              </Button>
              <Button
                type="button"
                variant={feedback.type === 'feedback' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedback(prev => ({ ...prev, type: 'feedback' }))}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                Feedback
              </Button>
            </div>
          </div>

          {/* Rating (for feedback) */}
          {feedback.type === 'feedback' && (
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= feedback.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={feedback.subject}
              onChange={(e) => setFeedback(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your feedback"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={feedback.message}
              onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please provide detailed feedback..."
              className="w-full min-h-[100px] p-3 border rounded-md resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground">
            <p>We value your feedback! Your input helps us improve our service.</p>
            <p>For urgent matters, please call us at 89036 26677.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
