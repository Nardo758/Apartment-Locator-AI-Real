export interface OfferFormData {
  userEmail: string;
  moveInDate: string;
  leaseTerm: string;
  monthlyBudget: string;
  securityDeposit: string;
  notes: string;
  petPolicy: string;
  utilities: string;
  parking: string;
  trash: string;
  firstMonthFree: boolean;
  reducedDeposit: boolean;
  waiveAppFee: boolean;
  monthlyIncome: string;
  creditScore: string;
  employmentHistory: string;
  rentalHistory: string;
}

export type PartialOfferFormData = Partial<OfferFormData>;
