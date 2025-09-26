// Local lightweight types for supabase edge functions. These avoid colliding
// with any generated types in the repository and are for compile-time only.
export type ExportRequestLocal = {
  exportId?: string;
  user_id?: string;
  user_email?: string;
  data_categories?: string[];
  date_range_start?: string;
  date_range_end?: string;
  export_type?: string;
  export_format?: string;
}

export type UserProfileLocal = Record<string, unknown> | null;
export type ActivityItemLocal = Record<string, unknown>;
export type ContentItemLocal = Record<string, unknown>;
export type SessionItemLocal = Record<string, unknown>;
export type OrderItemLocal = Record<string, unknown>;

export interface UserDataLocal {
  profile: UserProfileLocal;
  activity: ActivityItemLocal[];
  content: ContentItemLocal[];
  sessions: SessionItemLocal[];
  orders: OrderItemLocal[];
}

export interface ExportInfoLocal {
  user_id?: string;
  export_date?: string;
  export_type?: string;
  data_range?: { start?: string; end?: string };
  categories?: string[];
  total_records?: Record<string, number>;
}

export type AISuggestionsLocal = {
  recommendedOffer?: { suggestedRent?: number; strategy?: string; reasoning?: string };
  marketAnalysis?: { marketPosition?: string; demandLevel?: string; competitiveAnalysis?: string };
  potentialConcessions?: Array<{ type?: string; description?: string; likelihood?: string }>;
  timingRecommendations?: { bestTimeToApply?: string; reasoning?: string };
}

export type OfferEmailRequestLocal = {
  userEmail?: string;
  propertyId?: string | number;
  moveInDate?: string;
  leaseTerm?: number;
  monthlyBudget?: number;
  notes?: string;
  aiSuggestions?: AISuggestionsLocal;
  propertyDetails?: Record<string, unknown>;
}

export default {} as const;
