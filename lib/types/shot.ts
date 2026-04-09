export interface ShotData {
  // Always present
  ballSpeedMph: number;
  verticalLaunchAngle: number;
  horizontalLaunchAngle: number;
  totalSpin: number;
  spinAxis: number;
  carryDistanceYards: number;
  isEstimatedSpin: boolean;
  hasClubData: boolean;
  hasFaceImpact: boolean;

  // Pro Package (hasClubData === true)
  clubSpeedMph?: number;
  angleOfAttack?: number;
  clubPath?: number;
  faceToTarget?: number;
  dynamicLoft?: number;
  spinLoft?: number;

  // FIL Add-on (hasFaceImpact === true)
  faceImpactX?: number; // mm from center
  faceImpactY?: number; // mm from center
}

export type ConnectionStatus = 'disconnected' | 'connected' | 'armed';
