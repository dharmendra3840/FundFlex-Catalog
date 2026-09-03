import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const products = [
    {
      id: 'prd_iphone17pro',
      slug: 'iphone-17-pro',
      brand: 'Apple',
      name: 'iPhone 17 Pro',
      description: 'The ultimate iPhone.',
      variants: [
        {
          id: 'var_iphone17_silver_128',
          sku: 'IP17P-SLV-128',
          label: 'Silver · 128 GB',
          color: 'Silver',
          storageGb: 128,
          mrpMinor: 12490000,
          priceMinor: 11540000,
          isDefault: true,
          images: [{ id: 'img_ip17_slv_128', url: '/iphone17-silver.jpg', alt: 'iPhone 17 Pro Silver' }],
          plans: [
            { id: 'plan_ip17_slv_128_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_slv_128_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_slv_128_12m', tenureMonths: 12, annualInterestBps: 1050, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_iphone17_silver_256',
          sku: 'IP17P-SLV-256',
          label: 'Silver · 256 GB',
          color: 'Silver',
          storageGb: 256,
          mrpMinor: 13490000,
          priceMinor: 12740000,
          isDefault: false,
          images: [{ id: 'img_ip17_slv_256', url: '/iphone17-silver.jpg', alt: 'iPhone 17 Pro Silver' }],
          plans: [
            { id: 'plan_ip17_slv_256_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_slv_256_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_slv_256_12m', tenureMonths: 12, annualInterestBps: 1050, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_iphone17_orange_128',
          sku: 'IP17P-ORG-128',
          label: 'Orange · 128 GB',
          color: 'Orange',
          storageGb: 128,
          mrpMinor: 12490000,
          priceMinor: 11540000,
          isDefault: false,
          images: [{ id: 'img_ip17_org_128', url: '/iphone17-orange.jpg', alt: 'iPhone 17 Pro Orange' }],
          plans: [
            { id: 'plan_ip17_org_128_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_org_128_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_org_128_12m', tenureMonths: 12, annualInterestBps: 1050, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_iphone17_orange_256',
          sku: 'IP17P-ORG-256',
          label: 'Orange · 256 GB',
          color: 'Orange',
          storageGb: 256,
          mrpMinor: 13490000,
          priceMinor: 12740000,
          isDefault: false,
          images: [{ id: 'img_ip17_org_256', url: '/iphone17-orange.jpg', alt: 'iPhone 17 Pro Orange' }],
          plans: [
            { id: 'plan_ip17_org_256_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_org_256_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 750000 },
            { id: 'plan_ip17_org_256_12m', tenureMonths: 12, annualInterestBps: 1050, cashbackMinor: 0 },
          ]
        }
      ]
    },
    {
      id: 'prd_s25ultra',
      slug: 'samsung-galaxy-s25-ultra',
      brand: 'Samsung',
      name: 'Galaxy S25 Ultra',
      description: 'Epic, just like that.',
      variants: [
        {
          id: 'var_s25u_blk_128',
          sku: 'S25U-BLK-128',
          label: 'Titanium Black · 128 GB',
          color: 'Titanium Black',
          storageGb: 128,
          mrpMinor: 11999900,
          priceMinor: 11499900,
          isDefault: true,
          images: [{ id: 'img_s25u_blk_128', url: '/s25u-black.png', alt: 'S25 Ultra Black' }],
          plans: [
            { id: 'plan_s25u_blk_128_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_s25u_blk_128_9m', tenureMonths: 9, annualInterestBps: 0, cashbackMinor: 0 },
            { id: 'plan_s25u_blk_128_18m', tenureMonths: 18, annualInterestBps: 1250, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_s25u_blk_256',
          sku: 'S25U-BLK-256',
          label: 'Titanium Black · 256 GB',
          color: 'Titanium Black',
          storageGb: 256,
          mrpMinor: 12999900,
          priceMinor: 12499900,
          isDefault: false,
          images: [{ id: 'img_s25u_blk_256', url: '/s25u-black.png', alt: 'S25 Ultra Black' }],
          plans: [
            { id: 'plan_s25u_blk_256_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_s25u_blk_256_9m', tenureMonths: 9, annualInterestBps: 0, cashbackMinor: 0 },
            { id: 'plan_s25u_blk_256_18m', tenureMonths: 18, annualInterestBps: 1250, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_s25u_gry_128',
          sku: 'S25U-GRY-128',
          label: 'Titanium Gray · 128 GB',
          color: 'Titanium Gray',
          storageGb: 128,
          mrpMinor: 11999900,
          priceMinor: 11499900,
          isDefault: false,
          images: [{ id: 'img_s25u_gry_128', url: '/s25u-gray.png', alt: 'S25 Ultra Gray' }],
          plans: [
            { id: 'plan_s25u_gry_128_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_s25u_gry_128_9m', tenureMonths: 9, annualInterestBps: 0, cashbackMinor: 0 },
            { id: 'plan_s25u_gry_128_18m', tenureMonths: 18, annualInterestBps: 1250, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_s25u_gry_256',
          sku: 'S25U-GRY-256',
          label: 'Titanium Gray · 256 GB',
          color: 'Titanium Gray',
          storageGb: 256,
          mrpMinor: 12999900,
          priceMinor: 12499900,
          isDefault: false,
          images: [{ id: 'img_s25u_gry_256', url: '/s25u-gray.png', alt: 'S25 Ultra Gray' }],
          plans: [
            { id: 'plan_s25u_gry_256_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_s25u_gry_256_9m', tenureMonths: 9, annualInterestBps: 0, cashbackMinor: 0 },
            { id: 'plan_s25u_gry_256_18m', tenureMonths: 18, annualInterestBps: 1250, cashbackMinor: 0 },
          ]
        }
      ]
    },
    {
      id: 'prd_pixel10pro',
      slug: 'google-pixel-10-pro',
      brand: 'Google',
      name: 'Pixel 10 Pro',
      description: 'The pro Google phone.',
      variants: [
        {
          id: 'var_px10p_obs_128',
          sku: 'PX10P-OBS-128',
          label: 'Obsidian · 128 GB',
          color: 'Obsidian',
          storageGb: 128,
          mrpMinor: 9999900,
          priceMinor: 8999900,
          isDefault: true,
          images: [{ id: 'img_px10p_obs_128', url: '/pixel10-obsidian.png', alt: 'Pixel 10 Pro Obsidian' }],
          plans: [
            { id: 'plan_px10p_obs_128_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 1000000 },
            { id: 'plan_px10p_obs_128_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_px10p_obs_128_12m', tenureMonths: 12, annualInterestBps: 1400, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_px10p_obs_256',
          sku: 'PX10P-OBS-256',
          label: 'Obsidian · 256 GB',
          color: 'Obsidian',
          storageGb: 256,
          mrpMinor: 10999900,
          priceMinor: 9999900,
          isDefault: false,
          images: [{ id: 'img_px10p_obs_256', url: '/pixel10-obsidian.png', alt: 'Pixel 10 Pro Obsidian' }],
          plans: [
            { id: 'plan_px10p_obs_256_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 1000000 },
            { id: 'plan_px10p_obs_256_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_px10p_obs_256_12m', tenureMonths: 12, annualInterestBps: 1400, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_px10p_por_128',
          sku: 'PX10P-POR-128',
          label: 'Porcelain · 128 GB',
          color: 'Porcelain',
          storageGb: 128,
          mrpMinor: 9999900,
          priceMinor: 8999900,
          isDefault: false,
          images: [{ id: 'img_px10p_por_128', url: '/pixel10-porcelain.png', alt: 'Pixel 10 Pro Porcelain' }],
          plans: [
            { id: 'plan_px10p_por_128_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 1000000 },
            { id: 'plan_px10p_por_128_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_px10p_por_128_12m', tenureMonths: 12, annualInterestBps: 1400, cashbackMinor: 0 },
          ]
        },
        {
          id: 'var_px10p_por_256',
          sku: 'PX10P-POR-256',
          label: 'Porcelain · 256 GB',
          color: 'Porcelain',
          storageGb: 256,
          mrpMinor: 10999900,
          priceMinor: 9999900,
          isDefault: false,
          images: [{ id: 'img_px10p_por_256', url: '/pixel10-porcelain.png', alt: 'Pixel 10 Pro Porcelain' }],
          plans: [
            { id: 'plan_px10p_por_256_3m', tenureMonths: 3, annualInterestBps: 0, cashbackMinor: 1000000 },
            { id: 'plan_px10p_por_256_6m', tenureMonths: 6, annualInterestBps: 0, cashbackMinor: 500000 },
            { id: 'plan_px10p_por_256_12m', tenureMonths: 12, annualInterestBps: 1400, cashbackMinor: 0 },
          ]
        }
      ]
    }
  ];

  // Because we are completely changing the variants (adding/removing), it is best to clean up the DB first to avoid stale EMI plans or dangling variants.
  await prisma.selectionIntent.deleteMany();
  await prisma.emiPlan.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        name: p.name,
        description: p.description,
      }
    });

    for (const v of p.variants) {
      await prisma.variant.create({
        data: {
          id: v.id,
          productId: p.id,
          sku: v.sku,
          label: v.label,
          color: v.color,
          storageGb: v.storageGb,
          mrpMinor: v.mrpMinor,
          priceMinor: v.priceMinor,
          isDefault: v.isDefault,
        }
      });

      for (const img of v.images) {
        await prisma.productImage.create({
          data: { id: img.id, variantId: v.id, url: img.url, alt: img.alt }
        });
      }

      for (const plan of v.plans) {
        await prisma.emiPlan.create({
          data: {
            id: plan.id,
            variantId: v.id,
            tenureMonths: plan.tenureMonths,
            annualInterestBps: plan.annualInterestBps,
            cashbackMinor: plan.cashbackMinor,
            backingLabel: "EMI plan backed by mutual funds",
            disclosureText: "Illustrative demo terms. Final terms may vary.",
          }
        });
      }
    }
  }

  console.log('Seed completed successfully with expanded variants.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
