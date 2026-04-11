import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { Circle } from '@shopify/react-native-skia';
import type { DbClubSessionStat } from '../../lib/hooks/use-sqlite-training';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MetricKey = 'avg_carry' | 'avg_ball_speed' | 'hit_rate_pct';

export interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
}

interface TrendChartProps {
  sessions: DbClubSessionStat[];
  /** When provided, renders in controlled mode — no tab selector shown */
  metric?: MetricKey;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
} as const;

export const METRICS: MetricDef[] = [
  { key: 'avg_carry', label: 'Ø Carry', unit: 'y', color: '#D2B15C' },
  { key: 'avg_ball_speed', label: 'Ball Speed', unit: 'mph', color: '#4AC18D' },
  { key: 'hit_rate_pct', label: 'Treffer', unit: '%', color: '#818CF8' },
];

const CHART_HEIGHT = 160;
const MAX_SESSIONS = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}.${parts[1]}.`;
}

function formatValue(value: number, unit: string): string {
  if (unit === '%') return `${Math.round(value)} %`;
  if (unit === 'y') return `${Math.round(value)} y`;
  return `${value.toFixed(1)} ${unit}`;
}

function trendArrow(first: number, last: number, metric: MetricKey): string {
  const delta = last - first;
  if (Math.abs(delta) < 0.5) return '→';
  // For hit rate and carry: up = good. For nothing here is inverse.
  return delta > 0 ? '↑' : '↓';
}

function trendColor(first: number, last: number): string {
  const delta = last - first;
  if (Math.abs(delta) < 0.5) return '#53677A';
  return delta > 0 ? '#4AC18D' : '#DE6E63';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrendChart({ sessions, metric: controlledMetric }: TrendChartProps) {
  const [internalMetric, setInternalMetric] = useState<MetricKey>('avg_carry');
  const activeMetric = controlledMetric ?? internalMetric;

  const metric = METRICS.find((m) => m.key === activeMetric)!;

  const { chartData, labels, minVal, maxVal } = useMemo(() => {
    // Reverse to oldest-first, then take the last MAX_SESSIONS
    const ordered = sessions.slice().reverse().slice(-MAX_SESSIONS);

    // Filter out sessions where this metric is null
    const filtered = ordered.filter((s) => s[activeMetric] != null);

    const data = filtered.map((s, i) => ({
      x: i,
      value: s[activeMetric] as number,
    }));

    const values = data.map((d) => d.value);
    const minVal = values.length > 0 ? Math.min(...values) : 0;
    const maxVal = values.length > 0 ? Math.max(...values) : 0;
    const dateLabels = filtered.map((s) => formatDate(s.date));

    return { chartData: data, labels: dateLabels, minVal, maxVal };
  }, [sessions, activeMetric]);

  const hasTrend = chartData.length >= 2;
  const firstVal = chartData[0]?.value;
  const lastVal = chartData[chartData.length - 1]?.value;

  return (
    <View style={s.container}>
      {/* Metric selector — hidden in controlled mode */}
      {controlledMetric == null && (
        <View style={s.tabs}>
          {METRICS.map((m) => (
            <Pressable
              key={m.key}
              style={[s.tab, activeMetric === m.key && { borderColor: m.color, backgroundColor: `${m.color}18` }]}
              onPress={() => setInternalMetric(m.key)}
            >
              <Text style={[s.tabText, activeMetric === m.key && { color: m.color }]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {!hasTrend ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>
            {chartData.length < 2 && sessions.length >= 2
              ? 'Nicht genug Daten für diese Metrik.'
              : 'Mindestens 2 Sessions für den Trend-Chart.'}
          </Text>
        </View>
      ) : (
        <>
          {/* Chart area */}
          <View style={s.chartRow}>
            {/* Y-axis labels */}
            <View style={s.yLabels}>
              <Text style={s.yLabel}>{formatValue(maxVal, metric.unit)}</Text>
              <Text style={s.yLabel}>{formatValue(minVal, metric.unit)}</Text>
            </View>

            {/* Sparkline */}
            <View style={s.chartWrap}>
              <CartesianChart
                data={chartData}
                xKey="x"
                yKeys={['value']}
                domainPadding={{ top: 18, bottom: 10, left: 8, right: 8 }}
              >
                {({ points }) => (
                  <>
                    <Line
                      points={points.value}
                      color={metric.color}
                      strokeWidth={2.5}
                      curveType="natural"
                    />
                    {points.value.map((p, i) =>
                      p.y != null ? (
                        <Circle key={i} cx={p.x} cy={p.y} r={4} color={metric.color} />
                      ) : null,
                    )}
                  </>
                )}
              </CartesianChart>
            </View>
          </View>

          {/* X-axis date labels */}
          <View style={s.xLabels}>
            <Text style={s.xLabel}>{labels[0]}</Text>
            <Text style={s.xLabel}>{labels[labels.length - 1]}</Text>
          </View>

          {/* Trend summary */}
          {firstVal != null && lastVal != null && (
            <View style={s.summary}>
              <Text style={s.summaryBase}>
                {formatValue(firstVal, metric.unit)}
              </Text>
              <Text style={[s.summaryArrow, { color: trendColor(firstVal, lastVal) }]}>
                {' '}{trendArrow(firstVal, lastVal, activeMetric)}{' '}
              </Text>
              <Text style={[s.summaryNow, { color: metric.color }]}>
                {formatValue(lastVal, metric.unit)}
              </Text>
              <Text style={s.summaryMeta}>
                {'  '}über {chartData.length} Sessions
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 12,
  },
  tabText: {
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#53677A',
  },

  empty: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: '#53677A',
  },

  chartRow: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yLabels: {
    width: 52,
    justifyContent: 'space-between',
    paddingBottom: 2,
    paddingTop: 4,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yLabel: {
    fontFamily: FONT.mono,
    fontSize: 9,
    color: '#53677A',
  },
  chartWrap: {
    flex: 1,
  },

  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 60,
    paddingRight: 4,
    marginTop: 4,
  },
  xLabel: {
    fontFamily: FONT.mono,
    fontSize: 9,
    color: '#53677A',
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E3244',
  },
  summaryBase: {
    fontFamily: FONT.demi,
    fontSize: 13,
    color: '#8DA0B3',
  },
  summaryArrow: {
    fontFamily: FONT.demi,
    fontSize: 14,
  },
  summaryNow: {
    fontFamily: FONT.demi,
    fontSize: 13,
  },
  summaryMeta: {
    fontFamily: FONT.body,
    fontSize: 12,
    color: '#53677A',
  },
});
