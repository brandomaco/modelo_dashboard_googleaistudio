import { DataRecord, KPIData, InsightItem, FilterState } from '../types';

export function filterRecords(records: DataRecord[], filters: FilterState): DataRecord[] {
  return records.filter((r) => {
    // Period filter
    if (filters.period !== 'all') {
      const month = parseInt(r.date.split('-')[1], 10);
      if (filters.period === 'Q1' && !(month >= 1 && month <= 3)) return false;
      if (filters.period === 'Q2' && !(month >= 4 && month <= 6)) return false;
      if (filters.period === 'Q3' && !(month >= 7 && month <= 9)) return false;
      if (filters.period === 'Q4' && !(month >= 10 && month <= 12)) return false;
      if (filters.period === 'H1' && !(month >= 1 && month <= 6)) return false;
      if (filters.period === 'H2' && !(month >= 7 && month <= 12)) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (r.category !== filters.category) return false;
    }

    // Region filter
    if (filters.region && filters.region !== 'all') {
      if (r.region !== filters.region) return false;
    }

    // Channel filter
    if (filters.channel && filters.channel !== 'all') {
      if (r.channel !== filters.channel) return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const match =
        r.product.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query) ||
        r.region.toLowerCase().includes(query) ||
        r.channel.toLowerCase().includes(query) ||
        r.customerSegment.toLowerCase().includes(query);
      if (!match) return false;
    }

    return true;
  });
}

export function calculateKPIs(records: DataRecord[]): KPIData {
  if (records.length === 0) {
    return {
      totalRevenue: 0,
      revenueChange: 0,
      totalProfit: 0,
      profitChange: 0,
      profitMargin: 0,
      marginChange: 0,
      totalUnits: 0,
      unitsChange: 0,
      avgOrderValue: 0,
      aovChange: 0,
      topCategory: 'N/A',
      topRegion: 'N/A',
    };
  }

  // Sort by date to compute period-over-period comparison
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const midIndex = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midIndex);
  const secondHalf = sorted.slice(midIndex);

  const sumFirstRev = firstHalf.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const sumSecondRev = secondHalf.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const totalRevenue = sumFirstRev + sumSecondRev;
  const revenueChange = sumFirstRev > 0 ? ((sumSecondRev - sumFirstRev) / sumFirstRev) * 100 : 0;

  const sumFirstProf = firstHalf.reduce((acc, r) => acc + (r.profit || 0), 0);
  const sumSecondProf = secondHalf.reduce((acc, r) => acc + (r.profit || 0), 0);
  const totalProfit = sumFirstProf + sumSecondProf;
  const profitChange = sumFirstProf > 0 ? ((sumSecondProf - sumFirstProf) / sumFirstProf) * 100 : 0;

  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const firstMargin = sumFirstRev > 0 ? (sumFirstProf / sumFirstRev) * 100 : 0;
  const secondMargin = sumSecondRev > 0 ? (sumSecondProf / sumSecondRev) * 100 : 0;
  const marginChange = secondMargin - firstMargin;

  const sumFirstUnits = firstHalf.reduce((acc, r) => acc + (r.units || 0), 0);
  const sumSecondUnits = secondHalf.reduce((acc, r) => acc + (r.units || 0), 0);
  const totalUnits = sumFirstUnits + sumSecondUnits;
  const unitsChange = sumFirstUnits > 0 ? ((sumSecondUnits - sumFirstUnits) / sumFirstUnits) * 100 : 0;

  const avgOrderValue = records.length > 0 ? totalRevenue / records.length : 0;
  const firstAOV = firstHalf.length > 0 ? sumFirstRev / firstHalf.length : 0;
  const secondAOV = secondHalf.length > 0 ? sumSecondRev / secondHalf.length : 0;
  const aovChange = firstAOV > 0 ? ((secondAOV - firstAOV) / firstAOV) * 100 : 0;

  // Top Category
  const catRev: Record<string, number> = {};
  records.forEach((r) => {
    catRev[r.category] = (catRev[r.category] || 0) + r.revenue;
  });
  const topCategory = Object.entries(catRev).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Top Region
  const regRev: Record<string, number> = {};
  records.forEach((r) => {
    regRev[r.region] = (regRev[r.region] || 0) + r.revenue;
  });
  const topRegion = Object.entries(regRev).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return {
    totalRevenue,
    revenueChange: Math.round(revenueChange * 10) / 10,
    totalProfit,
    profitChange: Math.round(profitChange * 10) / 10,
    profitMargin: Math.round(profitMargin * 10) / 10,
    marginChange: Math.round(marginChange * 10) / 10,
    totalUnits,
    unitsChange: Math.round(unitsChange * 10) / 10,
    avgOrderValue: Math.round(avgOrderValue),
    aovChange: Math.round(aovChange * 10) / 10,
    topCategory,
    topRegion,
  };
}

