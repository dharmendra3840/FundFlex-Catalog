import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getProductDetails, createSelectionIntent, formatMoney } from '../api/client'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductDetails(slug!),
    enabled: !!slug
  })

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const proceedMutation = useMutation({
    mutationFn: (variables: { variantId: string, planId: string }) => createSelectionIntent(variables.variantId, variables.planId),
    onSuccess: (res) => {
      navigate(res.data.reviewUrl)
    },
    onError: (err: any) => {
      setApiError(err.message || 'An error occurred during submission.')
    }
  })

  // Sync state with URL and Data
  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      const urlVariant = searchParams.get('variant')
      const urlPlan = searchParams.get('plan')
      
      let initialVariant = p.variants.find((v: any) => v.id === urlVariant)
      if (!initialVariant) initialVariant = p.variants.find((v: any) => v.id === p.defaultVariantId) || p.variants[0]
      
      if (initialVariant.id !== selectedVariantId) {
        setSelectedVariantId(initialVariant.id)
      }

      // If we switch variants, ensure plan is valid
      if (initialVariant) {
        let planValid = initialVariant.plans.find((pl: any) => pl.id === selectedPlanId)
        if (!planValid && urlPlan) {
           planValid = initialVariant.plans.find((pl: any) => pl.id === urlPlan)
        }
        
        if (planValid) {
          if (selectedPlanId !== planValid.id) setSelectedPlanId(planValid.id)
        } else {
          setSelectedPlanId(null)
        }
      }
    }
  }, [data, searchParams, selectedVariantId, selectedPlanId])

  const handleVariantChange = (vid: string) => {
    setSearchParams(prev => {
      prev.set('variant', vid)
      prev.delete('plan') // reset plan on variant change
      return prev
    }, { replace: true })
    setSelectedVariantId(vid)
    setSelectedPlanId(null)
    setApiError(null)
  }

  const handlePlanChange = (pid: string) => {
    setSearchParams(prev => {
      prev.set('plan', pid)
      return prev
    }, { replace: true })
    setSelectedPlanId(pid)
    setApiError(null)
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 animate-pulse flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 h-96 bg-border/50 rounded-card"></div>
        <div className="w-full md:w-1/2 space-y-4">
           <div className="h-8 bg-border/50 w-2/3 rounded"></div>
           <div className="h-6 bg-border/50 w-1/3 rounded"></div>
           <div className="h-24 bg-border/50 w-full rounded"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    if ((error as Error).message === 'NOT_FOUND') {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/" className="text-accent hover:underline">Browse Catalog</Link>
        </div>
      )
    }
    return <div className="p-8 text-center text-red-600">Failed to load product. Please refresh.</div>
  }

  const product = data?.data
  if (!product) return null

  const activeVariant = product.variants.find((v: any) => v.id === selectedVariantId) || product.variants[0]
  const activePlan = activeVariant?.plans.find((p: any) => p.id === selectedPlanId)

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 relative pb-32 md:pb-8">
      {/* Left Column: Media & Core Info (Sticky on Desktop) */}
      <div className="w-full md:w-1/2 md:sticky md:top-8 self-start space-y-6">
        <div className="bg-canvas border border-border p-6 rounded-card shadow-soft text-center">
          <img 
            src={activeVariant.images[0]?.url} 
            alt={activeVariant.images[0]?.alt || activeVariant.label}
            className="max-w-full h-auto mx-auto object-contain bg-canvas-soft rounded-lg aspect-square mix-blend-multiply"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('placehold.co')) {
                target.src = `https://placehold.co/600x600/f8fafc/0f172a?text=${encodeURIComponent(activeVariant.label)}`;
              }
            }}
          />
        </div>
        <div>
          <p className="text-sm text-ink/60 font-medium uppercase tracking-wider">{product.brand}</p>
          <h1 className="text-3xl font-bold text-ink mt-1 mb-2">{product.name}</h1>
          <p className="text-ink/80 text-sm mb-4">{activeVariant.label} • SKU: {activeVariant.sku}</p>
          
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-ink tabular-nums">{formatMoney(activeVariant.priceMinor)}</span>
            {activeVariant.mrpMinor > activeVariant.priceMinor && (
              <span className="text-sm text-ink/40 line-through tabular-nums">{formatMoney(activeVariant.mrpMinor)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Decision Panel */}
      <div className="w-full md:w-1/2 flex flex-col gap-8 relative pb-32 md:pb-0">
        
        {/* Variants */}
        <section className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold mb-3 text-ink/70 uppercase tracking-wider">Choose Color</h2>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(product.variants.map((v: any) => v.color))).map((color: any) => {
                const isSelected = color === activeVariant?.color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      let next = product.variants.find((v: any) => v.color === color && v.storageGb === activeVariant?.storageGb)
                      if (!next) next = product.variants.find((v: any) => v.color === color)
                      if (next) handleVariantChange(next.id)
                    }}
                    className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                      isSelected 
                        ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent shadow-sm' 
                        : 'border-border bg-canvas text-ink hover:border-ink/30'
                    }`}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-3 text-ink/70 uppercase tracking-wider">Choose Storage</h2>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(product.variants.map((v: any) => v.storageGb)))
                .sort((a: any, b: any) => a - b)
                .map((storage: any) => {
                const isSelected = storage === activeVariant?.storageGb;
                // Check if this storage is available in the selected color
                const isAvailable = product.variants.some((v: any) => v.storageGb === storage && v.color === activeVariant?.color && v.stockStatus === 'IN_STOCK');

                return (
                  <button
                    key={storage}
                    disabled={!isAvailable}
                    onClick={() => {
                      let next = product.variants.find((v: any) => v.storageGb === storage && v.color === activeVariant?.color)
                      if (next) handleVariantChange(next.id)
                    }}
                    className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                      isSelected 
                        ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent shadow-sm' 
                        : 'border-border bg-canvas text-ink hover:border-ink/30'
                    } ${!isAvailable ? 'opacity-40 cursor-not-allowed bg-canvas-soft' : ''}`}
                  >
                    {storage} GB
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* EMI Plans */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-ink">EMI Plans</h2>
          {activeVariant.plans.length === 0 ? (
            <div className="p-4 bg-canvas-soft border border-border rounded-card text-ink/60 text-sm">
              No eligible EMI plans for this variant.
            </div>
          ) : (
            <div className="space-y-3">
              {activeVariant.plans.map((plan: any) => {
                const isSelected = plan.id === selectedPlanId
                return (
                  <label 
                    key={plan.id}
                    className={`block p-4 border rounded-card cursor-pointer transition-colors shadow-sm ${
                      isSelected ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border bg-canvas hover:border-ink/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0">
                        <input 
                          type="radio" 
                          name="emi-plan" 
                          value={plan.id}
                          checked={isSelected}
                          onChange={() => handlePlanChange(plan.id)}
                          className="w-4 h-4 text-accent border-border focus:ring-accent accent-accent cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-baseline gap-x-2 mb-1">
                          <div className="font-semibold text-lg text-ink tabular-nums whitespace-nowrap">
                            {formatMoney(plan.monthlyPaymentMinor)} <span className="text-sm font-normal text-ink/60">× {plan.tenureMonths} months</span>
                          </div>
                          <div className="text-sm font-medium text-ink/80 whitespace-nowrap">
                            {plan.annualInterestBps === 0 ? '0% interest' : `${plan.annualInterestBps / 100}% p.a.`}
                          </div>
                        </div>
                        
                        {plan.cashbackMinor > 0 && (
                          <div className="text-xs font-medium text-positive mb-3">
                            Additional cashback of {formatMoney(plan.cashbackMinor)}
                          </div>
                        )}
                        
                        <div className="text-xs text-ink/60 mt-2 pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
                          <div>Total payable: <br/><span className="tabular-nums font-medium text-ink/80">{formatMoney(plan.totalInstalmentsMinor)}</span></div>
                          <div>Effective cost: <br/><span className="font-semibold text-ink tabular-nums">{formatMoney(plan.effectiveCostMinor)}</span></div>
                        </div>

                        {plan.badges && plan.badges.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {plan.badges.map((b: string) => (
                              <span key={b} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-ink/10 text-ink/70">
                                {b.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </section>

        {activeVariant.plans.length > 0 && activeVariant.plans[0].disclosureText && (
          <p className="text-xs text-ink/50 leading-relaxed mt-2">
            {activeVariant.plans[0].backingLabel && <strong>{activeVariant.plans[0].backingLabel}.</strong>} {activeVariant.plans[0].disclosureText}
          </p>
        )}

        {/* Sticky Bottom Action Bar (Mobile) / Inline Action (Desktop) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-canvas border-t border-border shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] md:static md:bg-transparent md:border-none md:shadow-none md:p-0 z-10 md:mt-4">
          {apiError && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 text-sm rounded-card border border-red-100">
              {apiError}
            </div>
          )}
          <button
            disabled={!selectedPlanId || proceedMutation.isPending}
            onClick={() => {
              if (selectedVariantId && selectedPlanId) {
                proceedMutation.mutate({ variantId: selectedVariantId, planId: selectedPlanId })
              }
            }}
            className="w-full py-4 px-6 bg-accent hover:bg-accent/90 disabled:bg-border disabled:text-ink/40 text-canvas font-semibold rounded-card transition-colors shadow-sm flex justify-between items-center text-lg"
          >
            <span>
              {proceedMutation.isPending ? 'Processing...' : 'Proceed with selected plan'}
            </span>
            {activePlan && !proceedMutation.isPending && (
               <span className="font-bold tabular-nums tracking-wide">{formatMoney(activePlan.monthlyPaymentMinor)}/mo</span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
