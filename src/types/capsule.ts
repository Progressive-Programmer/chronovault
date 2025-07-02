export type Capsule = {
  id: string;
  title: string;
  openDate: Date;
  recipient: string;
  status: 'sealed' | 'ready' | 'opened' | 'expired';
};
