import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CLUBS } from '../../../lib/mock/training';
import { useTrainingState } from '../../../lib/hooks/use-training-state';

const C = {
  bg: '#071018',
  surface: '#0D1821',
  panel: '#111E28',
  panelAlt: '#152331',
  border: '#223244',
  text: '#EEF3F7',
  textSecondary: '#8DA0B3',
  textMuted: '#53677A',
  gold: '#D2B15C',
  green: '#4AC18D',
  orange: '#F2A24D',
  blue: '#5FA7FF',
  red: '#DE6E63',
} as const;

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const MODE_OPTIONS = ['Full Swing', 'Approach', 'Wedge'];

export default function SessionScreen() {
  const [selectedMode] = useState('Full Swing');
  const { activeClubId, setActiveClubId } = useTrainingState();
  const club = CLUBS.find((item) => item.id === activeClubId) ?? CLUBS[0];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.eyebrow}>Aktive Session</Text>
              <Text style={s.title}>{club.sessionLabel}</Text>
            </View>
            <View style={s.statePill}>
              <View style={s.stateDot} />
              <Text style={s.statePillText}>Armed</Text>
            </View>
          </View>

          <View style={s.heroBand}>
            <HeroMetric label="Schläge" value={club.shotCount} />
            <HeroMetric label="Ø Carry" value={club.avgCarry} />
            <HeroMetric label="Trefferquote" value={club.hitRate} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.clubRail}>
            {CLUBS.map((item) => (
              <Pressable key={item.id} style={[s.clubChip, item.id === club.id && s.clubChipActive]} onPress={() => setActiveClubId(item.id)}>
                <Text style={[s.clubChipLabel, item.id === club.id && s.clubChipLabelActive]}>{item.name}</Text>
                <Text style={[s.clubChipMeta, item.id === club.id && s.clubChipMetaActive]}>{item.target}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={s.modeRow}>
            {MODE_OPTIONS.map((option, index) => (
              <Pressable key={option} style={[s.modeChip, option === selectedMode && s.modeChipActive]}>
                <Text style={[s.modeChipText, option === selectedMode && s.modeChipTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Letzter Schlag</Text>
            <Pressable onPress={() => router.push(`/shot/${club.shots[0].id}`)}>
              <Text style={s.sectionLink}>Details</Text>
            </Pressable>
          </View>
          <View style={s.lastShotCard}>
            <View>
              <Text style={s.lastShotCarry}>{club.shots[0].carry}</Text>
              <Text style={s.lastShotUnit}>yards carry</Text>
            </View>
            <View style={s.lastShotMeta}>
              <Text style={s.lastShotShape}>{club.shots[0].shape}</Text>
              <Text style={s.lastShotNote}>{club.shots[0].note}</Text>
            </View>
          </View>
          <View style={s.liveMetricGrid}>
            <LiveMetric label="Ball Speed" value={club.shots[0].ballSpeed} unit="mph" />
            <LiveMetric label="Club Speed" value={club.shots[0].clubSpeed} unit="mph" />
            <LiveMetric label="VLA" value={club.shots[0].vla} unit="°" />
            <LiveMetric label="Spin" value={club.shots[0].spin} unit="rpm" />
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Zielkorridore</Text>
            <Text style={s.sectionLink}>Margins</Text>
          </View>
          {club.targets.map((target) => (
            <View key={target.label} style={s.targetCard}>
              <View style={[s.targetAccent, { backgroundColor: target.accent === 'green' ? C.green : target.accent === 'blue' ? C.blue : target.accent === 'gold' ? C.gold : C.orange }]} />
              <View style={s.targetBody}>
                <View style={s.targetTop}>
                  <Text style={s.targetLabel}>{target.label}</Text>
                  <Text style={[s.targetCurrent, { color: target.accent === 'green' ? C.green : target.accent === 'blue' ? C.blue : target.accent === 'gold' ? C.gold : C.orange }]}>{target.current}</Text>
                </View>
                <Text style={s.targetRange}>{target.range}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Shot Rail</Text>
            <Pressable onPress={() => router.push('/history')}>
              <Text style={s.sectionLink}>Verlauf</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
            {club.shots.map((shot) => (
              <Pressable key={shot.id} style={s.railCard} onPress={() => router.push(`/shot/${shot.id}`)}>
                <View style={[s.railAccent, { backgroundColor: shot.accent === 'green' ? C.green : shot.accent === 'blue' ? C.blue : shot.accent === 'gold' ? C.gold : C.orange }]} />
                <Text style={s.railCarry}>{shot.carry}</Text>
                <Text style={s.railShape}>{shot.shape}</Text>
                <Text style={s.railQuality}>{shot.quality}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionEyebrow}>Arbeitsflächen</Text>
            <Text style={s.sectionLink}>Session Stats</Text>
          </View>
          <View style={s.surfaceGrid}>
            <SurfaceCard title="Dispersion" body="Landepunkte kompakt statt Vollchart, direkt aus der Session heraus." />
            <SurfaceCard title="Face Impact" body="Treffbild als schneller Kontroll-Layer für heel/toe-Tendenzen." />
            <SurfaceCard title="Notizen" body="Kurzfeedback pro Schlag oder pro Block, ohne den Flow zu brechen." />
            <SurfaceCard title="Video Queue" body="Clips an den letzten Schlag hängen, später im Detailscreen lesen." />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroMetric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={s.heroMetric}>
      <Text style={s.heroMetricLabel}>{label}</Text>
      <Text style={s.heroMetricValue}>{value}</Text>
    </View>
  );
}

function LiveMetric({
  label,
  value,
  unit,
}: Readonly<{ label: string; value: string; unit: string }>) {
  return (
    <View style={s.liveMetric}>
      <Text style={s.liveMetricValue}>
        {value}
        <Text style={s.liveMetricUnit}> {unit}</Text>
      </Text>
      <Text style={s.liveMetricLabel}>{label}</Text>
    </View>
  );
}

function SurfaceCard({ title, body }: Readonly<{ title: string; body: string }>) {
  return (
    <View style={s.surfaceCard}>
      <Text style={s.surfaceTitle}>{title}</Text>
      <Text style={s.surfaceBody}>{body}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  hero: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 28,
    padding: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  eyebrow: {
    fontFamily: FONT.mono,
    color: C.gold,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 28,
    lineHeight: 32,
  },
  statePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${C.green}55`,
    backgroundColor: `${C.green}16`,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  statePillText: {
    fontFamily: FONT.mono,
    color: C.green,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  heroBand: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  clubRail: {
    gap: 10,
    paddingRight: 4,
    marginBottom: 14,
  },
  clubChip: {
    width: 126,
    backgroundColor: C.panelAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clubChipActive: {
    backgroundColor: `${C.gold}18`,
    borderColor: `${C.gold}55`,
  },
  clubChipLabel: {
    fontFamily: FONT.demi,
    color: C.text,
    fontSize: 14,
    marginBottom: 4,
  },
  clubChipLabelActive: {
    color: C.gold,
  },
  clubChipMeta: {
    fontFamily: FONT.body,
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  clubChipMetaActive: {
    color: C.textSecondary,
  },
  heroMetric: {
    flex: 1,
    backgroundColor: C.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  heroMetricLabel: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  heroMetricValue: {
    fontFamily: FONT.demi,
    color: C.text,
    fontSize: 18,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
  },
  modeChipActive: {
    backgroundColor: `${C.gold}18`,
    borderColor: `${C.gold}55`,
  },
  modeChipText: {
    fontFamily: FONT.demi,
    color: C.textSecondary,
    fontSize: 14,
  },
  modeChipTextActive: {
    color: C.gold,
  },
  section: {
    marginBottom: 16,
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEyebrow: {
    fontFamily: FONT.mono,
    color: C.textMuted,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontFamily: FONT.demi,
    color: C.gold,
    fontSize: 13,
  },
  lastShotCard: {
    backgroundColor: C.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  lastShotCarry: {
    fontFamily: FONT.mono,
    color: C.gold,
    fontSize: 54,
    lineHeight: 58,
  },
  lastShotUnit: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  lastShotMeta: {
    alignItems: 'flex-end',
    maxWidth: 130,
  },
  lastShotShape: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 22,
    marginBottom: 4,
  },
  lastShotNote: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  liveMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  liveMetric: {
    width: '48%',
    minWidth: 146,
    backgroundColor: C.panelAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  liveMetricValue: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 24,
    marginBottom: 4,
  },
  liveMetricUnit: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 12,
  },
  liveMetricLabel: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 12,
  },
  targetCard: {
    flexDirection: 'row',
    backgroundColor: C.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 10,
  },
  targetAccent: {
    width: 4,
  },
  targetBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  targetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
    alignItems: 'center',
  },
  targetLabel: {
    fontFamily: FONT.mono,
    color: C.textSecondary,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  targetCurrent: {
    fontFamily: FONT.demi,
    fontSize: 14,
  },
  targetRange: {
    fontFamily: FONT.body,
    color: C.text,
    fontSize: 15,
  },
  rail: {
    gap: 10,
    paddingRight: 4,
  },
  railCard: {
    width: 108,
    backgroundColor: C.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  railAccent: {
    width: 28,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  railCarry: {
    fontFamily: FONT.heavy,
    color: C.text,
    fontSize: 28,
    marginBottom: 4,
  },
  railShape: {
    fontFamily: FONT.demi,
    color: C.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  railQuality: {
    fontFamily: FONT.body,
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  surfaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  surfaceCard: {
    width: '48%',
    minWidth: 145,
    backgroundColor: C.panelAlt,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  surfaceTitle: {
    fontFamily: FONT.demi,
    color: C.text,
    fontSize: 16,
    marginBottom: 6,
  },
  surfaceBody: {
    fontFamily: FONT.body,
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
