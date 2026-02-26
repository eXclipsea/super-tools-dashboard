import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QuickReceipt - AI Receipt Scanner & Expense Tracker | Super Tools',
  description: 'QuickReceipt: AI-powered receipt scanner. Point your camera, instantly track expenses. Never lose receipts again. Perfect for business expenses and personal budgeting.',
  keywords: 'receipt scanner, expense tracker, AI OCR, business expenses, budget tracking, receipt management, financial organization, expense reports',
  openGraph: {
    title: 'QuickReceipt - AI Receipt Scanner',
    description: 'Scan receipts instantly with AI. Track expenses automatically. Never lose receipts again.',
    url: 'https://supertoolz.xyz/quickreceipt',
  },
};

import QuickReceiptComponent from './QuickReceiptComponent';

export default function QuickReceipt() {
  return <QuickReceiptComponent />;
}
