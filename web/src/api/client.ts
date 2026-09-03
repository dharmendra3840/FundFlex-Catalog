const API_BASE = '/api/v1'

export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function getProductDetails(slug: string) {
  const res = await fetch(`${API_BASE}/products/${slug}`)
  if (!res.ok) {
    if (res.status === 404) throw new Error('NOT_FOUND')
    throw new Error('Failed to fetch product details')
  }
  return res.json()
}

export async function createSelectionIntent(variantId: string, planId: string) {
  const res = await fetch(`${API_BASE}/selection-intents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variantId, planId })
  })
  const data = await res.json()
  if (!res.ok) throw data.error
  return data
}

export async function getIntentSummary(id: string) {
  const res = await fetch(`${API_BASE}/selection-intents/${id}`)
  if (!res.ok) throw new Error('Failed to fetch intent summary')
  return res.json()
}

export function formatMoney(paise: number, currency: string = 'INR') {
  const amount = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
