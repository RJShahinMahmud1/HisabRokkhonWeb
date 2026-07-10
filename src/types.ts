export type TransactionType = 'income' | 'expense' | 'loan_given' | 'loan_taken' | 'savings_deposit' | 'savings_withdraw';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  enabled: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  paymentMethodId: string;
  note: string;
}

export interface Loan {
  id: string;
  type: 'loan_given' | 'loan_taken';
  personName: string;
  amount: number;
  repaidAmount: number;
  date: string;
  dueDate?: string;
  note: string;
  status: 'active' | 'cleared';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
}

export type ViewState = 'dashboard' | 'income' | 'expense' | 'loans' | 'savings' | 'budget' | 'reports' | 'history' | 'settings' | 'profile' | 'messages' | 'my_profile';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  location?: string;
  designation?: string;
  followers?: number;
  following?: number;
  education?: string;
  hobbies?: string;
  dob?: string;
  profileSetupCompleted?: boolean;
  followersCount?: string[];
  followingCount?: string[];
  role?: 'admin' | 'user';
  banned?: boolean;
  messagesDisabled?: boolean;
}

export interface Report {
  id: string;
  postId: string;
  postOwnerId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  postContent?: string;
}

export interface PostComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  replies?: PostComment[];
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  reactions?: Record<string, string>; // userId -> emoji
  comments?: PostComment[];
}
