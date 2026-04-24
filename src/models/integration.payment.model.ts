export interface IIntegrationPayment {
  id: string;
  integration_id?: string | null;
  type: number;
  amount: number;
  artist_id: string;
  paid_by: string;
  paid_at: Date | string;
}

export interface IntegrationPayment {
  id: string;
  integration_id?: string | null;
  type: number;
  amount: number;
  artist_id: string;
  paid_by: string;
  paid_at: Date | string;
}

export interface IntegrationTransferSummaryRow {
  artist_id: string;
  user_name?: string;
  from?: string;
  to?: string;
  paid_at?: Date | string;
  payment_count: number;
  transferred_amount: number;
}
