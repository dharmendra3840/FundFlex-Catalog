import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

// Validation schemas
const selectionIntentSchema = z.object({
  variantId: z.string().min(1),
  planId: z.string().min(1),
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ data: { status: 'ok' }, meta: { requestId: req.id, generatedAt: new Date().toISOString() } });
  } catch (error) {
    res.status(503).json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'Database is not ready', requestId: req.id } });
  }
});

// List products
app.get('/api/v1/products', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        variants: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 }
          }
        }
      }
    });

    const data = products.map(p => {
      const defaultVariant = p.variants.find(v => v.isDefault) || p.variants[0];
      return {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        name: p.name,
        description: p.description,
        variantCount: p.variants.length,
        priceMinor: defaultVariant?.priceMinor || 0,
        imageUrl: defaultVariant?.images[0]?.url || null,
        defaultVariantId: defaultVariant?.id
      };
    });

    res.json({ data, meta: { requestId: req.id, generatedAt: new Date().toISOString() } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected failure', requestId: req.id } });
  }
});

// Get product by slug
app.get('/api/v1/products/:slug', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        variants: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            emiPlans: { where: { status: 'ACTIVE' } }
          }
        }
      }
    });

    if (!product || product.status !== 'ACTIVE') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found', requestId: req.id } });
    }

    const defaultVariantId = product.variants.find(v => v.isDefault)?.id || product.variants[0]?.id;

    // Helper to compute effective cost and totals (BR-07, BR-08, BR-09, BR-10)
    const processPlan = (plan: any, priceMinor: number) => {
      let monthlyPaymentMinor = plan.monthlyPaymentMinor;
      
      if (monthlyPaymentMinor === null) {
        if (plan.annualInterestBps === 0) {
          monthlyPaymentMinor = Math.round(priceMinor / plan.tenureMonths);
        } else {
          // Standard EMI Formula
          const r = (plan.annualInterestBps / 10000) / 12;
          const p = priceMinor;
          const n = plan.tenureMonths;
          monthlyPaymentMinor = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
        }
      }

      const totalInstalmentsMinor = monthlyPaymentMinor * plan.tenureMonths;
      const effectiveCostMinor = totalInstalmentsMinor - plan.cashbackMinor;

      return {
        id: plan.id,
        tenureMonths: plan.tenureMonths,
        annualInterestBps: plan.annualInterestBps,
        cashbackMinor: plan.cashbackMinor,
        monthlyPaymentMinor,
        totalInstalmentsMinor,
        effectiveCostMinor,
        backingLabel: plan.backingLabel,
        disclosureText: plan.disclosureText,
        badges: [] as string[]
      };
    };

    const data = {
      id: product.id,
      slug: product.slug,
      brand: product.brand,
      name: product.name,
      description: product.description,
      defaultVariantId,
      variants: product.variants.map(v => {
        const processedPlans = v.emiPlans.map(p => processPlan(p, v.priceMinor));
        
        // Calculate badges (BR-10)
        if (processedPlans.length > 0) {
          let minMonthly = Math.min(...processedPlans.map(p => p.monthlyPaymentMinor));
          let minEffective = Math.min(...processedPlans.map(p => p.effectiveCostMinor));
          
          processedPlans.forEach(p => {
            if (p.monthlyPaymentMinor === minMonthly) p.badges.push('LOWEST_MONTHLY');
            if (p.effectiveCostMinor === minEffective) p.badges.push('LOWEST_TOTAL_COST');
          });
        }

        return {
          id: v.id,
          label: v.label,
          sku: v.sku,
          color: v.color,
          storageGb: v.storageGb,
          mrpMinor: v.mrpMinor,
          priceMinor: v.priceMinor,
          currency: v.currency,
          stockStatus: v.stockStatus,
          images: v.images.map(i => ({ url: i.url, alt: i.alt })),
          plans: processedPlans.sort((a, b) => a.tenureMonths - b.tenureMonths)
        };
      })
    };

    res.json({ data, meta: { requestId: req.id, generatedAt: new Date().toISOString() } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected failure', requestId: req.id } });
  }
});

// Create selection intent
app.post('/api/v1/selection-intents', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  
  try {
    const validated = selectionIntentSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Invalid payload', requestId: req.id, fieldErrors: validated.error.flatten() } });
    }

    const { variantId, planId } = validated.data;

    // BR-12: The server revalidates product, variant and plan state before creating an intent.
    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: {
        emiPlans: { where: { id: planId, status: 'ACTIVE' } }
      }
    });

    if (!variant || variant.emiPlans.length === 0) {
      return res.status(409).json({ error: { code: 'PLAN_NO_LONGER_ELIGIBLE', message: 'This plan has changed. Refresh to compare current options.', requestId: req.id } });
    }

    const plan = variant.emiPlans[0];
    
    // Re-calculate
    let monthlyPaymentMinor = plan.monthlyPaymentMinor;
    if (monthlyPaymentMinor === null) {
      if (plan.annualInterestBps === 0) {
        monthlyPaymentMinor = Math.round(variant.priceMinor / plan.tenureMonths);
      } else {
        const r = (plan.annualInterestBps / 10000) / 12;
        const p = variant.priceMinor;
        const n = plan.tenureMonths;
        monthlyPaymentMinor = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      }
    }

    // Intent ID
    const intentId = `sel_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.selectionIntent.create({
      data: {
        id: intentId,
        variantId,
        planId,
        quotedPriceMinor: variant.priceMinor,
        quotedMonthlyPaymentMinor: monthlyPaymentMinor,
        quotedTenureMonths: plan.tenureMonths,
        status: 'READY_FOR_REVIEW',
        expiresAt
      }
    });

    res.status(201).json({
      data: {
        id: intentId,
        status: 'READY_FOR_REVIEW',
        reviewUrl: `/review/${intentId}`,
        expiresAt: expiresAt.toISOString()
      },
      meta: { requestId: req.id, generatedAt: new Date().toISOString() }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected failure', requestId: req.id } });
  }
});

// Get selection intent summary
app.get('/api/v1/selection-intents/:id', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const intent = await prisma.selectionIntent.findUnique({
      where: { id: req.params.id },
      include: {
        variant: { include: { product: true } },
        plan: true
      }
    });

    if (!intent) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Intent not found', requestId: req.id } });
    }

    const data = {
      id: intent.id,
      status: intent.status,
      product: {
        name: intent.variant.product.name,
        brand: intent.variant.product.brand
      },
      variant: {
        label: intent.variant.label,
        sku: intent.variant.sku,
        priceMinor: intent.quotedPriceMinor
      },
      plan: {
        tenureMonths: intent.quotedTenureMonths,
        monthlyPaymentMinor: intent.quotedMonthlyPaymentMinor,
        annualInterestBps: intent.plan.annualInterestBps,
        cashbackMinor: intent.plan.cashbackMinor
      }
    };

    res.json({ data, meta: { requestId: req.id, generatedAt: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected failure', requestId: req.id } });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found', requestId: req.id } });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
