import { DataRecord } from '../types';

// Generates a consistent, realistic 12-month commercial dataset (280+ transactions)
export function generateDefaultDataset(): DataRecord[] {
  const records: DataRecord[] = [];
  let idCounter = 1;

  const categories = [
    { name: 'Software & SaaS', baseMargin: 0.72, avgPrice: 1250 },
    { name: 'Hardware & Equipos', baseMargin: 0.28, avgPrice: 2800 },
    { name: 'Servicios Profesionales', baseMargin: 0.55, avgPrice: 1900 },
    { name: 'Soporte & Mantenimiento', baseMargin: 0.65, avgPrice: 850 },
    { name: 'Infraestructura Cloud', baseMargin: 0.48, avgPrice: 1550 },
  ];

  const productsByCategory: Record<string, string[]> = {
    'Software & SaaS': ['Suite Analytics Pro', 'ERP Cloud Enterprise', 'CRM Omnicanal', 'Seguridad Endpoint'],
    'Hardware & Equipos': ['Servidores Rack 2U', 'Estaciones de Trabajo Z4', 'Switches Fibra 10G', 'Laptops Corporativas'],
    'Servicios Profesionales': ['Consultoría Estratégica', 'Implementación ERP', 'Auditoría de Ciberseguridad', 'Migración Cloud'],
    'Soporte & Mantenimiento': ['SLA Platinum 24/7', 'Mantenimiento Preventivo', 'Bolsa de Horas Soporte', 'Respaldo Gestionado'],
    'Infraestructura Cloud': ['Storage Object S3', 'Compute Clusters Dedicated', 'Balanceadores de Carga', 'VPC Gestionada'],
  };

  const regions = ['Región Norte', 'Región Centro', 'Región Sur', 'Región Este', 'Región Oeste'];
  const channels = ['Ventas B2B Directas', 'Portal E-Commerce', 'Red de Distribuidores', 'Partners Estratégicos'];
  const segments = ['Corporativo / Enterprise', 'Mediana Empresa (PYME)', 'Startup Tecnológica', 'Sector Público'];

  // Months from 2024-01 to 2024-12
  const months = [
    { month: '01', weight: 0.85, days: 31 },
    { month: '02', weight: 0.82, days: 28 },
    { month: '03', weight: 1.05, days: 31 }, // End of Q1
    { month: '04', weight: 0.95, days: 30 },
    { month: '05', weight: 1.02, days: 31 },
    { month: '06', weight: 1.15, days: 30 }, // End of Q2
    { month: '07', weight: 0.92, days: 31 },
    { month: '08', weight: 0.90, days: 31 },
    { month: '09', weight: 1.18, days: 30 }, // End of Q3
    { month: '10', weight: 1.25, days: 31 },
    { month: '11', weight: 1.45, days: 30 }, // Black Friday / Prep
    { month: '12', weight: 1.60, days: 31 }, // End of Year close
  ];

  // Seeded deterministic generator for consistency
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  months.forEach((m) => {
    // Generate 20-25 transactions per month
    const count = Math.floor(18 + pseudoRandom() * 10);
    for (let i = 0; i < count; i++) {
      const catObj = categories[Math.floor(pseudoRandom() * categories.length)];
      const productList = productsByCategory[catObj.name];
      const product = productList[Math.floor(pseudoRandom() * productList.length)];
      const region = regions[Math.floor(pseudoRandom() * regions.length)];
      const channel = channels[Math.floor(pseudoRandom() * channels.length)];
      const segment = segments[Math.floor(pseudoRandom() * segments.length)];

      const day = Math.floor(1 + pseudoRandom() * m.days);
      const dateStr = `2024-${m.month}-${day.toString().padStart(2, '0')}`;

      // Units based on segment & category
      let units = Math.floor(1 + pseudoRandom() * 8);
      if (segment === 'Corporativo / Enterprise') units += Math.floor(pseudoRandom() * 12);
      if (catObj.name === 'Hardware & Equipos') units = Math.max(1, Math.floor(units * 0.7));

      // Pricing variation ±15%
      const unitPrice = Math.round(catObj.avgPrice * (0.85 + pseudoRandom() * 0.3) * m.weight);
      const revenue = unitPrice * units;
      
      // Cost calculation with variance
      const actualMargin = Math.min(0.88, Math.max(0.12, catObj.baseMargin + (pseudoRandom() - 0.5) * 0.15));
      const cost = Math.round(revenue * (1 - actualMargin));
      const profit = revenue - cost;

      const satisfaction = Math.round((7.5 + pseudoRandom() * 2.5) * 10) / 10;

      records.push({
        id: `TRX-${idCounter.toString().padStart(4, '0')}`,
        date: dateStr,
        category: catObj.name,
        product,
        region,
        channel,
        customerSegment: segment,
        revenue,
        cost,
        profit,
        units,
        customerSatisfaction: satisfaction,
      });
      idCounter++;
    }
  });

  return records;
}
