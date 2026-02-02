import { Context } from 'hono'
import { getSupabaseClient } from '../lib/supabase'
import { getCurrentCustomer } from '../middleware/customerAuth'

// Validation functions
const validateRating = (rating: number) => {
  return typeof rating === 'number' && rating >= 1 && rating <= 5
}

const validateFeedbackText = (text: string) => {
  return typeof text === 'string' && text.length <= 1000
}

// Submit customer feedback
export async function submitFeedback(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const body = await c.req.json()
    const supabase = getSupabaseClient(c.env)

    const { rating, feedback_text } = body

    // Validate rating
    if (!validateRating(rating)) {
      return c.json({
        success: false,
        message: 'Rating must be between 1 and 5'
      }, 400)
    }

    // Validate feedback text (optional)
    if (feedback_text && !validateFeedbackText(feedback_text)) {
      return c.json({
        success: false,
        message: 'Feedback text must be less than 1000 characters'
      }, 400)
    }

    // Check for duplicate feedback (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: existingFeedback } = await supabase
      .from('customer_feedback')
      .select('id')
      .eq('customer_id', customer.customerId)
      .gte('created_at', yesterday.toISOString())
      .single()

    if (existingFeedback) {
      return c.json({
        success: false,
        message: 'You have already submitted feedback in the last 24 hours'
      }, 400)
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('customer_feedback')
      .insert({
        customer_id: customer.customerId,
        rating,
        feedback_text: feedback_text || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        id,
        rating,
        feedback_text,
        created_at,
        customer:customers(name, phone)
      `)
      .single()

    if (error) {
      console.error('Feedback submission error:', error)
      return c.json({ 
        success: false, 
        message: 'Failed to submit feedback' 
      }, 500)
    }

    return c.json({
      success: true,
      message: 'Thank you for your feedback!',
      data
    })

  } catch (error) {
    console.error('Feedback submission error:', error)
    return c.json({ 
      success: false, 
      message: 'Internal server error' 
    }, 500)
  }
}

// Get customer feedback history
export async function getFeedbackHistory(c: Context) {
  try {
    const customer = getCurrentCustomer(c)
    const supabase = getSupabaseClient(c.env)

    const { data, error } = await supabase
      .from('customer_feedback')
      .select(`
        id,
        rating,
        feedback_text,
        created_at,
        updated_at
      `)
      .eq('customer_id', customer.customerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Feedback history error:', error)
      return c.json({ 
        success: false, 
        message: 'Failed to fetch feedback history' 
      }, 500)
    }

    return c.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Feedback history error:', error)
    return c.json({ 
      success: false, 
      message: 'Internal server error' 
    }, 500)
  }
}

// Get feedback statistics (for admin dashboard)
export async function getFeedbackStats(c: Context) {
  try {
    const supabase = getSupabaseClient(c.env)

    // Get overall statistics
    const { data: stats, error: statsError } = await supabase
      .from('customer_feedback')
      .select('rating')

    if (statsError) {
      console.error('Feedback stats error:', statsError)
      return c.json({ 
        success: false, 
        message: 'Failed to fetch feedback statistics' 
      }, 500)
    }

    // Calculate statistics
    const totalFeedback = stats?.length || 0
    const averageRating = totalFeedback > 0 
      ? stats.reduce((sum, item) => sum + item.rating, 0) / totalFeedback 
      : 0

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }

    stats?.forEach(item => {
      ratingDistribution[item.rating as keyof typeof ratingDistribution]++
    })

    // Get recent feedback
    const { data: recentFeedback, error: recentError } = await supabase
      .from('customer_feedback')
      .select(`
        rating,
        feedback_text,
        created_at,
        customer:customers(name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('Recent feedback error:', recentError)
      return c.json({ 
        success: false, 
        message: 'Failed to fetch recent feedback' 
      }, 500)
    }

    return c.json({
      success: true,
      data: {
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        recentFeedback
      }
    })

  } catch (error) {
    console.error('Feedback stats error:', error)
    return c.json({ 
      success: false, 
      message: 'Internal server error' 
    }, 500)
  }
}
