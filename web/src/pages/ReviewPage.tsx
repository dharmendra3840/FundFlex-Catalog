import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getIntentSummary, formatMoney } from '../api/client'

export default function ReviewPage() {
  const { intentId } = useParams<{ intentId: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['intent', intentId],
    queryFn: () => getIntentSummary(intentId!),
    enabled: !!intentId
  })

  if (isLoading) return <div className="p-8 text-center text-ink/60">Loading review summary...</div>
  if (isError) return <div className="p-8 text-center text-red-600">Failed to load summary or intent expired.</div>

  const intent = data?.data
  if (!intent) return null

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 mt-12">
      <div className="bg-canvas border border-border p-8 rounded-card shadow-soft text-center">
        <div className="w-16 h-16 bg-positive/10 text-positive rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-ink mb-2">Selection Confirmed</h1>
        <p className="text-ink/60 mb-8">This is a demo review state. No payment or personal data is required.</p>

        <div className="text-left space-y-4 border-t border-border pt-6">
          <div className="flex justify-between items-center pb-4 border-b border-border/50">
            <span className="text-ink/60">Product</span>
            <span className="font-semibold text-ink text-right">{intent.product.brand} {intent.product.name}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-border/50">
            <span className="text-ink/60">Variant</span>
            <span className="font-semibold text-ink text-right">{intent.variant.label}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-border/50">
            <span className="text-ink/60">Plan</span>
            <span className="font-semibold text-ink text-right tabular-nums">
              {formatMoney(intent.plan.monthlyPaymentMinor)} × {intent.plan.tenureMonths} months
            </span>
          </div>
        </div>

        <div className="mt-10">
           <Link to="/" className="text-accent hover:underline font-medium">Return to Catalog</Link>
        </div>
      </div>
    </div>
  )
}
