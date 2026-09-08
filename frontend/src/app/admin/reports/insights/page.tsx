'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { reportsService } from '@/services/reportsService';
import { Card, KPICard, Sparkline } from '@/components/reports';
import { 
  TrendingUp, TrendingDown, Brain, AlertCircle, CheckCircle, 
  ArrowRight, Calendar, Target, Lightbulb, BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<Record<string, any[]>>({});
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('30d');

  useEffect(() => { reportsService.getInsights().then((d) => setMetrics(d.metrics)); }, []);

  // Mock forecast data
  const forecastData = {
    revenue: [
      { month: 'Jan', actual: 125000, forecast: 130000 },
      { month: 'Feb', actual: 142000, forecast: 138000 },
      { month: 'Mar', actual: 156000, forecast: 150000 },
      { month: 'Apr', actual: 168000, forecast: 165000 },
      { month: 'May', actual: 175000, forecast: 180000 },
      { month: 'Jun', forecast: 192000 },
      { month: 'Jul', forecast: 205000 },
      { month: 'Aug', forecast: 218000 },
    ],
    projects: [
      { month: 'Jan', actual: 12, forecast: 14 },
      { month: 'Feb', actual: 15, forecast: 16 },
      { month: 'Mar', actual: 18, forecast: 19 },
      { month: 'Apr', actual: 20, forecast: 22 },
      { month: 'May', actual: 22, forecast: 24 },
      { month: 'Jun', forecast: 26 },
      { month: 'Jul', forecast: 28 },
      { month: 'Aug', forecast: 30 },
    ],
  };

  const recommendations = [
    {
      id: 1,
      type: 'opportunity',
      title: 'Increase Project Pipeline',
      description: 'Based on current trends, project completions are up 15% month-over-month. Consider increasing resource allocation to capitalize on this momentum.',
      impact: 'high',
      category: 'Growth',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Inventory Reorder Needed',
      description: '3 critical inventory items are projected to run out within 2 weeks based on current consumption rates.',
      impact: 'high',
      category: 'Operations',
    },
    {
      id: 3,
      type: 'insight',
      title: 'Employee Retention Trend',
      description: 'Employee retention rate has improved by 8% this quarter. The new onboarding program appears to be effective.',
      impact: 'medium',
      category: 'HR',
    },
    {
      id: 4,
      type: 'opportunity',
      title: 'Lead Conversion Optimization',
      description: 'CRM data shows a 22% conversion rate for leads in the "proposal" stage. Focus follow-up efforts on this segment.',
      impact: 'medium',
      category: 'Sales',
    },
    {
      id: 5,
      type: 'warning',
      title: 'Cash Flow Projection',
      description: 'Based on current payment patterns, cash flow may tighten in Q3. Consider accelerating receivables collection.',
      impact: 'high',
      category: 'Finance',
    },
  ];

  const kpiTrends: Array<{ name: string; current: string | number; change: number; trend: 'up' | 'down'; forecast: string | number; period: string }> = [
    { 
      name: 'Revenue', 
      current: 'UGX 875M', 
      change: 12.5, 
      trend: 'up',
      forecast: 'UGX 1.2B',
      period: 'Q3 2026'
    },
    { 
      name: 'Active Projects', 
      current: 24, 
      change: 8.3, 
      trend: 'up',
      forecast: 32,
      period: 'Q3 2026'
    },
    { 
      name: 'Employee Count', 
      current: 47, 
      change: 2.1, 
      trend: 'up',
      forecast: 52,
      period: 'Q3 2026'
    },
    { 
      name: 'Lead Conversion', 
      current: '18%', 
      change: -3.2, 
      trend: 'down',
      forecast: '22%',
      period: 'Q3 2026'
    },
  ];

  return (
    <AdminLayout
      title="Insights & Trends"
      subtitle="AI-powered forecasts and actionable recommendations"
      activePath="/admin/reports/insights"
    >
      <div className="p-6 space-y-6">
        {/* Timeframe Selector */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
                { id: '1y', label: '1 Year' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTimeframe(tf.id as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTimeframe === tf.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last updated: Today at 9:00 AM</span>
            </div>
          </div>

          {/* KPI Trends with Forecasts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiTrends.map((kpi) => (
              <KPICard
                key={kpi.name}
                title={kpi.name}
                value={kpi.current}
                change={kpi.change}
                trend={kpi.trend}
                icon={kpi.trend === 'up' ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
              />
            ))}
          </div>

          {/* Forecast Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Revenue Forecast" subtitle="Projected vs Actual (UGX)">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecastData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="Actual"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stackId="2" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                    strokeDasharray="5 5"
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Project Volume Forecast" subtitle="Active Projects">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData.projects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Forecast"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* AI Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">AI-Powered Recommendations</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <Card 
                  key={rec.id} 
                  className={`border-l-4 ${
                    rec.type === 'opportunity' ? 'border-l-green-500' :
                    rec.type === 'warning' ? 'border-l-orange-500' :
                    'border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {rec.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {rec.type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-600" />}
                      {rec.type === 'insight' && <Lightbulb className="w-5 h-5 text-blue-600" />}
                      <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.impact === 'high' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {rec.impact} impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{rec.category}</span>
                    <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Take Action <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Key Trends" subtitle="Top performing metrics">
              <div className="space-y-4">
                {Object.entries(metrics).slice(0, 4).map(([key, points]) => {
                  const first = points[0]?.value ?? 0;
                  const last = points[points.length - 1]?.value ?? 0;
                  const change = first ? (((last - first) / first) * 100).toFixed(1) : '0';
                  const isPositive = Number(change) >= 0;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                      </div>
                      <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{change}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="Target Progress" subtitle="Quarterly goals">
              <div className="space-y-4">
                {[
                  { name: 'Revenue Target', progress: 78, target: 'UGX 1.2B' },
                  { name: 'Project Completion', progress: 65, target: '30 projects' },
                  { name: 'Client Satisfaction', progress: 92, target: '90%' },
                ].map((goal) => (
                  <div key={goal.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">{goal.name}</span>
                      <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          goal.progress >= 90 ? 'bg-green-600' :
                          goal.progress >= 70 ? 'bg-blue-600' :
                          goal.progress >= 50 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Target: {goal.target}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
    </AdminLayout>
  );
}