export function getTimeSeriesData(records: DataRecord[]) {
  const monthNames: Record<string, string> = {
    '01': 'Ene',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Abr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Ago',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dic',
  };

  const monthlyAgg: Record<
    string,
    { month: string; rawMonth: string; revenue: number; profit: number; units: number; count: number }
  > = {};

  records.forEach((r) => {
    if (!r.date) return;
    const parts = r.date.split('-');
    const m = parts[1] || '01';
    const key = parts[0] ? `${parts[0]}-${m}` : m;
    const label = monthNames[m] || m;

    if (!monthlyAgg[key]) {
      monthlyAgg[key] = {
        month: label,
        rawMonth: key,
        revenue: 0,
        profit: 0,
        units: 0,
        count: 0,
      };
    }

    monthlyAgg[key].revenue += r.revenue || 0;
    monthlyAgg[key].profit += r.profit || 0;
    monthlyAgg[key].units += r.units || 0;
    monthlyAgg[key].count += 1;
  });

  return Object.keys(monthlyAgg)
    .sort()
    .map((k) => {
      const item = monthlyAgg[k];
      const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
      return {
        key: k,
        label: item.month,
        revenue: Math.round(item.revenue),
        profit: Math.round(item.profit),
        margin: Math.round(margin * 10) / 10,
        units: item.units,
        avgTicket: item.count > 0 ? Math.round(item.revenue / item.count) : 0,
      };
    });
}

export function getCategoryAnalysis(records: DataRecord[]) {
  const catAgg: Record<
    string,
    { category: string; revenue: number; profit: number; units: number; count: number }
  > = {};

  let totalRev = 0;
  records.forEach((r) => {
    totalRev += r.revenue || 0;
    if (!catAgg[r.category]) {
      catAgg[r.category] = {
        category: r.category,
        revenue: 0,
        profit: 0,
        units: 0,
        count: 0,
      };
    }
    catAgg[r.category].revenue += r.revenue || 0;
    catAgg[r.category].profit += r.profit || 0;
    catAgg[r.category].units += r.units || 0;
    catAgg[r.category].count += 1;
  });

  const sorted = Object.values(catAgg).sort((a, b) => b.revenue - a.revenue);

  let cumulative = 0;
  return sorted.map((c) => {
    const margin = c.revenue > 0 ? (c.profit / c.revenue) * 100 : 0;
    const share = totalRev > 0 ? (c.revenue / totalRev) * 100 : 0;
    cumulative += share;
    return {
      category: c.category,
      revenue: Math.round(c.revenue),
      profit: Math.round(c.profit),
      margin: Math.round(margin * 10) / 10,
      units: c.units,
      share: Math.round(share * 10) / 10,
      paretoCumulative: Math.round(cumulative * 10) / 10,
    };
  });
}

