export type User = {
  id: string;
  username: string;
  isCalling?: boolean;
};

export type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
};

export type Signal = {
  to: string;
  signal: any;
};