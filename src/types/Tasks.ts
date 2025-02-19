export interface Reset {
  period: 'daily' | 'weekly';
  time: string;
  day?: 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
}

export interface Task {
  id: string;
  id_short?: string;
  title: string;
  reset?: Reset;
  completedAt?: Date;
  resetAt?: Date;
};
