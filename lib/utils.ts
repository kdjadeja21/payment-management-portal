import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return "Invalid Date";
  }
}

export function calculateDueDays(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDateObj = new Date(dueDate);
  dueDateObj.setHours(0, 0, 0, 0);

  const diffTime = dueDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getStatusFromDueDays(
  dueDays: number,
  isPaid: boolean
): "paid" | "due" | "overdue" {
  if (isPaid) return "paid";
  return dueDays < 0 ? "overdue" : "due";
}

export function getCardColor(title: string): {
  bgColor: string;
  textColor: string;
} {
  const colors = {
    Dashboard: { bgColor: "bg-blue-50", textColor: "text-blue-700" },
    Retailers: { bgColor: "bg-green-50", textColor: "text-green-700" },
    Invoices: { bgColor: "bg-purple-50", textColor: "text-purple-700" },
    Payments: { bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
    Reports: { bgColor: "bg-red-50", textColor: "text-red-700" },
    Settings: { bgColor: "bg-gray-50", textColor: "text-gray-700" },
    "Outstanding Balances": {
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    "Recent Invoices": {
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
    },
    "Account Settings": { bgColor: "bg-teal-50", textColor: "text-teal-700" },
  };

  return (
    colors[title as keyof typeof colors] || {
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
    }
  );
}

export function numberToIndianWords(num: number): string {
  if (typeof num !== "number" || isNaN(num)) return "Invalid number";

  const units: string[] = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens: string[] = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens: string[] = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const getTwoDigits = (n: number): string => {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + units[n % 10] : "");
  };

  const convertGroup = (n: number): string => getTwoDigits(n);

  const [intPartStr, decimalPartStr] = num.toFixed(2).split(".");
  const intPart = parseInt(intPartStr, 10);
  const decimalPart = parseInt(decimalPartStr, 10);

  if (intPart === 0 && decimalPart === 0) return "Zero Rupees Only";

  const numStr: string = intPart.toString().padStart(9, "0");

  const crore: number = parseInt(numStr.slice(0, 2), 10);
  const lakh: number = parseInt(numStr.slice(2, 4), 10);
  const thousand: number = parseInt(numStr.slice(4, 6), 10);
  const hundred: number = parseInt(numStr.slice(6, 7), 10);
  const lastTwo: number = parseInt(numStr.slice(7), 10);

  let words = "";

  if (crore) words += convertGroup(crore) + " Crore ";
  if (lakh) words += convertGroup(lakh) + " Lakh ";
  if (thousand) words += convertGroup(thousand) + " Thousand ";
  if (hundred) words += units[hundred] + " Hundred ";
  if (lastTwo) {
    if (words !== "") words += "and ";
    words += convertGroup(lastTwo);
  }

  words = words.trim() + " Rupees";

  if (decimalPart > 0) {
    words += " and " + convertGroup(decimalPart) + " Paise";
  }

  return words + " Only";
}
