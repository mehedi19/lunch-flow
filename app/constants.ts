export type LunchCategoryType = "regular" | "premium" | "diet";

export type OfficeDepartment =
  | "Software"
  | "Backend"
  | "Front-end"
  | "Marketing"
  | "Business"
  | "Design"
  | "UI/UX"
  | "General";

export const OFFICE_DEPARTMENTS: OfficeDepartment[] = [
  "Software",
  "Backend",
  "Front-end",
  "Marketing",
  "Business",
  "Design",
  "UI/UX"
];

export interface CategoryPrices {
  regular: number;
  premium: number;
  diet: number;
}

export interface Member {
  id: string;
  name: string;
  department: OfficeDepartment;
  contact: string;
  depositBalance: number;
  defaultCategory: LunchCategoryType;
  isActive: boolean;
}

export interface LunchDayEntry {
  hadLunch: boolean;
  category: LunchCategoryType;
  guestCount: number;
  notes?: string;
}

export interface LunchExpense {
  id: string;
  date: string;
  title: string;
  amount: number;
  category: "Catering Vendor" | "Groceries" | "Protein & Meat" | "Produce" | "Utilities & Chef";
  paidBy: string;
}

export interface DepositRecord {
  id: string;
  memberId: string;
  date: string;
  amount: number;
  note: string;
}

export interface MonthlyClosing {
  monthKey: string;
  closedAt: string;
  totalExpenses: number;
  totalLunches: number;
  categoryPrices: CategoryPrices;
  isLocked: boolean;
}
