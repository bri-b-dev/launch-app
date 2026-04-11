import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTrainingState } from '../../../lib/hooks/use-training-state';
import {
  type ClubDraft,
  type DbClub,
  useClubAdmin,
  useMargins,
} from '../../../lib/hooks/use-sqlite-training';

const FONT = {
  mono: Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
  body: Platform.OS === 'ios' ? 'AvenirNext-Regular' : 'sans-serif',
  demi: Platform.OS === 'ios' ? 'AvenirNext-DemiBold' : 'sans-serif-medium',
  heavy: Platform.OS === 'ios' ? 'AvenirNext-Heavy' : 'sans-serif-medium',
} as const;

const EMPTY_DRAFT: ClubDraft = {
  name: '',
  type: '',
  loft: '',
  length: '',
  manufacturer: '',
  model: '',
};

type FilterMode = 'active' | 'archived';

export default function EquipmentScreen() {
  const { activeClubId, setActiveClubId } = useTrainingState();
  const { rows: clubs, loading, error, createClub, updateClub, setClubArchived, deleteClub, updateMargin } = useClubAdmin();
  const [filterMode, setFilterMode] = useState<FilterMode>('active');
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClubDraft>(EMPTY_DRAFT);
  const [editingMarginId, setEditingMarginId] = useState<string | null>(null);
  const [marginDraft, setMarginDraft] = useState({ current_value: '', range_value: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [marginError, setMarginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const visibleClubs = clubs.filter((club) => club.archived === (filterMode === 'archived' ? 1 : 0));
  const selectedClub =
    clubs.find((club) => club.id === editingClubId)
    ?? clubs.find((club) => club.id === activeClubId)
    ?? visibleClubs[0]
    ?? null;
  const { rows: margins } = useMargins(selectedClub?.id ?? null);

  useEffect(() => {
    if (editingClubId != null) {
      return;
    }
    if (visibleClubs.length === 0) {
      return;
    }
    const hasVisibleActive = visibleClubs.some((club) => club.id === activeClubId);
    if (!hasVisibleActive && filterMode === 'active') {
      setActiveClubId(visibleClubs[0].id);
    }
  }, [activeClubId, editingClubId, filterMode, setActiveClubId, visibleClubs]);

  const startCreate = () => {
    setEditingClubId(null);
    setDraft(EMPTY_DRAFT);
    setFormError(null);
  };

  const startEdit = (club: DbClub) => {
    setEditingClubId(club.id);
    setDraft({
      name: club.name,
      type: club.type,
      loft: club.loft,
      length: club.length,
      manufacturer: club.manufacturer,
      model: club.model,
    });
    setFormError(null);
  };

  const resetForm = () => {
    setEditingClubId(null);
    setDraft(EMPTY_DRAFT);
    setFormError(null);
  };

  const startMarginEdit = (marginId: string, currentValue: string, rangeValue: string) => {
    setEditingMarginId(marginId);
    setMarginDraft({ current_value: currentValue, range_value: rangeValue });
    setMarginError(null);
  };

  const resetMarginForm = () => {
    setEditingMarginId(null);
    setMarginDraft({ current_value: '', range_value: '' });
    setMarginError(null);
  };

  const submit = async () => {
    if (draft.name.trim().length === 0) {
      setFormError('Name ist erforderlich.');
      return;
    }
    if (draft.type.trim().length === 0) {
      setFormError('Art ist erforderlich.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingClubId == null) {
        const newClubId = await createClub(draft);
        setActiveClubId(newClubId);
        setFilterMode('active');
      } else {
        await updateClub(editingClubId, draft);
      }
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Schläger konnte nicht gespeichert werden.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArchive = (club: DbClub) => {
    const nextArchived = club.archived === 0;
    Alert.alert(
      nextArchived ? 'Schläger archivieren' : 'Schläger reaktivieren',
      nextArchived
        ? `${club.name} wird aus den aktiven Trainingsflächen entfernt.`
        : `${club.name} erscheint wieder in Session und Dashboard.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: nextArchived ? 'Archivieren' : 'Reaktivieren',
          style: 'default',
          onPress: async () => {
            await setClubArchived(club.id, nextArchived);
            if (nextArchived && activeClubId === club.id) {
              const fallback = clubs.find((item) => item.archived === 0 && item.id !== club.id);
              if (fallback != null) {
                setActiveClubId(fallback.id);
              }
            }
          },
        },
      ],
    );
  };

  const confirmDelete = (club: DbClub) => {
    Alert.alert(
      'Schläger löschen',
      `${club.name} wird inklusive Margins, Shots und Session-Zuordnung entfernt.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteClub(club.id);
            if (editingClubId === club.id) {
              resetForm();
            }
          },
        },
      ],
    );
  };

  const submitMargin = async () => {
    if (editingMarginId == null) {
      return;
    }
    if (marginDraft.range_value.trim().length === 0) {
      setMarginError('Der Zielkorridor darf nicht leer sein.');
      return;
    }
    try {
      await updateMargin(editingMarginId, marginDraft);
      resetMarginForm();
    } catch (err) {
      setMarginError(err instanceof Error ? err.message : 'Margin konnte nicht gespeichert werden.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.eyebrow}>Equipment</Text>
        <Text style={s.title}>Schläger verwalten</Text>
        <Text style={s.subtitle}>
          Namen, Art, Loft, Länge und Hersteller sauber pflegen. Archivierte Schläger bleiben erhalten, verschwinden aber aus dem aktiven Training.
        </Text>

        <View style={s.toolbar}>
          <View style={s.segment}>
            <FilterChip label="Aktiv" active={filterMode === 'active'} onPress={() => setFilterMode('active')} />
            <FilterChip label="Archiv" active={filterMode === 'archived'} onPress={() => setFilterMode('archived')} />
          </View>
          <Pressable style={s.addButton} onPress={startCreate}>
            <Text style={s.addButtonText}>Neu</Text>
          </Pressable>
        </View>

        <View style={s.formCard}>
          <Text style={s.cardTitle}>{editingClubId == null ? 'Neuen Schläger anlegen' : 'Schläger bearbeiten'}</Text>
          <Text style={s.cardBody}>
            `Art` ist Pflicht. Alles andere ist optional, aber nützlich für Filter, Setups und spätere Analysen.
          </Text>

          <Field label="Name">
            <TextInput
              value={draft.name}
              onChangeText={(value) => setDraft((current) => ({ ...current, name: value }))}
              placeholder="Big Gun"
              placeholderTextColor="#53677A"
              style={s.input}
            />
          </Field>

          <Field label="Art *">
            <TextInput
              value={draft.type}
              onChangeText={(value) => setDraft((current) => ({ ...current, type: value }))}
              placeholder="Driver, Eisen 7, Wedge 50"
              placeholderTextColor="#53677A"
              style={s.input}
            />
          </Field>

          <View style={s.inputRow}>
            <Field label="Länge">
              <TextInput
                value={draft.length}
                onChangeText={(value) => setDraft((current) => ({ ...current, length: value }))}
                placeholder={'45.5"'}
                placeholderTextColor="#53677A"
                style={s.input}
              />
            </Field>
            <Field label="Loft">
              <TextInput
                value={draft.loft}
                onChangeText={(value) => setDraft((current) => ({ ...current, loft: value }))}
                placeholder="10.5°"
                placeholderTextColor="#53677A"
                style={s.input}
              />
            </Field>
          </View>

          <View style={s.inputRow}>
            <Field label="Hersteller">
              <TextInput
                value={draft.manufacturer}
                onChangeText={(value) => setDraft((current) => ({ ...current, manufacturer: value }))}
                placeholder="Titleist"
                placeholderTextColor="#53677A"
                style={s.input}
              />
            </Field>
            <Field label="Modell">
              <TextInput
                value={draft.model}
                onChangeText={(value) => setDraft((current) => ({ ...current, model: value }))}
                placeholder="GT3"
                placeholderTextColor="#53677A"
                style={s.input}
              />
            </Field>
          </View>

          {formError != null && <Text style={s.errorText}>{formError}</Text>}

          <View style={s.formActions}>
            {editingClubId != null && (
              <Pressable style={s.secondaryButton} onPress={resetForm}>
                <Text style={s.secondaryButtonText}>Abbrechen</Text>
              </Pressable>
            )}
            <Pressable style={[s.primaryButton, submitting ? s.primaryButtonDisabled : null]} onPress={submit} disabled={submitting}>
              <Text style={s.primaryButtonText}>{submitting ? 'Speichert…' : editingClubId == null ? 'Anlegen' : 'Speichern'}</Text>
            </Pressable>
          </View>
        </View>

        {selectedClub != null && (
          <View style={s.monitorCard}>
            <Text style={s.monitorLabel}>Margins</Text>
            <Text style={s.monitorValue}>{selectedClub.name}</Text>
            <View style={s.marginRow}>
              {margins.map((margin) => (
                <View key={margin.id} style={s.marginChip}>
                  <Text style={s.marginChipLabel}>{margin.label}</Text>
                  {editingMarginId === margin.id ? (
                    <View style={s.marginEditor}>
                      <TextInput
                        value={marginDraft.current_value}
                        onChangeText={(value) => setMarginDraft((current) => ({ ...current, current_value: value }))}
                        placeholder="Aktuell"
                        placeholderTextColor="#53677A"
                        style={s.marginInput}
                      />
                      <TextInput
                        value={marginDraft.range_value}
                        onChangeText={(value) => setMarginDraft((current) => ({ ...current, range_value: value }))}
                        placeholder="Zielkorridor"
                        placeholderTextColor="#53677A"
                        style={s.marginInput}
                      />
                      {marginError != null && <Text style={s.marginErrorText}>{marginError}</Text>}
                      <View style={s.marginActionRow}>
                        <Pressable style={s.marginAction} onPress={resetMarginForm}>
                          <Text style={s.marginActionText}>Abbrechen</Text>
                        </Pressable>
                        <Pressable style={s.marginActionPrimary} onPress={submitMargin}>
                          <Text style={s.marginActionPrimaryText}>Speichern</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={s.marginChipCurrent}>{margin.current_value}</Text>
                      <Text style={s.marginChipValue}>{margin.range_value}</Text>
                      <Pressable style={s.marginEditButton} onPress={() => startMarginEdit(margin.id, margin.current_value, margin.range_value)}>
                        <Text style={s.marginEditButtonText}>Bearbeiten</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {loading && <Text style={s.infoText}>Lade Schläger…</Text>}
        {error != null && <Text style={s.errorText}>{error}</Text>}

        {visibleClubs.map((club) => (
          <View key={club.id} style={[s.clubCard, club.id === activeClubId && club.archived === 0 ? s.clubCardActive : null]}>
            <Pressable onPress={() => club.archived === 0 && setActiveClubId(club.id)}>
              <View style={s.clubTop}>
                <Text style={s.clubName}>{club.name}</Text>
                <Text style={s.clubMeta}>{club.type}</Text>
              </View>
              <Text style={s.clubSpecs}>
                {[club.loft, club.length, club.manufacturer, club.model].filter((value) => value.trim().length > 0).join(' · ') || 'Noch keine Zusatzdaten'}
              </Text>
            </Pressable>

            <View style={s.actionRow}>
              <Pressable style={s.inlineButton} onPress={() => router.push({ pathname: '/equipment/[id]', params: { id: club.id } })}>
                <Text style={s.inlineButtonText}>Verlauf</Text>
              </Pressable>
              <Pressable style={s.inlineButton} onPress={() => startEdit(club)}>
                <Text style={s.inlineButtonText}>Bearbeiten</Text>
              </Pressable>
              <Pressable style={s.inlineButton} onPress={() => toggleArchive(club)}>
                <Text style={s.inlineButtonText}>{club.archived === 0 ? 'Archivieren' : 'Reaktivieren'}</Text>
              </Pressable>
              <Pressable style={s.inlineButtonDanger} onPress={() => confirmDelete(club)}>
                <Text style={s.inlineButtonDangerText}>Löschen</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {!loading && visibleClubs.length === 0 && (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>
              {filterMode === 'active' ? 'Keine aktiven Schläger' : 'Archiv ist leer'}
            </Text>
            <Text style={s.emptyBody}>
              {filterMode === 'active'
                ? 'Lege einen Schläger an oder reaktiviere einen aus dem Archiv.'
                : 'Archivierte Schläger tauchen hier auf, ohne aus der Datenbasis zu verschwinden.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: Readonly<{ label: string; active: boolean; onPress: () => void }>) {
  return (
    <Pressable style={[s.segmentChip, active ? s.segmentChipActive : null]} onPress={onPress}>
      <Text style={[s.segmentChipText, active ? s.segmentChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function Field({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080C10' },
  content: { padding: 16, paddingBottom: 110 },
  eyebrow: {
    fontFamily: FONT.mono,
    color: '#D2B15C',
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONT.heavy,
    color: '#EEF3F7',
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FONT.body,
    color: '#8DA0B3',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 999,
    padding: 4,
    gap: 6,
  },
  segmentChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  segmentChipActive: {
    backgroundColor: '#D2B15C22',
  },
  segmentChipText: {
    fontFamily: FONT.demi,
    color: '#8DA0B3',
    fontSize: 13,
  },
  segmentChipTextActive: {
    color: '#D2B15C',
  },
  addButton: {
    backgroundColor: '#D2B15C',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  addButtonText: {
    fontFamily: FONT.demi,
    color: '#080C10',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18, marginBottom: 6 },
  cardBody: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  field: { flex: 1, marginBottom: 12 },
  fieldLabel: { fontFamily: FONT.mono, color: '#53677A', fontSize: 11, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#223244',
    backgroundColor: '#111E28',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#EEF3F7',
    fontFamily: FONT.body,
    fontSize: 14,
  },
  inputRow: { flexDirection: 'row', gap: 10 },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: { fontFamily: FONT.demi, color: '#8DA0B3', fontSize: 13 },
  primaryButton: {
    backgroundColor: '#D2B15C',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontFamily: FONT.demi, color: '#080C10', fontSize: 13 },
  monitorCard: {
    backgroundColor: '#111E28',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  monitorLabel: { fontFamily: FONT.mono, color: '#53677A', fontSize: 11, marginBottom: 6 },
  monitorValue: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18, marginBottom: 10 },
  marginRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  marginChip: {
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 14,
    backgroundColor: '#0D1821',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 120,
  },
  marginChipLabel: { fontFamily: FONT.mono, color: '#D2B15C', fontSize: 10, marginBottom: 4 },
  marginChipCurrent: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 13, marginBottom: 4 },
  marginChipValue: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 12, lineHeight: 18 },
  marginEditor: { gap: 8 },
  marginInput: {
    borderWidth: 1,
    borderColor: '#223244',
    backgroundColor: '#111E28',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#EEF3F7',
    fontFamily: FONT.body,
    fontSize: 13,
  },
  marginActionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  marginAction: {
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  marginActionText: { fontFamily: FONT.demi, color: '#8DA0B3', fontSize: 11 },
  marginActionPrimary: {
    backgroundColor: '#D2B15C',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  marginActionPrimaryText: { fontFamily: FONT.demi, color: '#080C10', fontSize: 11 },
  marginErrorText: { fontFamily: FONT.body, color: '#DE6E63', fontSize: 12 },
  marginEditButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  marginEditButtonText: { fontFamily: FONT.demi, color: '#8DA0B3', fontSize: 11 },
  infoText: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14, marginBottom: 12 },
  errorText: { fontFamily: FONT.body, color: '#DE6E63', fontSize: 14, marginBottom: 12 },
  clubCard: {
    backgroundColor: '#111E28',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  clubCardActive: {
    borderColor: '#D2B15C55',
    backgroundColor: '#152331',
  },
  clubTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  clubName: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 18, flex: 1 },
  clubMeta: { fontFamily: FONT.mono, color: '#D2B15C', fontSize: 12 },
  clubSpecs: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  inlineButton: {
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineButtonText: { fontFamily: FONT.demi, color: '#8DA0B3', fontSize: 12 },
  inlineButtonDanger: {
    borderWidth: 1,
    borderColor: '#5F2C2C',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#261214',
  },
  inlineButtonDangerText: { fontFamily: FONT.demi, color: '#DE6E63', fontSize: 12 },
  emptyCard: {
    backgroundColor: '#0D1821',
    borderWidth: 1,
    borderColor: '#223244',
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: { fontFamily: FONT.demi, color: '#EEF3F7', fontSize: 17, marginBottom: 6 },
  emptyBody: { fontFamily: FONT.body, color: '#8DA0B3', fontSize: 14, lineHeight: 20 },
});
