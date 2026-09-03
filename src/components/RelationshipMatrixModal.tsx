import React from 'react';
import { InsightItem } from '../types';
import { X, Layers, Target, Sparkles, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RelationshipMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: InsightItem[];
  selectedInsightId: string | null;
  onSelectInsight: (insight: InsightItem) => void;
}

export const RelationshipMatrixModal: React.FC<RelationshipMatrixModalProps> = ({
  isOpen,
  onClose,
  insights,
  selectedInsightId,
  onSelectInsight,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Matriz de Relación: KPI ⇄ Insight ⇄ Gráfico
              </h2>
              <p className="text-xs text-slate-500">
                Estructura relacional completa que conecta las métricas clave del negocio con sus hallazgos analíticos y gráficos demostrativos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="mt-4 flex-1 overflow-y-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-3 px-4">🎯 KPI Clave</th>
                <th className="py-3 px-4">💡 Insight Detectado</th>
                <th className="py-3 px-4">📊 Gráfico Demostrativo</th>
                <th className="py-3 px-4">🔗 Relación / Justificación</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {insights.map((item) => {
                const isSelected = selectedInsightId === item.id;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/50 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 font-medium' : ''
                    }`}
                    onClick={() => {
                      onSelectInsight(item);
                      onClose();
                    }}
                  >
                    {/* KPI */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{item.targetKpiName}</span>
                      </div>
                    </td>

                    {/* Insight */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Métrica: <strong className="text-slate-700">{item.metric}</strong>
                      </div>
                    </td>

                    {/* Chart */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-medium bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{item.targetChartTitle.replace(/Patrón \d+:\s*/, '')}</span>
                      </div>
                    </td>

                    {/* Explanation */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                      <div>
                        <strong>Impacto en KPI:</strong> {item.triadExplanation.kpiRole}
                      </div>
                      <div className="text-slate-500 mt-1">
                        <strong>Prueba en Gráfico:</strong> {item.triadExplanation.chartProof}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1 transition ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <span>Inspeccionar</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Haz clic en cualquier fila para activar automáticamente el resaltado sincronizado del KPI y del Gráfico.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
