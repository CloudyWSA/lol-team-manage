export type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';

export interface LaningStats {
  goldDiff: number;
  csDiff: number;
  xpDiff: number;
}

export interface PlayerStats {
  name: string;
  role: Role;
  champion: string;
  at10: LaningStats;
  at15: LaningStats;
  dpg: number; // Damage per Gold
  cspm: number; // CS per Minute
  vspm: number; // Vision Score per Minute
  goldShare: number;
  damageShare: number;
}

export interface TimelineEvent {
  minute: number;
  type: 'kill' | 'tower' | 'dragon' | 'baron' | 'grubs' | 'herald';
  team: 'blue' | 'red';
  description: string;
}

export interface WinProbStep {
  minute: number;
  probability: number; // 0 to 1
}

export interface MomentumStats {
  goldDiff: number;
  xpDiff: number;
  winProb: number;
  events: TimelineEvent[];
}

export interface MatchStatisticsData {
  players: {
    blue: PlayerStats[];
    red: PlayerStats[];
  };
  correlations: {
    goldVsDamage: Array<{ name: string; goldShare: number; damageShare: number; role: Role }>;
  };
  timeline: Array<{ minute: number } & MomentumStats>;
  efficiency: {
    conversionRatio: { blue: number; red: number }; // Objectives per 1k gold lead
    resourceVelocity: Array<{ minute: number; blue: number; red: number }>;
  };
}
