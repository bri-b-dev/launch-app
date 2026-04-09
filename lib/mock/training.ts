export interface ClubTarget {
  label: string;
  current: string;
  range: string;
  accent: 'green' | 'blue' | 'gold' | 'orange';
}

export interface ShotRecord {
  id: string;
  carry: string;
  shape: string;
  quality: string;
  note: string;
  ballSpeed: string;
  clubSpeed: string;
  vla: string;
  spin: string;
  accent: 'green' | 'blue' | 'gold' | 'orange';
}

export interface ClubRecord {
  id: string;
  name: string;
  type: string;
  loft: string;
  target: string;
  sessionLabel: string;
  bias: string;
  shotCount: string;
  avgCarry: string;
  hitRate: string;
  targets: ClubTarget[];
  shots: ShotRecord[];
}

export interface SessionRecord {
  id: string;
  date: string;
  title: string;
  shotsLabel: string;
  carryLabel: string;
  focus: string;
  clubIds: string[];
  summary: string;
}

export const CLUBS: ClubRecord[] = [
  {
    id: '7i',
    name: '7-Eisen',
    type: 'Iron',
    loft: '31°',
    target: 'Draw Bias aktiv',
    sessionLabel: '7-Eisen · Draw-Arbeit',
    bias: 'Draw',
    shotCount: '12',
    avgCarry: '178y',
    hitRate: '67%',
    targets: [
      { label: 'AoA', current: '-3.1°', range: 'Ziel -2.0° bis -5.0°', accent: 'green' },
      { label: 'Spin Axis', current: '-7.8°', range: 'Ziel -3.0° bis -12.0°', accent: 'blue' },
      { label: 'Face to Target', current: '-0.8°', range: 'Ziel -1.5° bis +0.5°', accent: 'gold' },
    ],
    shots: [
      {
        id: 'shot-181',
        carry: '181',
        shape: 'Draw',
        quality: 'Im Ziel',
        note: 'Startlinie leicht links, Kurve stabil.',
        ballSpeed: '114.2',
        clubSpeed: '76.4',
        vla: '14.3',
        spin: '4420',
        accent: 'green',
      },
      {
        id: 'shot-176',
        carry: '176',
        shape: 'Straight',
        quality: 'Knapp kurz',
        note: 'Kontakt solide, etwas weniger Compression.',
        ballSpeed: '111.8',
        clubSpeed: '75.5',
        vla: '14.0',
        spin: '4580',
        accent: 'gold',
      },
      {
        id: 'shot-184',
        carry: '184',
        shape: 'Draw',
        quality: 'Leicht heel',
        note: 'Ballflug ok, Treffpunkt minimal heel.',
        ballSpeed: '115.0',
        clubSpeed: '76.9',
        vla: '14.6',
        spin: '4360',
        accent: 'blue',
      },
      {
        id: 'shot-172',
        carry: '172',
        shape: 'Fade',
        quality: 'Zu steil',
        note: 'AoA zu negativ, Ballflug etwas zu hoch.',
        ballSpeed: '109.7',
        clubSpeed: '74.8',
        vla: '15.4',
        spin: '4910',
        accent: 'orange',
      },
    ],
  },
  {
    id: '7w',
    name: '7-Wood',
    type: 'Fairway',
    loft: '21°',
    target: 'Kontakt beobachten',
    sessionLabel: '7-Wood · Kontaktarbeit',
    bias: 'Neutral',
    shotCount: '18',
    avgCarry: '191y',
    hitRate: '52%',
    targets: [
      { label: 'AoA', current: '-1.2°', range: 'Ziel -1.0° bis -3.0°', accent: 'green' },
      { label: 'Spin Axis', current: '-2.1°', range: 'Ziel -2.0° bis -8.0°', accent: 'blue' },
      { label: 'Face to Target', current: '+0.3°', range: 'Ziel -1.0° bis +1.0°', accent: 'gold' },
    ],
    shots: [
      {
        id: 'shot-198',
        carry: '198',
        shape: 'Straight',
        quality: 'Center',
        note: 'Guter Kontakt, flacher Start, solide HLA.',
        ballSpeed: '127.1',
        clubSpeed: '84.0',
        vla: '12.8',
        spin: '3820',
        accent: 'green',
      },
      {
        id: 'shot-186',
        carry: '186',
        shape: 'Fade',
        quality: 'Thin',
        note: 'Typisches 7-Wood-Thema bei EE.',
        ballSpeed: '120.5',
        clubSpeed: '82.9',
        vla: '10.9',
        spin: '4210',
        accent: 'orange',
      },
    ],
  },
  {
    id: '50w',
    name: '50° Wedge',
    type: 'Wedge',
    loft: '50°',
    target: 'Distanzfenster',
    sessionLabel: '50° Wedge · Distanzkontrolle',
    bias: 'Straight',
    shotCount: '24',
    avgCarry: '92y',
    hitRate: '71%',
    targets: [
      { label: 'AoA', current: '-5.7°', range: 'Ziel -4.0° bis -7.0°', accent: 'green' },
      { label: 'Spin Axis', current: '-0.8°', range: 'Ziel -2.0° bis +2.0°', accent: 'blue' },
      { label: 'Face to Target', current: '+0.1°', range: 'Ziel -1.0° bis +1.0°', accent: 'gold' },
    ],
    shots: [
      {
        id: 'shot-94',
        carry: '94',
        shape: 'Straight',
        quality: 'Fenster',
        note: 'Klassischer Distanzschlag im Zielkorridor.',
        ballSpeed: '82.2',
        clubSpeed: '61.0',
        vla: '26.1',
        spin: '7310',
        accent: 'green',
      },
      {
        id: 'shot-88',
        carry: '88',
        shape: 'Draw',
        quality: 'Kurz',
        note: 'Etwas zu viel Loft am Impact.',
        ballSpeed: '79.8',
        clubSpeed: '60.3',
        vla: '27.4',
        spin: '7560',
        accent: 'gold',
      },
    ],
  },
];

