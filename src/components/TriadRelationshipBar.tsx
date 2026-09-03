import React from 'react';
import { InsightItem, KPIKey } from '../types';
import { Target, Sparkles, BarChart3, ArrowRight, X, Layers } from 'lucide-react';

interface TriadRelationshipBarProps {
  activeInsight: InsightItem | null;
  selectedKpiId: KPIKey | null;
  onClear: () => void;
  onFocusKpi: (kpiKey: KPIKey) => void;
  onFocusChart: (chartId: string) => void;
  onToggleMatrixModal: () => void;
}

export const TriadRelationshipBar: React.FC<TriadRelationshipBarProps> = ({
  activeInsight,
  selectedKpiId,
  onClear,
  onFocusKpi,
  onFocusChart,
  onToggleMatrixModal,
}) => {
  if (!activeInsight && !selectedKpiId) return null;

  return (
    <aside aria-label="Relación activa entre métricas" className="bg-blue-50/90 border border-blue-200 text-slate-900 rounded-xl p-3 shadow-xs animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Indicator */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-blue-900">
            Relación Activa:
          </span>
        </div>

        {/* The Triad Flow: KPI -> Insight -> Chart */}
        {activeInsight ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 1. KPI Node */}
            <button
              onClick={() => onFocusKpi(activeInsight.targetKpiId)}
              className="bg-white hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition text-left cursor-pointer"
              title="Focalizar KPI"
            >
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-800">
                {activeInsight.targetKpiName}
              </span>
            </button>

            <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />

            {/* 2. Insight Node */}
            <div className="bg-white border border-indigo-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-medium text-slate-800 truncate max-w-xs" title={activeInsight.title}>
                {activeInsight.title}
              </span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />

            {/* 3. Chart Node */}
            <button
              onClick={() => onFocusChart(activeInsight.targetChartId)}
              className="bg-white hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition text-left cursor-pointer"
              title="Desplazar al gráfico"
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                {activeInsight.targetChartTitle.replace(/Patrón \d+:\s*/, '')}
              </span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-blue-800 font-medium">
            Filtro por KPI activo. Selecciona una conclusión para ver su gráfico.
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMatrixModal}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition"
          >
            Ver Matriz
          </button>
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-200/50 transition"
            title="Cerrar relación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
