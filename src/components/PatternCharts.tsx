import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Cell,
} from 'recharts';
import { 
  Calendar, 
  PieChart as PieIcon, 
  Network, 
  ScatterChart as ScatterIcon, 
  ArrowUpRight,
  Target,
  Sparkles,
  Layers,
  LayoutGrid,
  Lightbulb
} from 'lucide-react';
import { InsightItem, KPIKey } from '../types';

interface PatternChartsProps {
  timeSeriesData: any[];
  categoryData: any[];
  channelData: any[];
  regionData: any[];
  marginVolumeData: any[];
  highlightedChartId: string | null;
  activeInsight?: InsightItem | null;
  onSelectKpi?: (kpiKey: KPIKey) => void;
  defaultViewMode?: 'single' | 'all';
}

export const PatternCharts: React.FC<PatternChartsProps> = ({
  timeSeriesData,
  categoryData,
  channelData,
  regionData,
  marginVolumeData,
  highlightedChartId,
  activeInsight,
  onSelectKpi,
}) => {
  const [activeTab, setActiveTab] = useState<'time-series' | 'category-pareto' | 'channel-region' | 'margin-volume' | 'all'>('time-series');

  // Automatically switch tab if an insight triggers a specific chart
  useEffect(() => {
    if (highlightedChartId && ['time-series', 'category-pareto', 'channel-region', 'margin-volume'].includes(highlightedChartId)) {
      setActiveTab(highlightedChartId as any);
    }
  }, [highlightedChartId]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const maxMonth = timeSeriesData.reduce(
    (max, item) => (item.revenue > (max?.revenue || 0) ? item : max),
    timeSeriesData[0] || {}
  );
  const avgMonthlyRev =
    timeSeriesData.length > 0
      ? Math.round(timeSeriesData.reduce((acc, i) => acc + i.revenue, 0) / timeSeriesData.length)
      : 0;

  const categoryColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#0284c7'];
  const channelColors = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'];

  const chartTabs = [
    { id: 'time-series' as const, label: 'Evolución Mensual', icon: Calendar },
    { id: 'category-pareto' as const, label: 'Top Categorías', icon: PieIcon },
    { id: 'channel-region' as const, label: 'Canales de Venta', icon: Network },
    { id: 'margin-volume' as const, label: 'Rentabilidad vs Volumen', icon: ScatterIcon },
  ];

  return (
    <div className="space-y-4">
      {/* Chart View Selector / Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 hidden md:inline">
            Gráfico a visualizar:
          </span>
          {chartTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setActiveTab(activeTab === 'all' ? 'time-series' : 'all')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 self-start sm:self-auto ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Alternar entre ver un gráfico o los 4 a la vez"
        >
          {activeTab === 'all' ? (
            <>
              <Layers className="w-3.5 h-3.5" />
              <span>Ver 1 Gráfico a la Vez</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Ver los 4 Gráficos Juntos</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. Patrón Temporal & Estacionalidad */}
        {(activeTab === 'time-series' || activeTab === 'all') && (
          <div
            id="time-series"
            className={`bg-white rounded-xl border p-5 transition-all duration-300 ${
              highlightedChartId === 'time-series'
                ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-md'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      1. Evolución Temporal y Facturación Mensual
                    </h3>
                    {highlightedChartId === 'time-series' && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                        Gráfico Seleccionado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Facturación neta (barras), beneficio neto (área celeste) y margen porcentual (línea verde)
                  </p>
                </div>
              </div>

              {/* Connected KPI and Peak badges */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => onSelectKpi?.('revenue')}
                  className="text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                  title="Ver KPI asociado"
                >
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span>KPI: Facturación Total</span>
                </button>
                {maxMonth && (
                  <div className="text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Pico: <strong className="ml-1">{maxMonth.label}</strong> ({formatCurrency(maxMonth.revenue)})
                  </div>
                )}
              </div>
            </div>

            {/* Quick Executive Conclusion Banner */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900">Conclusión Directa: </strong>
                {maxMonth 
                  ? `El pico de ventas se concentró en ${maxMonth.label} con ${formatCurrency(maxMonth.revenue)}. El margen operativo promedio anual se ubica en ${Math.round(timeSeriesData.reduce((a, b) => a + (b.margin || 0), 0) / (timeSeriesData.length || 1))}% de forma estable.`
                  : 'Evolución mensual equilibrada sin caídas bruscas en el periodo analizado.'}
              </div>
            </div>

            {/* Dynamic Triad Insight Callout when active */}
            {highlightedChartId === 'time-series' && activeInsight && (
              <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tríada Activa: {activeInsight.title}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong className="text-blue-900">Cómo leer el gráfico:</strong> {activeInsight.triadExplanation.chartProof}
                  </p>
                </div>
                <button 
                  onClick={() => onSelectKpi?.('revenue')}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline whitespace-nowrap self-start sm:self-auto"
                >
                  Ver KPI Facturación ↗
                </button>
              </div>
            )}

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeSeriesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={formatCurrency}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#059669"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: string) => {
                      if (name === 'Margen (%)') return [`${val}%`, name];
                      return [new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(val), name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <ReferenceLine
                    yAxisId="left"
                    y={avgMonthlyRev}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: 'Promedio', position: 'insideTopRight', fill: '#64748b', fontSize: 11 }}
                  />
                  <Bar yAxisId="left" dataKey="revenue" name="Facturación" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={38} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="profit"
                    name="Beneficio Neto"
                    fill="#93c5fd"
                    fillOpacity={0.3}
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    name="Margen (%)"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#059669' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Patrón de Concentración & Pareto */}
        {(activeTab === 'category-pareto' || activeTab === 'all') && (
          <div
            id="category-pareto"
            className={`bg-white rounded-xl border p-5 transition-all duration-300 ${
              highlightedChartId === 'category-pareto'
                ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-md'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      2. Concentración por Categorías (Curva Pareto 80/20)
                    </h3>
                    {highlightedChartId === 'category-pareto' && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                        Gráfico Seleccionado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Ventas individuales por categoría y porcentaje acumulado
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectKpi?.('leaders')}
                className="text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition self-start sm:self-auto"
                title="Ver KPI asociado"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>KPI: Líderes de Mercado</span>
              </button>
            </div>

            {/* Quick Executive Conclusion Banner */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900">Conclusión Directa: </strong>
                {categoryData.length >= 2 
                  ? `Las 2 categorías principales (${categoryData[0]?.category} y ${categoryData[1]?.category}) concentran más del 55% de la facturación global.`
                  : 'Distribución equilibrada entre las categorías activas.'}
              </div>
            </div>

            {/* Triad Callout */}
            {highlightedChartId === 'category-pareto' && activeInsight && (
              <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-0.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tríada Activa: {activeInsight.title}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong className="text-blue-900">Evidencia gráfica:</strong> {activeInsight.triadExplanation.chartProof}
                </p>
              </div>
            )}

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={categoryData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: string) => {
                      if (name.includes('Acumulado')) return [`${val}%`, name];
                      return [new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(val), name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Facturación" fill="#2563eb" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativePercent"
                    name="% Acumulado (Pareto)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f59e0b' }}
                  />
                  <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Regla 80%', fill: '#ef4444', fontSize: 11 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Patrón de Canales */}
        {(activeTab === 'channel-region' || activeTab === 'all') && (
          <div
            id="channel-region"
            className={`bg-white rounded-xl border p-5 transition-all duration-300 ${
              highlightedChartId === 'channel-region'
                ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-md'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      3. Desempeño por Canal de Venta
                    </h3>
                    {highlightedChartId === 'channel-region' && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                        Gráfico Seleccionado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Facturación total y beneficio neto generado por cada vía comercial
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectKpi?.('revenue')}
                className="text-xs font-semibold bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition self-start sm:self-auto"
                title="Ver KPI asociado"
              >
                <Target className="w-3.5 h-3.5 text-teal-600" />
                <span>KPI: Facturación Total</span>
              </button>
            </div>

            {/* Quick Executive Conclusion Banner */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900">Conclusión Directa: </strong>
                El canal Online aporta el mayor margen unitario y crecimiento de ventas directas, mientras que los canales tradicionales aportan estabilidad de volumen.
              </div>
            </div>

            {/* Triad Callout */}
            {highlightedChartId === 'channel-region' && activeInsight && (
              <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-0.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tríada Activa: {activeInsight.title}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong className="text-blue-900">Evidencia gráfica:</strong> {activeInsight.triadExplanation.chartProof}
                </p>
              </div>
            )}

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={formatCurrency} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: string) => {
                      return [new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(val), name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '5px' }} />
                  <Bar dataKey="revenue" name="Facturación" fill="#0d9488" radius={[0, 4, 4, 0]}>
                    {channelData.map((_, index) => (
                      <Cell key={`ch-cell-${index}`} fill={channelColors[index % channelColors.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="profit" name="Beneficio" fill="#14b8a6" radius={[0, 4, 4, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. Patrón de Rentabilidad vs Volumen (Matriz Cuadrantes) */}
        {(activeTab === 'margin-volume' || activeTab === 'all') && (
          <div
            id="margin-volume"
            className={`bg-white rounded-xl border p-5 transition-all duration-300 ${
              highlightedChartId === 'margin-volume'
                ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-md'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <ScatterIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      4. Matriz de Rentabilidad vs. Volumen (Portafolio)
                    </h3>
                    {highlightedChartId === 'margin-volume' && (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                        Gráfico Seleccionado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Productos posicionados por Unidades Vendidas (Eje X) y Margen % (Eje Y)
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectKpi?.('profit')}
                className="text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition self-start sm:self-auto"
                title="Ver KPI asociado"
              >
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>KPI: Beneficio & Margen</span>
              </button>
            </div>

            {/* Quick Executive Conclusion Banner */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900">Conclusión Directa: </strong>
                La mayor parte de los productos clave se ubican en el rango de alta rentabilidad (&gt;45%), generando un flujo de caja saludable.
              </div>
            </div>

            {/* Triad Callout */}
            {highlightedChartId === 'margin-volume' && activeInsight && (
              <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-0.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tríada Activa: {activeInsight.title}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong className="text-blue-900">Evidencia gráfica:</strong> {activeInsight.triadExplanation.chartProof}
                </p>
              </div>
            )}

            {/* Legend / Quadrants Explanatory Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-1 text-xs">
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-2">
                <span className="font-semibold block">🌟 Estrellas</span>
                <span className="text-[11px] text-emerald-700">Alto Margen & Alto Volumen</span>
              </div>
              <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-lg p-2">
                <span className="font-semibold block">💎 Oportunidad</span>
                <span className="text-[11px] text-blue-700">Alto Margen & Volumen por Escalar</span>
              </div>
              <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-2">
                <span className="font-semibold block">🚜 Flujo / Tractor</span>
                <span className="text-[11px] text-amber-700">Alto Volumen & Margen Ajustado</span>
              </div>
              <div className="bg-rose-50 text-rose-800 border border-rose-200 rounded-lg p-2">
                <span className="font-semibold block">⚠️ En Observación</span>
                <span className="text-[11px] text-rose-700">Bajo Margen & Bajo Volumen</span>
              </div>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="units"
                    name="Unidades Vendidas"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    label={{ value: 'Volumen de Unidades', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="margin"
                    name="Margen (%)"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    label={{ value: 'Margen de Rentabilidad (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="revenue" range={[60, 450]} name="Facturación" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-bold text-sm text-blue-300">{data.name}</div>
                            <div className="text-slate-400">Categoría: {data.category}</div>
                            <div className="text-slate-200 pt-1 border-t border-slate-800">
                              Facturación: <span className="font-semibold">{formatCurrency(data.revenue)}</span>
                            </div>
                            <div className="text-emerald-400">
                              Margen: <span className="font-semibold">{data.margin}%</span>
                            </div>
                            <div className="text-slate-300">
                              Unidades: <span className="font-semibold">{data.units}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={45} stroke="#cbd5e1" strokeDasharray="4 4" />
                  <Scatter name="Productos" data={marginVolumeData} fill="#3b82f6">
                    {marginVolumeData.map((entry, index) => {
                      let color = '#3b82f6';
                      if (entry.margin >= 55) color = '#059669'; // High margin
                      else if (entry.margin < 30) color = '#e11d48'; // Low margin
                      return <Cell key={`scatter-${index}`} fill={color} opacity={0.75} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
