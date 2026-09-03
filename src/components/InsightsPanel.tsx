import React, { useState } from 'react';
import { InsightItem, KPIKey } from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Target,
  BarChart3,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface InsightsPanelProps {
  insights: InsightItem[];
  selectedInsightId: string | null;
  onSelectInsight: (insight: InsightItem) => void;
  activeKpiFilter?: KPIKey | 'all';
  onFilterKpiChange?: (kpi: KPIKey | 'all') => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  selectedInsightId,
  onSelectInsight,
  activeKpiFilter = 'all',
  onFilterKpiChange,
}) => {
  const [viewMode, setViewMode] = useState<'top3' | 'all'>('top3');
  const [internalKpiFilter, setInternalKpiFilter] = useState<KPIKey | 'all'>('all');

  const currentKpiFilter = onFilterKpiChange ? activeKpiFilter : internalKpiFilter;
  const handleKpiFilterSelect = (val: KPIKey | 'all') => {
    if (onFilterKpiChange) {
      onFilterKpiChange(val);
    } else {
      setInternalKpiFilter(val);
    }
  };

  const getBadgeStyle = (type: InsightItem['type']) => {
    switch (type) {
      case 'opportunity':
        return {
          icon: Zap,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Oportunidad',
        };
      case 'alert':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Alerta',
        };
      case 'trend':
        return {
          icon: TrendingUp,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Tendencia',
        };
      case 'strength':
      default:
        return {
          icon: CheckCircle,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Fortaleza',
        };
    }
  };

  const kpiFilterOptions: { key: KPIKey | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'revenue', label: 'Facturación' },
    { key: 'profit', label: 'Beneficio' },
    { key: 'units', label: 'Volumen' },
    { key: 'leaders', label: 'Líderes' },
  ];

  // In top3 mode, pick the top 3 highest priority insights
  const displayedInsights = viewMode === 'top3'
    ? insights.slice(0, 3)
    : currentKpiFilter === 'all'
      ? insights
      : insights.filter(i => i.targetKpiId === currentKpiFilter);

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {viewMode === 'top3' ? 'Conclusiones Clave del Negocio' : 'Todos los Hallazgos & Insights'}
            </h2>
            <p className="text-xs text-slate-500">
              {viewMode === 'top3' 
                ? 'Las 3 conclusiones más importantes explicadas en lenguaje directo' 
                : 'Catálogo completo de correlaciones entre métricas y gráficos'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Top 3 vs All */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('top3')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'top3'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Top 3 Claves
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ver Todos ({insights.length})
          </button>
        </div>
      </div>

      {/* KPI Filter bar (only when viewing all) */}
      {viewMode === 'all' && (
        <div className="mt-3 pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Filtrar:</span>
          {kpiFilterOptions.map((opt) => {
            const isSelected = currentKpiFilter === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => handleKpiFilterSelect(opt.key)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Insight Cards */}
      <div className={`mt-4 grid gap-4 ${viewMode === 'top3' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {displayedInsights.map((item) => {
          const badge = getBadgeStyle(item.type);
          const Icon = badge.icon;
          const isSelected = selectedInsightId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectInsight(item)}
              className={`group cursor-pointer rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between relative ${
                isSelected
                  ? 'border-blue-600 ring-3 ring-blue-500/25 bg-blue-50/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header: Insight Type & Metric */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badge.bg}`}>
                    <Icon className="w-3.5 h-3.5 mr-1 shrink-0" />
                    {badge.label}
                  </span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {item.metric}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                  {item.title}
                </h3>

                {/* Simplified Description */}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.description}
                </p>

                {/* KPI & Chart Link Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <Target className="w-3 h-3 text-blue-600" />
                    {item.targetKpiName}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 text-indigo-600" />
                    {item.targetChartTitle.replace(/Patrón \d+:\s*/, '').slice(0, 22)}...
                  </span>
                </div>

                {/* Actionable recommendation */}
                <div className="mt-2.5 p-2 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-150">
                  <strong className="text-slate-900 font-semibold">Acción: </strong>
                  {item.recommendation}
                </div>
              </div>

              {/* Action link */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                <span className="inline-flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {isSelected ? 'Mostrando en Gráfico' : 'Ver en Gráfico'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
