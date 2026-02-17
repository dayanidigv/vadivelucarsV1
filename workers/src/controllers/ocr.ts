import { Hono } from 'hono'
import { Env } from '../lib/supabase'

type Bindings = Env

const ocr = new Hono<{ Bindings: Bindings }>()

interface ExtractedItem {
    description: string
    quantity: number
    rate: number
}

// Track whether we've accepted the Llama 3.2 Vision license for this isolate
let llamaLicenseAccepted = false

function parseItemsFromText(text: string): ExtractedItem[] {
    if (!text) return []
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return []
    try {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed
            .filter((item: any) => item.description)
            .map((item: any) => ({
                description: String(item.description || '').trim(),
                quantity: Number(item.quantity) || 1,
                rate: Number(item.rate) || 0,
            }))
    } catch {
        return []
    }
}

/**
 * POST /api/ocr/extract-items
 * Accepts a base64-encoded image and uses Cloudflare Workers AI
 * to extract invoice/estimation line items (description, quantity, rate).
 */
ocr.post('/extract-items', async (c) => {
    try {
        const body = await c.req.json()
        const { image } = body

        if (!image) {
            return c.json({ success: false, error: 'No image provided' }, 400)
        }

        const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
        const imageBytes = Uint8Array.from(atob(base64Data), (ch) => ch.charCodeAt(0))

        let items: ExtractedItem[] = []

        // Strategy 1: Llama 3.2 Vision (best quality)
        try {
            // Accept license on first use in this isolate
            if (!llamaLicenseAccepted) {
                try {
                    await c.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
                        prompt: 'agree',
                        max_tokens: 1,
                    })
                } catch (licenseErr: any) {
                    // The API throws an error with "Thank you for agreeing" — that means it worked
                    if (licenseErr.message?.includes('agreeing') || licenseErr.message?.includes('Thank you')) {
                        // License accepted successfully
                    } else {
                        throw licenseErr // Re-throw actual errors
                    }
                }
                llamaLicenseAccepted = true
            }

            const response = await c.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
                image: [...imageBytes],
                prompt: `You are an invoice OCR assistant. Read this image carefully and extract all line items.

For each item, extract:
- description: the item/service name
- quantity: number of units (default 1 if not visible)
- rate: price per unit as a number (no currency symbols)

Return ONLY a valid JSON array, nothing else. Example:
[{"description":"Engine Oil","quantity":2,"rate":450},{"description":"Oil Filter","quantity":1,"rate":250}]

If you cannot read the image or find no items, return exactly: []`,
                max_tokens: 1024,
            })

            const raw = response?.response ?? response?.description ?? ''
            const text = (typeof raw === 'string' ? raw : JSON.stringify(raw)).trim()
            items = parseItemsFromText(text)
        } catch (visionError: any) {
            console.error('Llama Vision failed:', visionError.message)
        }

        // Strategy 2: Fallback to two-step (captioning + text LLM)
        if (items.length === 0) {
            try {
                const captionResponse = await c.env.AI.run('@cf/unum/uform-gen2-qwen-500m', {
                    image: [...imageBytes],
                    prompt: 'Read all text in this image. List every item name, quantity, price, and rate you can see. Include all numbers exactly as written.',
                    max_tokens: 512,
                })

                const imageText = captionResponse?.description?.trim()
                if (imageText && imageText.length > 10) {
                    const parseResponse = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
                        messages: [
                            {
                                role: 'system',
                                content: 'You extract structured invoice data from text. Return ONLY a valid JSON array. Each object must have: description (string), quantity (number, default 1), rate (number, no currency symbols). Return [] if no items found.'
                            },
                            {
                                role: 'user',
                                content: `Extract all line items from this invoice/bill text:\n\n${imageText}\n\nReturn JSON array only:`
                            }
                        ],
                        max_tokens: 1024,
                    })

                    const llmText = (parseResponse as any)?.response?.trim()
                    items = parseItemsFromText(llmText)
                }
            } catch (fallbackError: any) {
                console.error('Fallback OCR failed:', fallbackError.message)
            }
        }

        return c.json({
            success: true,
            data: items,
            message: items.length > 0
                ? `Extracted ${items.length} item(s) from image`
                : 'Could not extract items from image. Please add items manually.',
        })
    } catch (error: any) {
        console.error('OCR extraction error:', error)

        if (error.message?.includes('504') || error.message?.includes('Gateway') || error.message?.includes('timeout') || error.message?.includes('Timeout')) {
            return c.json({
                success: false,
                error: 'AI service timed out. Try a smaller/clearer image, or add items manually.',
            }, 504)
        }

        if (error.message?.includes('AI') || error.message?.includes('binding')) {
            return c.json({
                success: false,
                error: 'AI service is not configured. Please add the AI binding in wrangler.toml.',
            }, 503)
        }

        return c.json({
            success: false,
            error: error.message || 'Failed to process image',
        }, 500)
    }
})

export { ocr }
