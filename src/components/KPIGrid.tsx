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
  Sparkles
} from 'lucide-react';

interface KPIGridProps {
  kpis: KPIData;
  highlightedKpiId?: KPIKey | null;
  selectedKpiId?: KPIKey | null;
  onSelectKpi?: (kpiKey: KPIKey) => void;
  activeInsight?: InsightItem | null;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ 
  kpis,
  highlightedKpiId,
  selectedKpiId,
  onSelectKpi,
  activeInsight,
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

  const getCardClasses = (key: KPIKey) => {
    const isHighlighted = highlightedKpiId === key;
    const isSelected = selectedKpiId === key;

    if (isHighlighted || isSelected) {
      return 'border-blue-500 ring-3 ring-blue-500/25 bg-blue-50/40 shadow-sm';
    }
    return 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs';
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-blue-600" />
          Métricas Clave del Negocio
        </span>
        {activeInsight && (
          <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Vinculado con: <strong className="font-semibold">{activeInsight.targetKpiName}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Facturación Total */}
        <div 
          id="kpi-revenue"
          onClick={() => onSelectKpi?.('revenue')}
          className={`rounded-xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('revenue')}`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Facturación Total
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(kpis.totalRevenue)}
              </span>
            </div>

            <div className="mt-2 flex items-center text-xs">
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

          {(highlightedKpiId === 'revenue' || selectedKpiId === 'revenue') && (
            <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>🎯 KPI Seleccionado</span>
              <span className="text-[11px] underline">Ver en Gráfico ↓</span>
            </div>
          )}
        </div>

        {/* 2. Beneficio & Margen */}
        <div 
          id="kpi-profit"
          onClick={() => onSelectKpi?.('profit')}
          className={`rounded-xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('profit')}`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Beneficio & Margen
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(kpis.totalProfit)}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                {kpis.profitMargin}% margen
              </span>
            </div>

            <div className="mt-2 flex items-center text-xs">
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
              <span className="text-slate-400 ml-2">variación de margen</span>
            </div>
          </div>

          {(highlightedKpiId === 'profit' || selectedKpiId === 'profit') && (
            <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>🎯 KPI Seleccionado</span>
              <span className="text-[11px] underline">Ver en Gráfico ↓</span>
            </div>
          )}
        </div>

        {/* 3. Volumen & Ticket Medio */}
        <div 
          id="kpi-units"
          onClick={() => onSelectKpi?.('units')}
          className={`rounded-xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('units')}`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Volumen Vendido
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpis.totalUnits.toLocaleString()} <span className="text-sm font-normal text-slate-500">uds</span>
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Ticket: {formatCurrency(kpis.avgOrderValue)}
              </span>
            </div>

            <div className="mt-2 flex items-center text-xs">
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

          {(highlightedKpiId === 'units' || selectedKpiId === 'units') && (
            <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>🎯 KPI Seleccionado</span>
              <span className="text-[11px] underline">Ver en Gráfico ↓</span>
            </div>
          )}
        </div>

        {/* 4. Líderes de Desempeño */}
        <div 
          id="kpi-leaders"
          onClick={() => onSelectKpi?.('leaders')}
          className={`rounded-xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${getCardClasses('leaders')}`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Líder Comercial
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 space-y-1">
              <div className="text-lg font-bold text-slate-900 truncate" title={kpis.topCategory}>
                {kpis.topCategory}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Región líder:</span>
                <span className="font-semibold text-slate-800">{kpis.topRegion}</span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400">
              Mayor concentración de facturación
            </div>
          </div>

          {(highlightedKpiId === 'leaders' || selectedKpiId === 'leaders') && (
            <div className="mt-3 pt-2 border-t border-blue-200 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>🎯 KPI Seleccionado</span>
              <span className="text-[11px] underline">Ver en Gráfico ↓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
