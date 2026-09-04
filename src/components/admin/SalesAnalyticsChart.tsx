import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  Package,
  Layers,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { adminClient } from '../../services/adminClient';
import { formatCurrency } from '../../utils/currency';

type PeriodType = 'daily' | 'weekly' | 'monthly';
type MetricType = 'revenue' | 'orders' | 'units' | 'avgOrderValue';

interface SalesSeriesItem {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  units: number;
  avgOrderValue: number;
}

interface AnalyticsData {
  period: string;
  series: SalesSeriesItem[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalUnits: number;
    averageOrderValue: number;
  };
  categoryDistribution: Array<{ name: string; value: number }>;
}

const CATEGORY_COLORS = ['#E2B714', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316'];

export const SalesAnalyticsChart: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [activeMetric, setActiveMetric] = useState<MetricType>('revenue');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (selectedPeriod: PeriodType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.getSalesAnalytics(selectedPeriod);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const metricConfig = {
    revenue: {
      label: 'Gross Revenue',
      color: '#E2B714',
      format: (val: number) => formatCurrency(val),
    },
    orders: {
      label: 'Order Volume',
      color: '#10B981',
      format: (val: number) => `${val} orders`,
    },
    units: {
      label: 'Units Dispatched',
      color: '#3B82F6',
      format: (val: number) => `${val} units`,
    },
    avgOrderValue: {
      label: 'Avg Order Value (AOV)',
      color: '#8B5CF6',
      format: (val: number) => formatCurrency(val),
    },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point: SalesSeriesItem = payload[0].payload;
      return (
        <div className="p-3.5 bg-stone-950 text-white dark:bg-[#1A1A1A] border border-stone-800 dark:border-white/20 rounded-xs shadow-2xl text-xs space-y-1.5 min-w-[180px]">
          <p className="font-semibold text-stone-200 uppercase tracking-wider text-[10px] border-b border-stone-800 pb-1">
            {point.label || label}
          </p>
          <div className="flex justify-between gap-4 pt-1">
            <span className="text-stone-400">Revenue:</span>
            <span className="font-bold text-amber-400">{formatCurrency(point.revenue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-stone-400">Orders:</span>
            <span className="font-medium text-emerald-400">{point.orders}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-stone-400">Items Sold:</span>
            <span className="font-medium text-blue-400">{point.units}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-stone-400">Avg Ticket:</span>
            <span className="font-medium text-purple-400">{formatCurrency(point.avgOrderValue)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs p-6 sm:p-8 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-950 dark:text-white">
              Financial & Sales Analytics
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Real-time revenue telemetry and order frequency aggregated directly from MongoDB transactions
          </p>
        </div>

        {/* Filters & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter */}
          <div className="inline-flex p-1 bg-stone-100 dark:bg-zinc-800 rounded-xs border border-stone-200 dark:border-white/10 text-xs">
            {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-white dark:bg-[#121212] text-stone-950 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white'
                }`}
              >
                {p === 'daily' ? 'Daily (14D)' : p === 'weekly' ? 'Weekly (8W)' : 'Monthly (6M)'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(period)}
            disabled={loading}
            className="p-2 text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-white/10 rounded-xs transition-colors cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Revenue */}
          <div
            onClick={() => setActiveMetric('revenue')}
            className={`p-4 rounded-xs border transition-all cursor-pointer ${
              activeMetric === 'revenue'
                ? 'bg-amber-500/10 border-amber-500/50 dark:bg-amber-500/20'
                : 'bg-stone-50 dark:bg-zinc-900 border-stone-200 dark:border-white/10 hover:border-stone-400'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              Total Revenue
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-950 dark:text-white mt-1 block">
              {formatCurrency(data.summary.totalRevenue)}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> Live transactions
            </span>
          </div>

          {/* Total Orders */}
          <div
            onClick={() => setActiveMetric('orders')}
            className={`p-4 rounded-xs border transition-all cursor-pointer ${
              activeMetric === 'orders'
                ? 'bg-emerald-500/10 border-emerald-500/50 dark:bg-emerald-500/20'
                : 'bg-stone-50 dark:bg-zinc-900 border-stone-200 dark:border-white/10 hover:border-stone-400'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              Total Orders
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-950 dark:text-white mt-1 block">
              {data.summary.totalOrders}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-1">
              <ShoppingBag className="w-3 h-3" /> Processed & fulfilled
            </span>
          </div>

          {/* Units Sold */}
          <div
            onClick={() => setActiveMetric('units')}
            className={`p-4 rounded-xs border transition-all cursor-pointer ${
              activeMetric === 'units'
                ? 'bg-blue-500/10 border-blue-500/50 dark:bg-blue-500/20'
                : 'bg-stone-50 dark:bg-zinc-900 border-stone-200 dark:border-white/10 hover:border-stone-400'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              Pieces Dispatched
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-950 dark:text-white mt-1 block">
              {data.summary.totalUnits}
            </span>
            <span className="text-[10px] text-blue-700 dark:text-blue-300 flex items-center gap-1 mt-1">
              <Package className="w-3 h-3" /> Garments & footwear
            </span>
          </div>

          {/* Average Order Value */}
          <div
            onClick={() => setActiveMetric('avgOrderValue')}
            className={`p-4 rounded-xs border transition-all cursor-pointer ${
              activeMetric === 'avgOrderValue'
                ? 'bg-purple-500/10 border-purple-500/50 dark:bg-purple-500/20'
                : 'bg-stone-50 dark:bg-zinc-900 border-stone-200 dark:border-white/10 hover:border-stone-400'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              Average Order (AOV)
            </span>
            <span className="text-xl sm:text-2xl font-bold font-serif text-stone-950 dark:text-white mt-1 block">
              {formatCurrency(data.summary.averageOrderValue)}
            </span>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 flex items-center gap-1 mt-1">
              <Layers className="w-3 h-3" /> Mean basket size
            </span>
          </div>
        </div>
      )}

      {/* Main Chart Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300">
            {metricConfig[activeMetric].label} Timeline
          </h3>
          <span className="text-[11px] text-stone-500">
            Current Metric: <strong className="text-stone-900 dark:text-white">{metricConfig[activeMetric].label}</strong>
          </span>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center bg-stone-50 dark:bg-zinc-900/30 rounded-xs border border-stone-200 dark:border-white/5">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
          </div>
        ) : error ? (
          <div className="h-72 flex items-center justify-center bg-rose-50 dark:bg-rose-950/20 rounded-xs border border-rose-200 dark:border-rose-800/30 text-xs text-rose-700 p-4 text-center">
            {error}
          </div>
        ) : data && data.series && data.series.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricConfig[activeMetric].color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={metricConfig[activeMetric].color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis
                  dataKey="label"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    activeMetric === 'revenue' || activeMetric === 'avgOrderValue'
                      ? `₹${(val / 1000).toFixed(0)}k`
                      : val
                  }
                  dx={-8}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke={metricConfig[activeMetric].color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#metricGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center bg-stone-50 dark:bg-zinc-900/30 rounded-xs text-xs text-stone-500">
            No order transaction data available for this range.
          </div>
        )}
      </div>

      {/* Category Distribution Breakdown */}
      {data && data.categoryDistribution && data.categoryDistribution.length > 0 && (
        <div className="pt-6 border-t border-stone-200 dark:border-white/10">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-700 dark:text-stone-300 mb-4">
            Category Revenue Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.categoryDistribution.map((cat, idx) => {
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              const pct = data.summary.totalRevenue > 0
                ? Math.round((cat.value / data.summary.totalRevenue) * 100)
                : 0;

              return (
                <div
                  key={cat.name}
                  className="p-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-stone-950 dark:text-stone-200 mt-1 block">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-300 rounded">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
