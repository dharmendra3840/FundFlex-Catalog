import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getProducts, formatMoney } from './api/client'

export default function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  })

  if (isLoading) return <div className="p-8 text-center text-ink/60">Loading catalog...</div>
  if (isError) return <div className="p-8 text-center text-red-600">Failed to load catalog</div>

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <header className="mb-12 text-center mt-8">
        <h1 className="text-4xl font-bold text-ink mb-3 tracking-tight">FundFlex Catalog</h1>
        <p className="text-ink/60 text-lg">Select a device to explore EMI plans.</p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {data?.data.map((product: any) => (
          <Link 
            key={product.id} 
            to={`/products/${product.slug}`}
            className="group flex flex-col bg-canvas border border-border rounded-[20px] hover:border-accent hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all overflow-hidden"
          >
            <div className="bg-canvas-soft aspect-square p-8 flex items-center justify-center relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('placehold.co')) {
                    target.src = `https://placehold.co/600x600/f8fafc/0f172a?text=${encodeURIComponent(product.name)}`;
                  }
                }}
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-xs text-ink/50 font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
              <h2 className="font-bold text-xl text-ink mb-1">{product.name}</h2>
              <p className="text-sm text-ink/60 mb-4">{product.variantCount} {product.variantCount === 1 ? 'variant' : 'variants'} available</p>
              
              <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm text-ink/60">From</span>
                <span className="font-bold text-lg text-ink tabular-nums">{formatMoney(product.priceMinor)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
