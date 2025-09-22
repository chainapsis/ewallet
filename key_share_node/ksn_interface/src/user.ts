export interface KSNodeUser {
  user_id: string;
  email: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  aux?: Record<string, any>;
}