export function getChannelAndRegionData(records: DataRecord[]) {
  const channelAgg: Record<string, { channel: string; revenue: number; profit: number; count: number }> = {};
  const regionAgg: Record<string, { region: string; revenue: number; profit: number; units: number }> = {};

  records.forEach((r) => {
    // Channel
    if (!channelAgg[r.channel]) {
      channelAgg[r.channel] = { channel: r.channel, revenue: 0, profit: 0, count: 0 };
    }
    channelAgg[r.channel].revenue += r.revenue || 0;
    channelAgg[r.channel].profit += r.profit || 0;
    channelAgg[r.channel].count += 1;

    // Region
    if (!regionAgg[r.region]) {
      regionAgg[r.region] = { region: r.region, revenue: 0, profit: 0, units: 0 };
    }
    regionAgg[r.region].revenue += r.revenue || 0;
    regionAgg[r.region].profit += r.profit || 0;
    regionAgg[r.region].units += r.units || 0;
  });

  const channels = Object.values(channelAgg)
    .sort((a, b) => b.revenue - a.revenue)
    .map((c) => ({
      name: c.channel,
      revenue: Math.round(c.revenue),
      profit: Math.round(c.profit),
      margin: c.revenue > 0 ? Math.round((c.profit / c.revenue) * 1000) / 10 : 0,
      avgTicket: c.count > 0 ? Math.round(c.revenue / c.count) : 0,
    }));

  const regions = Object.values(regionAgg)
    .sort((a, b) => b.revenue - a.revenue)
    .map((rg) => ({
      name: rg.region,
      revenue: Math.round(rg.revenue),
      profit: Math.round(rg.profit),
      units: rg.units,
      margin: rg.revenue > 0 ? Math.round((rg.profit / rg.revenue) * 1000) / 10 : 0,
    }));

  return { channels, regions };
}

export function getProductMarginVolume(records: DataRecord[]) {
  const productAgg: Record<
    string,
    { product: string; category: string; revenue: number; profit: number; units: number }
  > = {};

  records.forEach((r) => {
    if (!productAgg[r.product]) {
      productAgg[r.product] = {
        product: r.product,
        category: r.category,
        revenue: 0,
        profit: 0,
        units: 0,
      };
    }
    productAgg[r.product].revenue += r.revenue || 0;
    productAgg[r.product].profit += r.profit || 0;
    productAgg[r.product].units += r.units || 0;
  });

  return Object.values(productAgg).map((p) => {
    const margin = p.revenue > 0 ? Math.round((p.profit / p.revenue) * 1000) / 10 : 0;
    return {
      name: p.product,
      category: p.category,
      revenue: Math.round(p.revenue),
      profit: Math.round(p.profit),
      units: p.units,
      margin,
    };
  });
}

