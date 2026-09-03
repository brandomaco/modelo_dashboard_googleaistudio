import React from 'react';
import { KPIData, KPIKey, InsightItem } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Package, 
  Award, 
  Target,
  Lightbulb,
  BarChart3,
  Link2,
  ArrowRight
} from 'lucide-react';

interface KPIGridProps {
  kpis: KPIData;
  highlightedKpiId?: KPIKey | null;
  selectedKpiId?: KPIKey | null;
  onSelectKpi?: (kpiKey: KPIKey) => void;
  activeInsight?: InsightItem | null;
  insights?: InsightItem[];
}

export const KPIGrid: React.FC<KPIGridProps> = ({ 
  kpis,
  highlightedKpiId,
  selectedKpiId,
  onSelectKpi,
  activeInsight,
  insights = [],
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPercent = (val: number) => {
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val.toFixed(1)}%`;
  };

  // Helper to find the representative insight and chart for each KPI
  const getRelatedData = (key: KPIKey) => {
    const match = insights.find((i) => i.targetKpiId === key);
    if (match) {
      return {
        insightTitle: match.title,
        chartTitle: match.targetChartTitle.replace(/Patrón \d+:\s*/, ''),
      };
    }
    // Fallback defaults
    switch (key) {
      case 'revenue':
        return { insightTitle: 'Pico Estacional en Q4', chartTitle: 'Evolución Mensual' };
      case 'profit':
        return { insightTitle: 'Mayor Margen en Canal Digital', chartTitle: 'Rentabilidad vs Volumen' };
      case 'units':
        return { insightTitle: 'Concentración en Categoría Principal', chartTitle: 'Canales de Venta' };
      case 'leaders':
        return { insightTitle: 'Regla 80/20 en Portafolio', chartTitle: 'Top Categorías (Pareto)' };
    }
  };

  const getCardClasses = (key: KPIKey) => {
    const isHighlighted = highlightedKpiId === key;
    const isSelected = selectedKpiId === key;

    if (isHighlighted || isSelected) {
      return 'border-blue-500 ring-3 ring-blue-500/25 bg-blue-50/40 shadow-sm';
    }
    return 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs';
  };

  const revenueRel = getRelatedData('revenue');
  const profitRel = getRelatedData('profit');
  const unitsRel = getRelatedData('units');
  const leadersRel = getRelatedData('leaders');

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            1. Métricas Clave (KPIs)
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Cada métrica está conectada a su <strong className="text-slate-700">💡 Insight</strong> y <strong className="text-slate-700">📊 Gráfico</strong>
          </span>
        </div>

        {activeInsight && (
          <span className="text-xs font-medium text-blue-800 bg-blue-100/80 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-blue-600" />
            KPI Vinculado: <strong className="font-bold">{activeInsight.targetKpiName}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Facturación Total */}
        <div 
          id="kpi-revenue"
          onClick={() => onSelectKpi?.('revenue')}
          className={`rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('revenue')}`}
        >
          <div>
            {/* Header with KPI Icon Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                <Target className="w-3 h-3 text-blue-600" />
                KPI: Facturación
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(kpis.totalRevenue)}
              </span>
            </div>

            <div className="mt-1.5 flex items-center text-xs">
              <span
                className={`inline-flex items-center font-semibold px-2 py-0.5 rounded ${
                  kpis.revenueChange >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}
              >
                {kpis.revenueChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                )}
                {formatPercent(kpis.revenueChange)}
              </span>
              <span className="text-slate-400 ml-2">vs. periodo anterior</span>
            </div>
          </div>

          {/* Connected Triad Icons Block */}
          <div className="mt-4 pt-3 border-t border-slate-150 space-y-1.5 bg-slate-50/60 -mx-1 p-2 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={revenueRel.insightTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-100 text-amber-700 shrink-0">
                <Lightbulb className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Insight:</span>
              <span className="truncate">{revenueRel.insightTitle}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={revenueRel.chartTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-teal-100 text-teal-700 shrink-0">
                <BarChart3 className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Gráfico:</span>
              <span className="truncate font-medium text-teal-800">{revenueRel.chartTitle}</span>
            </div>
          </div>
        </div>

        {/* 2. Beneficio & Margen */}
        <div 
          id="kpi-profit"
          onClick={() => onSelectKpi?.('profit')}
          className={`rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('profit')}`}
        >
          <div>
            {/* Header with KPI Icon Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                <Target className="w-3 h-3 text-emerald-600" />
                KPI: Beneficio
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(kpis.totalProfit)}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                {kpis.profitMargin}%
              </span>
            </div>

            <div className="mt-1.5 flex items-center text-xs">
              <span
                className={`inline-flex items-center font-semibold px-2 py-0.5 rounded ${
                  kpis.marginChange >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}
              >
                {kpis.marginChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                )}
                {formatPercent(kpis.marginChange)} pts
              </span>
              <span className="text-slate-400 ml-2">margen operativo</span>
            </div>
          </div>

          {/* Connected Triad Icons Block */}
          <div className="mt-4 pt-3 border-t border-slate-150 space-y-1.5 bg-slate-50/60 -mx-1 p-2 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={profitRel.insightTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-100 text-amber-700 shrink-0">
                <Lightbulb className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Insight:</span>
              <span className="truncate">{profitRel.insightTitle}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={profitRel.chartTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-teal-100 text-teal-700 shrink-0">
                <BarChart3 className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Gráfico:</span>
              <span className="truncate font-medium text-teal-800">{profitRel.chartTitle}</span>
            </div>
          </div>
        </div>

        {/* 3. Volumen & Ticket Medio */}
        <div 
          id="kpi-units"
          onClick={() => onSelectKpi?.('units')}
          className={`rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('units')}`}
        >
          <div>
            {/* Header with KPI Icon Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                <Target className="w-3 h-3 text-indigo-600" />
                KPI: Volumen
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpis.totalUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">uds</span>
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Ticket: {formatCurrency(kpis.avgOrderValue)}
              </span>
            </div>

            <div className="mt-1.5 flex items-center text-xs">
              <span
                className={`inline-flex items-center font-semibold px-2 py-0.5 rounded ${
                  kpis.unitsChange >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}
              >
                {kpis.unitsChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                )}
                {formatPercent(kpis.unitsChange)}
              </span>
              <span className="text-slate-400 ml-2">unidades vendidas</span>
            </div>
          </div>

          {/* Connected Triad Icons Block */}
          <div className="mt-4 pt-3 border-t border-slate-150 space-y-1.5 bg-slate-50/60 -mx-1 p-2 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={unitsRel.insightTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-100 text-amber-700 shrink-0">
                <Lightbulb className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Insight:</span>
              <span className="truncate">{unitsRel.insightTitle}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={unitsRel.chartTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-teal-100 text-teal-700 shrink-0">
                <BarChart3 className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Gráfico:</span>
              <span className="truncate font-medium text-teal-800">{unitsRel.chartTitle}</span>
            </div>
          </div>
        </div>

        {/* 4. Líderes de Desempeño */}
        <div 
          id="kpi-leaders"
          onClick={() => onSelectKpi?.('leaders')}
          className={`rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('leaders')}`}
        >
          <div>
            {/* Header with KPI Icon Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                <Target className="w-3 h-3 text-amber-600" />
                KPI: Líderes
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate" title={kpis.topCategory}>
                {kpis.topCategory}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Región líder:</span>
                <span className="font-semibold text-slate-800">{kpis.topRegion}</span>
              </div>
            </div>

            <div className="mt-1.5 text-[11px] text-slate-400">
              Mayor volumen de facturación
            </div>
          </div>

          {/* Connected Triad Icons Block */}
          <div className="mt-4 pt-3 border-t border-slate-150 space-y-1.5 bg-slate-50/60 -mx-1 p-2 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={leadersRel.insightTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-amber-100 text-amber-700 shrink-0">
                <Lightbulb className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Insight:</span>
              <span className="truncate">{leadersRel.insightTitle}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate" title={leadersRel.chartTitle}>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-teal-100 text-teal-700 shrink-0">
                <BarChart3 className="w-3 h-3" />
              </span>
              <span className="font-semibold text-slate-500">Gráfico:</span>
              <span className="truncate font-medium text-teal-800">{leadersRel.chartTitle}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
