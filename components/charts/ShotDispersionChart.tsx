import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import {
  Canvas,
  Circle,
  Path,
  Line,
  Fill,
  Group,
  Skia,
  DashPathEffect,
  vec,
} from '@shopify/react-native-skia';
import {
  toDispersionPoints,
  computeDispersionBounds,
  type DispersionPoint,
  type DispersionBounds,
} from '../../lib/utils/dispersion';
import type { DbShot } from '../../lib/hooks/use-sqlite-training';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShotDispersionChartProps {
  shots: DbShot[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_HEIGHT = 300;
const PAD = { top: 16, bottom: 16, left: 32, right: 16 };

const ACCENT_COLOR: Record<string, string> = {
  green: '#4AC18D',
  blue:  '#4A9CD2',
  gold:  '#D2B15C',
  orange:'#DE6E63',
};

const COLORS = {
  rough:   '#0a1a0e',
  fairway: '#0e2618',
  centerLine: '#ffffff18',
  targetCircle: '#4AC18D',
  dotStroke: '#00000040',
};

const FONT_FAMILY = Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace';

// ─── Coordinate mapping ───────────────────────────────────────────────────────

function toCanvas(
  x: number,
  y: number,
  bounds: DispersionBounds,
  canvasWidth: number,
): { cx: number; cy: number } {
  const innerW = canvasWidth - PAD.left - PAD.right;
  const innerH = CANVAS_HEIGHT - PAD.top - PAD.bottom;
  const xRange = bounds.maxX - bounds.minX;
  const yRange = bounds.maxY - bounds.minY;

  const cx = PAD.left + ((x - bounds.minX) / xRange) * innerW;
  // Y is inverted: maxY (far) at top, minY (near) at bottom
  const cy = PAD.top + (1 - (y - bounds.minY) / yRange) * innerH;
  return { cx, cy };
}

// ─── Fairway path ─────────────────────────────────────────────────────────────

function makeFairwayPath(canvasWidth: number): ReturnType<typeof Skia.Path.Make> {
  const innerW = canvasWidth - PAD.left - PAD.right;
  const centerX = PAD.left + innerW / 2;
  const topY = PAD.top;
  const bottomY = CANVAS_HEIGHT - PAD.bottom;

  // Tapers toward the far end (top) — realistic fairway shape
  const halfTop = innerW * 0.28;
  const halfBottom = innerW * 0.42;

  const p = Skia.Path.Make();
  p.moveTo(centerX - halfTop, topY);
  p.lineTo(centerX + halfTop, topY);
  p.lineTo(centerX + halfBottom, bottomY);
  p.lineTo(centerX - halfBottom, bottomY);
  p.close();
  return p;
}

// ─── Target circle path ───────────────────────────────────────────────────────

function makeTargetCirclePath(
  bounds: DispersionBounds,
  canvasWidth: number,
): ReturnType<typeof Skia.Path.Make> {
  const { cx, cy } = toCanvas(0, bounds.centerY, bounds, canvasWidth);
  const innerW = canvasWidth - PAD.left - PAD.right;
  const radius = innerW * 0.10;

  const p = Skia.Path.Make();
  p.addCircle(cx, cy, radius);
  return p;
}

// ─── Y-axis labels ────────────────────────────────────────────────────────────

function YAxisLabel({ label, cy }: { label: string; cy: number }) {
  return (
    <Text
      style={[s.yLabel, { top: cy - 8 }]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  const items: Array<{ accent: string; label: string }> = [
    { accent: 'green', label: 'Gut' },
    { accent: 'blue',  label: 'Okay' },
    { accent: 'gold',  label: 'Grenzwertig' },
    { accent: 'orange',label: 'Daneben' },
  ];
  return (
    <View style={s.legend}>
      {items.map(({ accent, label }) => (
        <View key={accent} style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: ACCENT_COLOR[accent] }]} />
          <Text style={s.legendLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ShotDispersionChart({ shots }: ShotDispersionChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  // Account for card horizontal padding (16px each side)
  const canvasWidth = screenWidth - 32;

  const points = useMemo(() => toDispersionPoints(shots), [shots]);
  const bounds = useMemo(() => computeDispersionBounds(points), [points]);

  const fairwayPath = useMemo(() => makeFairwayPath(canvasWidth), [canvasWidth]);

  const targetCirclePath = useMemo(
    () => bounds != null ? makeTargetCirclePath(bounds, canvasWidth) : null,
    [bounds, canvasWidth],
  );

  const innerW = canvasWidth - PAD.left - PAD.right;
  const centerX = PAD.left + innerW / 2;

  // Y-axis carry labels: near (bottom) and far (top)
  const yLabels = useMemo(() => {
    if (bounds == null) return [];
    return [
      { label: `${Math.round(bounds.minY)}y`, cy: CANVAS_HEIGHT - PAD.bottom - 4 },
      { label: `${Math.round(bounds.centerY)}y`, cy: CANVAS_HEIGHT / 2 },
      { label: `${Math.round(bounds.maxY)}y`, cy: PAD.top + 4 },
    ];
  }, [bounds]);

  // ── No data states ──────────────────────────────────────────────────────────

  if (shots.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>Keine Schläge in dieser Session</Text>
      </View>
    );
  }

  const hasHla = points.length > 0;
  if (!hasHla) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>Dispersion nicht verfügbar</Text>
        <Text style={s.emptyMeta}>
          HLA-Daten fehlen — Schläge, die vor dem Update erfasst wurden, enthalten keinen Horizontalwinkel.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Y-axis labels sit in absolute position over the canvas */}
      <View style={{ width: canvasWidth, height: CANVAS_HEIGHT }}>
        <Canvas style={{ width: canvasWidth, height: CANVAS_HEIGHT }}>
          {/* Background */}
          <Fill color="#080C10" />

          {/* Rough (full canvas tinted) */}
          <Fill color={COLORS.rough} />

          {/* Fairway trapezoid */}
          <Path path={fairwayPath} color={COLORS.fairway} />

          {/* Center line */}
          <Line
            p1={vec(centerX, PAD.top)}
            p2={vec(centerX, CANVAS_HEIGHT - PAD.bottom)}
            color={COLORS.centerLine}
            strokeWidth={1}
          />

          {/* Target circle (dashed) */}
          {targetCirclePath != null && (
            <Path
              path={targetCirclePath}
              color={COLORS.targetCircle}
              strokeWidth={1.5}
              style="stroke"
            >
              <DashPathEffect intervals={[5, 5]} />
            </Path>
          )}

          {/* Shot dots */}
          {bounds != null && points.map((p) => {
            const { cx, cy } = toCanvas(p.x, p.y, bounds, canvasWidth);
            return (
              <Group key={p.shotId}>
                {/* Shadow ring */}
                <Circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  color={COLORS.dotStroke}
                />
                {/* Colored dot */}
                <Circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  color={ACCENT_COLOR[p.accent] ?? ACCENT_COLOR.blue}
                />
              </Group>
            );
          })}
        </Canvas>

        {/* Y-axis labels overlaid with absolute positioning */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {yLabels.map((l) => (
            <YAxisLabel key={l.label} label={l.label} cy={l.cy} />
          ))}
        </View>
      </View>

      {/* Shot count + legend */}
      <View style={s.footer}>
        <Text style={s.shotCount}>{points.length} Schläge</Text>
        <Legend />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#080C10',
  },
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyMeta: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 16,
  },
  yLabel: {
    position: 'absolute',
    left: 0,
    width: PAD.left - 4,
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    color: '#4b5563',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
  },
  shotCount: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#6b7280',
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    color: '#6b7280',
  },
});
