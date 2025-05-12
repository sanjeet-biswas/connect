export interface VaultItemType {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'link' | 'credential';
  color: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    username?: string;
    password?: string;
    url?: string;
    [key: string]: any;
  };
} 