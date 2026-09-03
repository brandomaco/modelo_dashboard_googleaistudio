export interface DataRecord {
  id: string | number;
  date: string; // YYYY-MM-DD
  category: string;
  product: string;
  region: string;
  channel: string;
  customerSegment: string;
  revenue: number;
  cost: number;
  profit: number;
  units: number;
  customerSatisfaction?: number; // 1 - 10
  [key: string]: any;
}

export interface KPIData {
  totalRevenue: number;
  revenueChange: number; // percentage
  totalProfit: number;
  profitChange: number;
  profitMargin: number; // percentage
  marginChange: number;
  totalUnits: number;
  unitsChange: number;
  avgOrderValue: number;
  aovChange: number;
  topCategory: string;
  topRegion: string;
}

export type KPIKey = 'revenue' | 'profit' | 'units' | 'leaders';

export type InsightType = 'opportunity' | 'alert' | 'trend' | 'strength';

export interface InsightItem {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  metric: string;
  impact: string;
  recommendation: string;
  // Relationship with KPI and Chart
  targetKpiId: KPIKey;
  targetKpiName: string;
  targetChartId: 'time-series' | 'category-pareto' | 'channel-region' | 'margin-volume' | 'table';
  targetChartTitle: string;
  triadExplanation: {
    kpiRole: string;
    insightCore: string;
    chartProof: string;
  };
  highlightFilter?: {
    key: string;
    value: string;
  };
}

export interface FilterState {
  period: 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2';
  category: string;
  region: string;
  channel: string;
  searchQuery: string;
  metricView: 'revenue' | 'profit' | 'units';
}

export interface SheetInfo {
  name: string;
  rowCount: number;
  columns: string[];
}
