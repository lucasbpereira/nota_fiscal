export interface Messages {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  content: string;
  duration?: number;
}

export enum MessageType {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info'
}