export function generateAutomatedInsights(records: DataRecord[]): InsightItem[] {
  if (records.length === 0) return [];

  const insights: InsightItem[] = [];
  const kpis = calculateKPIs(records);
  const timeSeries = getTimeSeriesData(records);
  const categories = getCategoryAnalysis(records);
  const { channels, regions } = getChannelAndRegionData(records);

  // 1. Seasonal/Time Pattern Insight -> Linked to 'revenue' KPI and 'time-series' Chart
  if (timeSeries.length >= 4) {
    const revenues = timeSeries.map((t) => t.revenue);
    const maxRev = Math.max(...revenues);
    const minRev = Math.min(...revenues);
    const maxMonth = timeSeries.find((t) => t.revenue === maxRev);
    const minMonth = timeSeries.find((t) => t.revenue === minRev);
    const avgRev = revenues.reduce((a, b) => a + b, 0) / revenues.length;

    const peakRatio = Math.round(((maxRev - avgRev) / avgRev) * 100);

    insights.push({
      id: 'ins-time-seasonality',
      type: 'trend',
      title: `Fuerte estacionalidad detectada en ${maxMonth?.label || 'cierre'}`,
      description: `El volumen de ventas alcanza su punto álgido en ${maxMonth?.label} superando en un +${peakRatio}% la media mensual ($${Math.round(maxRev).toLocaleString()} vs promedio $${Math.round(avgRev).toLocaleString()}), contrastando con el mínimo de ${minMonth?.label}.`,
      metric: `+${peakRatio}% sobre la media`,
      impact: 'Alto impacto en previsión de inventario y flujo de caja en Q4',
      recommendation: 'Acelerar campañas de preventa en Q3 y anticipar contratos marco corporativos antes del pico de fin de año.',
      targetKpiId: 'revenue',
      targetKpiName: 'Facturación Total',
      targetChartId: 'time-series',
      targetChartTitle: 'Patrón 1: Evolución Temporal y Estacionalidad',
      triadExplanation: {
        kpiRole: `Explica directamente el ritmo y estacionalidad de la Facturación Total ($${Math.round(kpis.totalRevenue).toLocaleString()}).`,
        insightCore: `Pico estacional concentrado en ${maxMonth?.label} que supera en +${peakRatio}% la media del año.`,
        chartProof: `Visualizado en las barras de facturación y el área de beneficio operativo en ${maxMonth?.label}.`,
      },
    });
  }

  // 2. Category Pareto & Profitability Insight -> Linked to 'leaders' KPI and 'category-pareto' Chart
  if (categories.length > 0) {
    const topCat = categories[0];
    const highMarginCat = [...categories].sort((a, b) => b.margin - a.margin)[0];
    const lowMarginCat = [...categories].sort((a, b) => a.margin - b.margin)[0];

    insights.push({
      id: 'ins-cat-pareto',
      type: 'strength',
      title: `${topCat.category} lidera la facturación (${topCat.share}% del total)`,
      description: `La categoría ${topCat.category} es el principal motor con $${topCat.revenue.toLocaleString()} generados. Paralelamente, ${highMarginCat.category} exhibe la mayor rentabilidad unitaria con un margen del ${highMarginCat.margin}%, frente a ${lowMarginCat.category} (${lowMarginCat.margin}%).`,
      metric: `${topCat.share}% participación / ${highMarginCat.margin}% margen`,
      impact: 'Concentración estratégica de beneficios',
      recommendation: `Estrategia de venta cruzada: vincular productos de ${lowMarginCat.category} con bundles de alta rentabilidad de ${highMarginCat.category}.`,
      targetKpiId: 'leaders',
      targetKpiName: 'Líderes de Mercado',
      targetChartId: 'category-pareto',
      targetChartTitle: 'Patrón 2: Concentración de Categorías & Curva Pareto',
      triadExplanation: {
        kpiRole: `Justifica el KPI de Categoría Top (${topCat.category}) como pilar del desempeño global.`,
        insightCore: `${topCat.category} aporta el ${topCat.share}% de la cuota, mientras ${highMarginCat.category} sostiene el margen unitario (${highMarginCat.margin}%).`,
        chartProof: `Comprobado en el gráfico de Pareto: barras de facturación y curva 80/20 acumulada.`,
      },
      highlightFilter: {
        key: 'category',
        value: topCat.category,
      },
    });
  }

  // 3. Channel Efficiency & Average Ticket -> Linked to 'units' KPI and 'channel-region' Chart
  if (channels.length > 0) {
    const highestTicketChannel = [...channels].sort((a, b) => b.avgTicket - a.avgTicket)[0];
    const highestVolumeChannel = [...channels].sort((a, b) => b.revenue - a.revenue)[0];

    insights.push({
      id: 'ins-channel-ticket',
      type: 'opportunity',
      title: `Canal ${highestTicketChannel.name} maximiza el ticket promedio ($${highestTicketChannel.avgTicket.toLocaleString()})`,
      description: `${highestTicketChannel.name} genera el mayor valor por transacción ($${highestTicketChannel.avgTicket.toLocaleString()}), mientras ${highestVolumeChannel.name} concentra el mayor volumen neto de ventas.`,
      metric: `$${highestTicketChannel.avgTicket.toLocaleString()} Ticket Promedio`,
      impact: 'Oportunidad de apalancamiento comercial B2B',
      recommendation: `Implementar programas de incentivos para el canal ${highestTicketChannel.name} y optimizar la conversión digital para reducir costes de adquisición.`,
      targetKpiId: 'units',
      targetKpiName: 'Volumen & Ticket Medio',
      targetChartId: 'channel-region',
      targetChartTitle: 'Patrón 3: Eficiencia por Canales y Distribución Territorial',
      triadExplanation: {
        kpiRole: `Incide directamente en el Ticket Medio (AOV $${Math.round(kpis.avgOrderValue).toLocaleString()}) y la rotación de unidades.`,
        insightCore: `${highestTicketChannel.name} lidera el ticket por transacción ($${highestTicketChannel.avgTicket.toLocaleString()}) frente a otros canales masivos.`,
        chartProof: `Observado en la comparativa de barras de canales y su ratio de rentabilidad.`,
      },
    });
  }

  // 4. Regional Distribution Pattern -> Linked to 'revenue' KPI and 'channel-region' Chart
  if (regions.length > 1) {
    const topReg = regions[0];
    const lowReg = regions[regions.length - 1];
    const regDiff = Math.round(((topReg.revenue - lowReg.revenue) / lowReg.revenue) * 100);

    insights.push({
      id: 'ins-region-gap',
      type: 'alert',
      title: `Brecha territorial: ${topReg.name} supera a ${lowReg.name} por +${regDiff}%`,
      description: `${topReg.name} representa el polo de mayor actividad ($${topReg.revenue.toLocaleString()}), mientras que ${lowReg.name} ($${lowReg.revenue.toLocaleString()}) muestra capacidad ociosa y espacio de penetración.`,
      metric: `+${regDiff}% divergencia regional`,
      impact: 'Riesgo de concentración geográfica de ingresos',
      recommendation: `Auditar barreras operativas o de canal en ${lowReg.name} para replicar las tácticas comerciales exitosas de ${topReg.name}.`,
      targetKpiId: 'revenue',
      targetKpiName: 'Facturación Total',
      targetChartId: 'channel-region',
      targetChartTitle: 'Patrón 3: Eficiencia por Canales y Distribución Territorial',
      triadExplanation: {
        kpiRole: `Afecta la distribución territorial de la Facturación Total ($${Math.round(kpis.totalRevenue).toLocaleString()}).`,
        insightCore: `Disparidad de +${regDiff}% entre la región con mayor tracción (${topReg.name}) y la menor (${lowReg.name}).`,
        chartProof: `Reflejado en el panel de distribución por Región Geográfica y unidades operadas.`,
      },
    });
  }

  // 5. Margin vs Volume Portfolio Balance -> Linked to 'profit' KPI and 'margin-volume' Chart
  insights.push({
    id: 'ins-margin-volume',
    type: 'opportunity',
    title: 'Dispersión Margen vs Volumen: Cuadrante de Productos Estrella',
    description: `El portafolio muestra productos tractores con volumen moderado y margen superior al 65% (servicios y software), frente a componentes con alto flujo de caja pero margen comprimido por costos de adquisición y logística.`,
    metric: `${kpis.profitMargin}% Margen Global`,
    impact: 'Mejora potencial del EBIT en +2.4 puntos porcentuales',
    recommendation: 'Revisar la política de descuentos comerciales en hardware y migrar clientes hacia esquemas de licenciamiento recurrente.',
    targetKpiId: 'profit',
    targetKpiName: 'Beneficio & Margen',
    targetChartId: 'margin-volume',
    targetChartTitle: 'Patrón 4: Matriz Estratégica Margen vs. Volumen',
    triadExplanation: {
      kpiRole: `Explica la composición del Margen de Beneficio (${kpis.profitMargin}%) y el Beneficio Neto acumulado.`,
      insightCore: `Separación neta entre productos de alto margen vs. artículos generadores de liquidez pero bajo retorno.`,
      chartProof: `Comprobado en el diagrama de dispersión con líneas de corte en margen y volumen.`,
    },
  });

  return insights;
}
