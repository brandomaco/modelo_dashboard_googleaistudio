import React from 'react';
import { InsightItem, KPIKey } from '../types';
import { Target, Lightbulb, BarChart3, ArrowRight, X, Layers, Link2 } from 'lucide-react';

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
    <aside 
      aria-label="Relación activa entre métricas" 
      className="bg-white border-2 border-blue-500 rounded-xl p-3 sm:p-3.5 shadow-md animate-in fade-in space-y-2"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Indicator with Link Icon */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Relación Activa de la Tríada
            </span>
            <span className="text-[11px] text-slate-500">
              Sincronización interactiva entre los 3 niveles
            </span>
          </div>
        </div>

        {/* The Triad Flow: KPI (🎯) -> Insight (💡) -> Chart (📊) */}
        {activeInsight ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 1. KPI Node */}
            <button
              onClick={() => onFocusKpi(activeInsight.targetKpiId)}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-left cursor-pointer group shadow-2xs"
              title="Focalizar KPI"
            >
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Target className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 block leading-none">
                  1. KPI
                </span>
                <span className="font-semibold text-slate-800 text-xs">
                  {activeInsight.targetKpiName}
                </span>
              </div>
            </button>

            <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 hidden sm:inline" />

            {/* 2. Insight Node */}
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
              <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Lightbulb className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-700 block leading-none">
                  2. Insight
                </span>
                <span className="font-semibold text-slate-800 text-xs truncate max-w-[200px]" title={activeInsight.title}>
                  {activeInsight.title}
                </span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 hidden sm:inline" />

            {/* 3. Chart Node */}
            <button
              onClick={() => onFocusChart(activeInsight.targetChartId)}
              className="bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-left cursor-pointer group shadow-2xs"
              title="Desplazar al gráfico"
            >
              <span className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0">
                <BarChart3 className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-700 block leading-none">
                  3. Gráfico
                </span>
                <span className="font-semibold text-slate-800 text-xs truncate max-w-[180px]">
                  {activeInsight.targetChartTitle.replace(/Patrón \d+:\s*/, '')}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="text-xs text-blue-900 font-medium flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>Filtro por KPI activado ({selectedKpiId}). Selecciona una conclusión para proyectar su gráfico.</span>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMatrixModal}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Ver Matriz</span>
          </button>
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            title="Cerrar relación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