export const SESSIONS: SessionRecord[] = [
  {
    id: 'session-7i-draw',
    date: '09 Apr',
    title: '7-Eisen Draw Block',
    shotsLabel: '12 Schlaege',
    carryLabel: 'Ø 178y',
    focus: 'Early Extension unter Kontrolle halten und Startlinie neutralisieren.',
    clubIds: ['7i'],
    summary: 'Beste Session der Woche. AoA stabiler, Draw wiederholbarer, weniger rechte Starts.',
  },
  {
    id: 'session-wedge-distance',
    date: '07 Apr',
    title: 'Wedge Distances',
    shotsLabel: '24 Schlaege',
    carryLabel: 'Ø 92y',
    focus: 'Fenstertraining in 5-Yard-Stufen statt Technikfokus.',
    clubIds: ['50w'],
    summary: 'Konstanz gut. Kurzfehler eher durch zu viel Loft als durch Path.',
  },
  {
    id: 'session-7w-contact',
    date: '04 Apr',
    title: '7-Wood Kontakt',
    shotsLabel: '18 Schlaege',
    carryLabel: 'Ø 191y',
    focus: 'Heel/thin-Tendenz beim 7-Wood sichtbar machen.',
    clubIds: ['7w'],
    summary: 'Kontakt schwankt. Video und Face Impact waeren hier besonders wertvoll.',
  },
];

export function getClubById(clubId: string) {
  return CLUBS.find((club) => club.id === clubId);
}

export function getShotById(shotId: string) {
  for (const club of CLUBS) {
    const shot = club.shots.find((item) => item.id === shotId);
    if (shot) {
      return { shot, club };
    }
  }
  return null;
}

export function getSessionById(sessionId: string) {
  return SESSIONS.find((session) => session.id === sessionId);
}
