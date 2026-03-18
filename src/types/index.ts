import { LendingType } from '../enums/lending-type.enum';
import { LendingStatus } from '../enums/lending-status.enum';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface Income {
  _id: string;
  amount: number;
  category: string;
  source: string;
  date: string;
  notes: string;
}

export interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  isRecurring: boolean;
}

export interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Lending {
  _id: string;
  amount: number;
  personName: string;
  type: LendingType;
  date: string;
  dueDate?: string;
  status: LendingStatus;
  remainingAmount: number;
  notes: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Settings {
  currency: string;
  monthlyBudget: number;
}

export interface Overview {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budgetUsed: number;
  budgetLimit: number;
}

export interface CategoryData {
  category: string;
  total: number;
  percentage: number;
}

export interface TrendData {
  month: string;
  income: number;
  expenses: number;
}

export interface LendingSummary {
  totalLent: number;
  totalBorrowed: number;
}
