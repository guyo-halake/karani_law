export interface Client {
  id: string;
  name: string;
  category: 'Corporate or Institutional' | 'Individual Client';
  kraPin: string;
  email: string;
  phone: string;
  mattersCount: number;
}

export interface Matter {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  causeNo: string;
  forum: string;
  status: 'In Taxation' | 'Open' | 'Closed' | 'Taxation Ready';
  claimValue: number;
  filedBy?: string;
}

export interface FeeNote {
  id: string;
  matterId: string;
  clientName: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'draft' | 'overdue';
  type: 'Bill of Costs' | 'Fee Note' | 'Proforma Invoice';
}

export interface VaultDocument {
  id: string;
  name: string;
  storagePath: string;
  size: string;
  version: number;
  tags: string[];
  updatedAt: string;
}

export interface WorkLogEntry {
  id: string;
  date: string;
  matterId: string;
  matterTitle: string;
  particulars: string;
  tariffType: string;
  amount: number;
}
