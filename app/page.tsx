"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  FileSpreadsheet,
  Printer,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Download,
  Upload,
  Receipt,
  Utensils,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  SlidersHorizontal,
  Sparkles,
  Share2,
  Check
} from "lucide-react";

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

export const OFFICE_DEPARTMENTS: OfficeDepartment[] = [
  "Software",
  "Backend",
  "Front-end",
  "Marketing",
  "Business",
  "Design",
  "UI/UX"
];

const STORAGE_KEY = "LUNCHFLOW_ENTERPRISE_V2";

const INITIAL_PRICES: CategoryPrices = {
  regular: 4.0,
  premium: 6.5,
  diet: 5.5
};

const INITIAL_MEMBERS: Member[] = [
  { id: "m-1", name: "Tanvir Ahmed", department: "Software", contact: "tanvir@office.io", depositBalance: 80.0, defaultCategory: "regular", isActive: true },
  { id: "m-2", name: "Farhana Yasmin", department: "Front-end", contact: "farhana@office.io", depositBalance: 120.0, defaultCategory: "diet", isActive: true },
  { id: "m-3", name: "Arif Hossain", department: "Backend", contact: "arif@office.io", depositBalance: 50.0, defaultCategory: "premium", isActive: true },
  { id: "m-4", name: "Sarah Miller", department: "UI/UX", contact: "sarah@office.io", depositBalance: 90.0, defaultCategory: "diet", isActive: true },
  { id: "m-5", name: "Zubair Karim", department: "Design", contact: "zubair@office.io", depositBalance: 65.0, defaultCategory: "regular", isActive: true },
  { id: "m-6", name: "Nafis Iqbal", department: "Marketing", contact: "nafis@office.io", depositBalance: 40.0, defaultCategory: "regular", isActive: true },
  { id: "m-7", name: "Tasnim Rahman", department: "Business", contact: "tasnim@office.io", depositBalance: 110.0, defaultCategory: "premium", isActive: true }
];

const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export default function App() {
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [activeTab, setActiveTab] = useState<"daily" | "expenses" | "members" | "monthlyClosing">("daily");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");

  const [categoryPrices, setCategoryPrices] = useState<CategoryPrices>(INITIAL_PRICES);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [dailyAttendance, setDailyAttendance] = useState<Record<string, Record<string, LunchDayEntry>>>({});
  const [expenses, setExpenses] = useState<LunchExpense[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [closings, setClosings] = useState<Record<string, MonthlyClosing>>({});

  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const [confirmConfig, setConfirmConfig] = useState<{ title: string; desc: string; action: () => void }>({
    title: "",
    desc: "",
    action: () => {}
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedDispatch, setCopiedDispatch] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.dailyAttendance) setDailyAttendance(parsed.dailyAttendance);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.deposits) setDeposits(parsed.deposits);
        if (parsed.closings) setClosings(parsed.closings);
        if (parsed.categoryPrices) setCategoryPrices(parsed.categoryPrices);
        if (parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
      } else {
        const today = getTodayString();
        const initialAttendance: Record<string, LunchDayEntry> = {};
        INITIAL_MEMBERS.forEach((m) => {
          initialAttendance[m.id] = {
            hadLunch: true,
            category: m.defaultCategory,
            guestCount: 0
          };
        });
        setDailyAttendance({ [today]: initialAttendance });
      }
    } catch (e) {
      console.error("Failed to load storage data:", e);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveData = () => {
    try {
      const payload = {
        members,
        dailyAttendance,
        expenses,
        deposits,
        closings,
        categoryPrices,
        currencySymbol
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  useEffect(() => {
    saveData();
  }, [members, dailyAttendance, expenses, deposits, closings, categoryPrices, currencySymbol]);

  const currentMonthKey = useMemo(() => {
    return selectedDate.substring(0, 7);
  }, [selectedDate]);

  const isCurrentMonthLocked = useMemo(() => {
    return !!closings[currentMonthKey]?.isLocked;
  }, [closings, currentMonthKey]);

  const todayRecords = useMemo(() => {
    return dailyAttendance[selectedDate] || {};
  }, [dailyAttendance, selectedDate]);

  const catererDailyStats = useMemo(() => {
    let regularCount = 0;
    let premiumCount = 0;
    let dietCount = 0;
    let guestCount = 0;

    Object.entries(todayRecords).forEach(([memberId, entry]) => {
      const member = members.find((m) => m.id === memberId);
      if (entry.hadLunch && member && member.isActive) {
        if (entry.category === "regular") regularCount++;
        else if (entry.category === "premium") premiumCount++;
        else if (entry.category === "diet") dietCount++;
      }
      if (entry.guestCount > 0) {
        guestCount += entry.guestCount;
      }
    });

    const totalStaffLunches = regularCount + premiumCount + dietCount;
    const totalOrderHeadcount = totalStaffLunches + guestCount;
    const estimatedBill = round2(
      regularCount * categoryPrices.regular +
      premiumCount * categoryPrices.premium +
      dietCount * categoryPrices.diet +
      guestCount * categoryPrices.regular
    );

    return {
      regularCount,
      premiumCount,
      dietCount,
      guestCount,
      totalStaffLunches,
      totalOrderHeadcount,
      estimatedBill
    };
  }, [todayRecords, members, categoryPrices]);

  const monthlyStats = useMemo(() => {
    const datesInMonth = Object.keys(dailyAttendance).filter((d) => d.startsWith(currentMonthKey));

    let totalMonthLunches = 0;
    let totalRegular = 0;
    let totalPremium = 0;
    let totalDiet = 0;
    let totalGuests = 0;

    const memberMap: Record<
      string,
      { regular: number; premium: number; diet: number; guests: number; totalLunches: number; cost: number }
    > = {};

    members.forEach((m) => {
      memberMap[m.id] = { regular: 0, premium: 0, diet: 0, guests: 0, totalLunches: 0, cost: 0 };
    });

    datesInMonth.forEach((dateStr) => {
      const dayData = dailyAttendance[dateStr] || {};
      Object.entries(dayData).forEach(([mId, entry]) => {
        if (!memberMap[mId]) {
          memberMap[mId] = { regular: 0, premium: 0, diet: 0, guests: 0, totalLunches: 0, cost: 0 };
        }
        if (entry.hadLunch) {
          if (entry.category === "regular") {
            memberMap[mId].regular++;
            totalRegular++;
          } else if (entry.category === "premium") {
            memberMap[mId].premium++;
            totalPremium++;
          } else if (entry.category === "diet") {
            memberMap[mId].diet++;
            totalDiet++;
          }
          memberMap[mId].totalLunches++;
          totalMonthLunches++;
        }
        if (entry.guestCount > 0) {
          memberMap[mId].guests += entry.guestCount;
          totalGuests += entry.guestCount;
          memberMap[mId].totalLunches += entry.guestCount;
          totalMonthLunches += entry.guestCount;
        }
      });
    });

    let totalAuditedCost = 0;
    Object.keys(memberMap).forEach((mId) => {
      const row = memberMap[mId];
      const memberCost = round2(
        row.regular * categoryPrices.regular +
        row.premium * categoryPrices.premium +
        row.diet * categoryPrices.diet +
        row.guests * categoryPrices.regular
      );
      row.cost = memberCost;
      totalAuditedCost = round2(totalAuditedCost + memberCost);
    });

    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthKey));
    const totalMonthExpenses = round2(monthExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0));

    const monthDeposits = deposits.filter((d) => d.date.startsWith(currentMonthKey));
    const totalMonthDeposits = round2(monthDeposits.reduce((sum, item) => sum + Number(item.amount || 0), 0));

    return {
      datesInMonthCount: datesInMonth.length,
      totalMonthLunches,
      totalRegular,
      totalPremium,
      totalDiet,
      totalGuests,
      totalMonthExpenses,
      totalMonthDeposits,
      totalAuditedCost,
      memberMap
    };
  }, [dailyAttendance, currentMonthKey, members, categoryPrices, expenses, deposits]);

  const toggleMemberLunch = (memberId: string) => {
    if (isCurrentMonthLocked) {
      triggerToast("This month is closed & locked. Reopen month to modify records.");
      return;
    }
    const currentEntry = todayRecords[memberId] || {
      hadLunch: false,
      category: members.find((m) => m.id === memberId)?.defaultCategory || "regular",
      guestCount: 0
    };

    const updatedEntry: LunchDayEntry = {
      ...currentEntry,
      hadLunch: !currentEntry.hadLunch
    };

    setDailyAttendance((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [memberId]: updatedEntry
      }
    }));
  };

  const setMemberCategory = (memberId: string, category: LunchCategoryType) => {
    if (isCurrentMonthLocked) {
      triggerToast("This month is locked.");
      return;
    }
    const currentEntry = todayRecords[memberId] || {
      hadLunch: true,
      category,
      guestCount: 0
    };

    setDailyAttendance((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [memberId]: {
          ...currentEntry,
          hadLunch: true,
          category
        }
      }
    }));
  };

  const adjustGuestCount = (memberId: string, delta: number) => {
    if (isCurrentMonthLocked) return;
    const currentEntry = todayRecords[memberId] || {
      hadLunch: false,
      category: "regular",
      guestCount: 0
    };
    const newCount = Math.max(0, (currentEntry.guestCount || 0) + delta);

    setDailyAttendance((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [memberId]: {
          ...currentEntry,
          guestCount: newCount
        }
      }
    }));
  };

  const handleBulkMarkAll = (status: boolean) => {
    if (isCurrentMonthLocked) return;
    const newDayMap: Record<string, LunchDayEntry> = { ...(dailyAttendance[selectedDate] || {}) };
    members.forEach((m) => {
      if (m.isActive) {
        newDayMap[m.id] = {
          hadLunch: status,
          category: newDayMap[m.id]?.category || m.defaultCategory,
          guestCount: newDayMap[m.id]?.guestCount || 0
        };
      }
    });

    setDailyAttendance((prev) => ({ ...prev, [selectedDate]: newDayMap }));
    triggerToast(status ? "All active staff marked IN for lunch" : "All staff marked OUT");
  };

  const handleApplyUserDefaults = () => {
    if (isCurrentMonthLocked) return;
    const newDayMap: Record<string, LunchDayEntry> = {};
    members.forEach((m) => {
      if (m.isActive) {
        newDayMap[m.id] = {
          hadLunch: true,
          category: m.defaultCategory,
          guestCount: 0
        };
      }
    });
    setDailyAttendance((prev) => ({ ...prev, [selectedDate]: newDayMap }));
    triggerToast("Applied default lunch categories for all active staff");
  };

  const copyCateringDispatchText = () => {
    const text =
      `🍱 *LUNCH ORDER DISPATCH - ${selectedDate}*\n` +
      `------------------------------------\n` +
      `🍲 Regular Lunch: ${catererDailyStats.regularCount} plates\n` +
      `✨ Premium Lunch: ${catererDailyStats.premiumCount} plates\n` +
      `🥗 Diet Lunch: ${catererDailyStats.dietCount} plates\n` +
      `👥 Guest Lunches: ${catererDailyStats.guestCount} plates\n` +
      `------------------------------------\n` +
      `🔥 *TOTAL PORTIONS TO DELIVER: ${catererDailyStats.totalOrderHeadcount}*\n` +
      `Est. Value: ${currencySymbol}${catererDailyStats.estimatedBill.toFixed(2)}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedDispatch(true);
      triggerToast("Caterer dispatch message copied to clipboard!");
      setTimeout(() => setCopiedDispatch(false), 2500);
    });
  };

  const handleSaveMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const department = (form.elements.namedItem("department") as HTMLSelectElement).value as OfficeDepartment;
    const contact = (form.elements.namedItem("contact") as HTMLInputElement).value.trim();
    const depositBalance = parseFloat((form.elements.namedItem("depositBalance") as HTMLInputElement).value) || 0;
    const defaultCategory = (form.elements.namedItem("defaultCategory") as HTMLSelectElement).value as LunchCategoryType;
    const isActive = (form.elements.namedItem("isActive") as HTMLInputElement).checked;

    if (!name) return;

    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? { ...m, name, department, contact, depositBalance, defaultCategory, isActive }
            : m
        )
      );
      triggerToast(`Member ${name} updated`);
    } else {
      const newM: Member = {
        id: `m-${Date.now()}`,
        name,
        department,
        contact,
        depositBalance,
        defaultCategory,
        isActive
      };
      setMembers((prev) => [...prev, newM]);
      triggerToast(`Member ${name} added to ${department}`);
    }

    setShowMemberModal(false);
    setEditingMember(null);
  };

  const handleSaveExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCurrentMonthLocked) {
      triggerToast("Cannot record expense in locked month.");
      return;
    }
    const form = e.currentTarget;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value.trim();
    const amount = parseFloat((form.elements.namedItem("amount") as HTMLInputElement).value) || 0;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value as any;
    const paidBy = (form.elements.namedItem("paidBy") as HTMLSelectElement).value;

    if (!title || amount <= 0) return;

    const newExp: LunchExpense = {
      id: `exp-${Date.now()}`,
      date,
      title,
      amount: round2(amount),
      category,
      paidBy
    };

    setExpenses((prev) => [newExp, ...prev]);
    setShowExpenseModal(false);
    triggerToast(`Expense of ${currencySymbol}${amount.toFixed(2)} recorded.`);
  };

  const handleSaveDeposit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const memberId = (form.elements.namedItem("memberId") as HTMLSelectElement).value;
    const amount = parseFloat((form.elements.namedItem("amount") as HTMLInputElement).value) || 0;
    const note = (form.elements.namedItem("note") as HTMLInputElement).value.trim();
    const date = (form.elements.namedItem("date") as HTMLInputElement).value || selectedDate;

    if (!memberId || amount <= 0) return;

    const newDep: DepositRecord = {
      id: `dep-${Date.now()}`,
      memberId,
      date,
      amount: round2(amount),
      note: note || "Cash / Online Transfer"
    };

    setDeposits((prev) => [newDep, ...prev]);
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, depositBalance: round2(m.depositBalance + amount) } : m))
    );

    setShowDepositModal(false);
    triggerToast(`Deposit of ${currencySymbol}${amount.toFixed(2)} added.`);
  };

  const handleFinalizeMonth = () => {
    setConfirmConfig({
      title: `Finalize & Close Month [${currentMonthKey}]?`,
      desc: "This will lock all daily lunch records and expenses for this month. Member deposit balances will be adjusted against their consumed lunch costs.",
      action: () => {
        const updatedMembers = members.map((m) => {
          const stats = monthlyStats.memberMap[m.id];
          const consumedCost = stats ? stats.cost : 0;
          return {
            ...m,
            depositBalance: round2(m.depositBalance - consumedCost)
          };
        });

        const newClosing: MonthlyClosing = {
          monthKey: currentMonthKey,
          closedAt: new Date().toISOString(),
          totalExpenses: monthlyStats.totalMonthExpenses,
          totalLunches: monthlyStats.totalMonthLunches,
          categoryPrices: { ...categoryPrices },
          isLocked: true
        };

        setMembers(updatedMembers);
        setClosings((prev) => ({ ...prev, [currentMonthKey]: newClosing }));
        triggerToast(`Month ${currentMonthKey} settled and officially closed!`);
      }
    });
    setShowConfirmModal(true);
  };

  const handleUnlockMonth = () => {
    setConfirmConfig({
      title: `Reopen Closed Month [${currentMonthKey}]?`,
      desc: "Unlocking will allow editing records again. Note that balance adjustments may need to be re-audited upon re-closing.",
      action: () => {
        setClosings((prev) => {
          const copy = { ...prev };
          delete copy[currentMonthKey];
          return copy;
        });
        triggerToast(`Month ${currentMonthKey} unlocked.`);
      }
    });
    setShowConfirmModal(true);
  };

  const exportToCSV = () => {
    let csv = `LunchFlow Pro - Monthly Lunch Audit Report (${currentMonthKey})\n`;
    csv += `Generated On,${new Date().toLocaleDateString()}\n`;
    csv += `Total Lunches,${monthlyStats.totalMonthLunches}\n`;
    csv += `Audited Consumption Cost,${currencySymbol}${monthlyStats.totalAuditedCost.toFixed(2)}\n`;
    csv += `Unit Pricing,Regular: ${currencySymbol}${categoryPrices.regular} | Premium: ${currencySymbol}${categoryPrices.premium} | Diet: ${currencySymbol}${categoryPrices.diet}\n\n`;

    csv += `Member Name,Department,Contact,Regular Plates,Premium Plates,Diet Plates,Guest Plates,Total Portions,Computed Cost (${currencySymbol}),Current Deposit (${currencySymbol}),Net Settlement (${currencySymbol}),Status\n`;

    members.forEach((m) => {
      const data = monthlyStats.memberMap[m.id] || { regular: 0, premium: 0, diet: 0, guests: 0, totalLunches: 0, cost: 0 };
      const net = round2(m.depositBalance - data.cost);
      const status = net >= 0 ? "Refund / Advance Surplus" : "Due to Pay";
      csv += `"${m.name}","${m.department}","${m.contact}",${data.regular},${data.premium},${data.diet},${data.guests},${data.totalLunches},${data.cost.toFixed(2)},${m.depositBalance.toFixed(2)},${net.toFixed(2)},"${status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LunchFlow_Settlement_${currentMonthKey}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("Excel (.csv) exported successfully!");
  };

  const handleBackupJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      currencySymbol,
      categoryPrices,
      members,
      dailyAttendance,
      expenses,
      deposits,
      closings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lunchflow-full-backup-${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("JSON database backup downloaded.");
  };

  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.members && parsed.dailyAttendance) {
          setMembers(parsed.members);
          setDailyAttendance(parsed.dailyAttendance);
          if (parsed.expenses) setExpenses(parsed.expenses);
          if (parsed.deposits) setDeposits(parsed.deposits);
          if (parsed.closings) setClosings(parsed.closings);
          if (parsed.categoryPrices) setCategoryPrices(parsed.categoryPrices);
          if (parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
          triggerToast("Database successfully restored from JSON!");
        } else {
          triggerToast("Invalid backup file format.");
        }
      } catch (err) {
        triggerToast("Failed to parse backup JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const displayedMembers = useMemo(() => {
    if (departmentFilter === "ALL") return members;
    return members.filter((m) => m.department === departmentFilter);
  }, [members, departmentFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-orange-100">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">LunchFlow</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    PRO 2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Office Lunch Headcount & Category Accounting</p>
              </div>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab("daily")}
                className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === "daily"
                    ? "bg-orange-50 text-orange-600 font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Daily Counter</span>
              </button>

              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === "expenses"
                    ? "bg-orange-50 text-orange-600 font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden sm:inline">Lunch Expenses</span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === "members"
                    ? "bg-orange-50 text-orange-600 font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Staff List</span>
              </button>

              <button
                onClick={() => setActiveTab("monthlyClosing")}
                className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center space-x-1.5 ${
                  activeTab === "monthlyClosing"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Monthly Closing</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 overflow-x-auto py-0.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Categories:</span>
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold">
              <span>🍲 Regular:</span>
              <span className="font-extrabold">{currencySymbol}{categoryPrices.regular.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-900 border border-indigo-200 px-2.5 py-1 rounded-lg font-semibold">
              <span>✨ Premium:</span>
              <span className="font-extrabold">{currencySymbol}{categoryPrices.premium.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
              <span>🥗 Diet:</span>
              <span className="font-extrabold">{currencySymbol}{categoryPrices.diet.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowPricingModal(true)}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-1 rounded-md transition"
              title="Edit Lunch Category Pricing"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupJSON}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-slate-500" /> Backup DB
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1"
            >
              <Upload className="w-3 h-3 text-slate-500" /> Restore
            </button>
            <input type="file" ref={fileInputRef} onChange={handleRestoreJSON} accept=".json" className="hidden" />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === "daily" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() - 1);
                      setSelectedDate(d.toISOString().split("T")[0]);
                    }}
                    className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-800 px-3 py-1 outline-none border-none cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      const d = new Date(selectedDate);
                      d.setDate(d.getDate() + 1);
                      setSelectedDate(d.toISOString().split("T")[0]);
                    }}
                    className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedDate(getTodayString())}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Today
                </button>

                {isCurrentMonthLocked ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" /> Month Locked
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Entries Open
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="grid grid-cols-4 gap-3 text-center w-full sm:w-auto">
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-300">Regular</p>
                    <p className="text-lg font-black">{catererDailyStats.regularCount}</p>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                    <p className="text-[10px] font-bold text-indigo-300">Premium</p>
                    <p className="text-lg font-black">{catererDailyStats.premiumCount}</p>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-300">Diet</p>
                    <p className="text-lg font-black">{catererDailyStats.dietCount}</p>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl">
                    <p className="text-[10px] font-bold text-purple-300">Guest</p>
                    <p className="text-lg font-black">{catererDailyStats.guestCount}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Portions</span>
                    <span className="text-xl font-black text-amber-400">{catererDailyStats.totalOrderHeadcount} Plates</span>
                  </div>
                  <button
                    onClick={copyCateringDispatchText}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {copiedDispatch ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedDispatch ? "Copied Order!" : "Copy for Caterer"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setDepartmentFilter("ALL")}
                  className={`px-3 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                    departmentFilter === "ALL"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Depts ({members.length})
                </button>
                {OFFICE_DEPARTMENTS.map((dept) => {
                  const count = members.filter((m) => m.department === dept).length;
                  return (
                    <button
                      key={dept}
                      onClick={() => setDepartmentFilter(dept)}
                      className={`px-3 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                        departmentFilter === dept
                          ? "bg-orange-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{dept}</span>
                      <span className="text-[10px] opacity-75 font-normal">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={handleApplyUserDefaults}
                  disabled={isCurrentMonthLocked}
                  className="px-3 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto-Fill User Defaults</span>
                </button>
                <button
                  onClick={() => handleBulkMarkAll(true)}
                  disabled={isCurrentMonthLocked}
                  className="px-3 py-2 text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl transition disabled:opacity-50"
                >
                  All In
                </button>
                <button
                  onClick={() => handleBulkMarkAll(false)}
                  disabled={isCurrentMonthLocked}
                  className="px-3 py-2 text-xs font-bold bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl transition disabled:opacity-50"
                >
                  All Out
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Staff Member</th>
                      <th className="py-4 px-4">Department</th>
                      <th className="py-4 px-4 text-center">Lunch Status</th>
                      <th className="py-4 px-4 text-center">Category Option</th>
                      <th className="py-4 px-4 text-center">Guest Portions</th>
                      <th className="py-4 px-5 text-right">Today's Charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {displayedMembers.map((member) => {
                      const entry = todayRecords[member.id] || {
                        hadLunch: false,
                        category: member.defaultCategory,
                        guestCount: 0
                      };

                      const currentRate = categoryPrices[entry.category] || categoryPrices.regular;
                      const staffCost = entry.hadLunch ? currentRate : 0;
                      const guestCost = (entry.guestCount || 0) * categoryPrices.regular;
                      const totalTodayCost = round2(staffCost + guestCost);

                      const initials = member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{member.name}</p>
                                <p className="text-[11px] text-slate-400">{member.contact || "No contact"}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                              {member.department}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => toggleMemberLunch(member.id)}
                              disabled={isCurrentMonthLocked}
                              className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50 ${
                                entry.hadLunch
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                              }`}
                            >
                              {entry.hadLunch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{entry.hadLunch ? "EATING LUNCH" : "OPTED OUT"}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
                              <button
                                onClick={() => setMemberCategory(member.id, "regular")}
                                disabled={isCurrentMonthLocked}
                                className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                                  entry.hadLunch && entry.category === "regular"
                                    ? "bg-amber-500 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                Regular
                              </button>
                              <button
                                onClick={() => setMemberCategory(member.id, "premium")}
                                disabled={isCurrentMonthLocked}
                                className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                                  entry.hadLunch && entry.category === "premium"
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                Premium
                              </button>
                              <button
                                onClick={() => setMemberCategory(member.id, "diet")}
                                disabled={isCurrentMonthLocked}
                                className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                                  entry.hadLunch && entry.category === "diet"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                Diet
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center space-x-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200">
                              <button
                                onClick={() => adjustGuestCount(member.id, -1)}
                                disabled={isCurrentMonthLocked || (entry.guestCount || 0) <= 0}
                                className="w-6 h-6 rounded-lg bg-white shadow-xs hover:bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs disabled:opacity-30"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-black text-xs text-slate-900">
                                {entry.guestCount || 0}
                              </span>
                              <button
                                onClick={() => adjustGuestCount(member.id, 1)}
                                disabled={isCurrentMonthLocked}
                                className="w-6 h-6 rounded-lg bg-white shadow-xs hover:bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-5 text-right font-black text-slate-900">
                            {currencySymbol}{totalTodayCost.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Lunch & Catering Expense Ledger</h2>
                <p className="text-xs text-slate-500">Track all invoices paid to the caterer, groceries, or team lunch contributions.</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                disabled={isCurrentMonthLocked}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Record Lunch Expense
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Month Expenses ({currentMonthKey})</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{currencySymbol}{monthlyStats.totalMonthExpenses.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Total paid to vendors / groceries</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Consumed Lunch Value</span>
                <p className="text-2xl font-black text-orange-600 mt-1">{currencySymbol}{monthlyStats.totalAuditedCost.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Billed based on staff categorized lunch counts</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Staff Advance Deposits</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{currencySymbol}{monthlyStats.totalMonthDeposits.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-0.5">Deposits received this month</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Title / Note</th>
                      <th className="py-4 px-4">Paid By</th>
                      <th className="py-4 px-5 text-right">Amount</th>
                      <th className="py-4 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.filter((e) => e.date.startsWith(currentMonthKey)).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          No lunch expenses recorded for {currentMonthKey}. Click "Record Lunch Expense" above.
                        </td>
                      </tr>
                    ) : (
                      expenses
                        .filter((e) => e.date.startsWith(currentMonthKey))
                        .map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-5 font-mono text-xs text-slate-600">{exp.date}</td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {exp.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">{exp.title}</td>
                            <td className="py-3.5 px-4 text-xs text-slate-600">{exp.paidBy}</td>
                            <td className="py-3.5 px-5 text-right font-black text-slate-900">
                              {currencySymbol}{exp.amount.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => {
                                  if (isCurrentMonthLocked) return;
                                  setExpenses((prev) => prev.filter((x) => x.id !== exp.id));
                                  triggerToast("Expense removed.");
                                }}
                                disabled={isCurrentMonthLocked}
                                className="text-slate-400 hover:text-rose-600 transition p-1 disabled:opacity-30"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Staff & Department Directory</h2>
                <p className="text-xs text-slate-500">Manage lunch participants, departments, deposit balances, and preferred lunch categories.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-sm transition flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Collect Deposit
                </button>
                <button
                  onClick={() => {
                    setEditingMember(null);
                    setShowMemberModal(true);
                  }}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-sm transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Employee
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div key={member.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{member.name}</h4>
                            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                              {member.department}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            member.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Default Category:</span>
                          <span className="font-bold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded-md">
                            {member.defaultCategory}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Deposit Advance:</span>
                          <span className={`font-black text-sm ${member.depositBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {currencySymbol}{member.depositBalance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingMember(member);
                          setShowMemberModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "monthlyClosing" && (
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Monthly Audit & Financial Closing ({currentMonthKey})
                  </h2>
                  {isCurrentMonthLocked && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" /> Locked & Settled
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  100% mathematically exact multi-category settlement ledger with balance carryover.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={exportToCSV}
                  className="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export to Excel (.csv)</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip / PDF</span>
                </button>

                {isCurrentMonthLocked ? (
                  <button
                    onClick={handleUnlockMonth}
                    className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Reopen Month</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFinalizeMonth}
                    className="px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Finalize & Close Month</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Consumed Lunches</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{monthlyStats.totalMonthLunches}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Staff & guests combined</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Category Breakdown</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  Reg: {monthlyStats.totalRegular} | Prem: {monthlyStats.totalPremium} | Diet: {monthlyStats.totalDiet}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">+ {monthlyStats.totalGuests} guest portions</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Billed Lunch Value</span>
                <p className="text-2xl font-black text-orange-600 mt-1">{currencySymbol}{monthlyStats.totalAuditedCost.toFixed(2)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Sum of all categorized plates</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Monthly Grocery / Caterer Bills</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{currencySymbol}{monthlyStats.totalMonthExpenses.toFixed(2)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Actual vendor invoices logged</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-4">Member Name</th>
                      <th className="py-4 px-3">Department</th>
                      <th className="py-4 px-3 text-center">Regular ({currencySymbol}{categoryPrices.regular})</th>
                      <th className="py-4 px-3 text-center">Premium ({currencySymbol}{categoryPrices.premium})</th>
                      <th className="py-4 px-3 text-center">Diet ({currencySymbol}{categoryPrices.diet})</th>
                      <th className="py-4 px-3 text-center">Guest ({currencySymbol}{categoryPrices.regular})</th>
                      <th className="py-4 px-3 text-center">Total Plates</th>
                      <th className="py-4 px-4 text-right">Lunch Cost</th>
                      <th className="py-4 px-4 text-right">Advance Balance</th>
                      <th className="py-4 px-4 text-right">Net Settlement</th>
                      <th className="py-4 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {members.map((member) => {
                      const data = monthlyStats.memberMap[member.id] || {
                        regular: 0,
                        premium: 0,
                        diet: 0,
                        guests: 0,
                        totalLunches: 0,
                        cost: 0
                      };
                      const net = round2(member.depositBalance - data.cost);
                      const isSurplus = net >= 0;

                      return (
                        <tr key={member.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{member.name}</td>
                          <td className="py-3.5 px-3">
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {member.department}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center text-slate-700">{data.regular}</td>
                          <td className="py-3.5 px-3 text-center text-indigo-700 font-semibold">{data.premium}</td>
                          <td className="py-3.5 px-3 text-center text-emerald-700 font-semibold">{data.diet}</td>
                          <td className="py-3.5 px-3 text-center text-purple-700 font-semibold">{data.guests}</td>
                          <td className="py-3.5 px-3 text-center font-black text-slate-900">{data.totalLunches}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            {currencySymbol}{data.cost.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                            {currencySymbol}{member.depositBalance.toFixed(2)}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black ${isSurplus ? "text-emerald-600" : "text-rose-600"}`}>
                            {isSurplus ? "+" : ""}{currencySymbol}{net.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isSurplus ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {isSurplus ? "Surplus / Refund" : "Must Pay"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-extrabold text-xs">
                    <tr>
                      <td className="py-4 px-4" colSpan={2}>
                        CONSOLIDATED AUDIT TOTALS
                      </td>
                      <td className="py-4 px-3 text-center">{monthlyStats.totalRegular}</td>
                      <td className="py-4 px-3 text-center">{monthlyStats.totalPremium}</td>
                      <td className="py-4 px-3 text-center">{monthlyStats.totalDiet}</td>
                      <td className="py-4 px-3 text-center">{monthlyStats.totalGuests}</td>
                      <td className="py-4 px-3 text-center text-amber-400">{monthlyStats.totalMonthLunches}</td>
                      <td className="py-4 px-4 text-right text-amber-400">{currencySymbol}{monthlyStats.totalAuditedCost.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right" colSpan={3}>
                        100% Rounded Precision
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPricingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">Lunch Category Pricing</h4>
              <button onClick={() => setShowPricingModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">🍲 Regular Lunch Price</label>
                <input
                  type="number"
                  step="0.1"
                  value={categoryPrices.regular}
                  onChange={(e) => setCategoryPrices((prev) => ({ ...prev, regular: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">✨ Premium Lunch Price</label>
                <input
                  type="number"
                  step="0.1"
                  value={categoryPrices.premium}
                  onChange={(e) => setCategoryPrices((prev) => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">🥗 Diet Lunch Price</label>
                <input
                  type="number"
                  step="0.1"
                  value={categoryPrices.diet}
                  onChange={(e) => setCategoryPrices((prev) => ({ ...prev, diet: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowPricingModal(false);
                  triggerToast("Category pricing updated.");
                }}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Save Prices
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">{editingMember ? "Edit Staff Member" : "Add Staff Member"}</h4>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMember?.name || ""}
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Department</label>
                <select
                  name="department"
                  defaultValue={editingMember?.department || "Software"}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none font-medium"
                >
                  {OFFICE_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email / Contact</label>
                <input
                  type="text"
                  name="contact"
                  defaultValue={editingMember?.contact || ""}
                  placeholder="e.g. staff@company.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Initial / Current Advance Deposit</label>
                <input
                  type="number"
                  step="0.01"
                  name="depositBalance"
                  defaultValue={editingMember?.depositBalance ?? 50.0}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Default Lunch Category</label>
                <select
                  name="defaultCategory"
                  defaultValue={editingMember?.defaultCategory || "regular"}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none font-medium"
                >
                  <option value="regular">Regular Lunch ({currencySymbol}{categoryPrices.regular})</option>
                  <option value="premium">Premium Lunch ({currencySymbol}{categoryPrices.premium})</option>
                  <option value="diet">Diet Lunch ({currencySymbol}{categoryPrices.diet})</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingMember ? editingMember.isActive : true}
                  className="w-4 h-4 rounded text-orange-600"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-700">
                  Active in lunch program
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">Record Lunch / Vendor Expense</h4>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Expense Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                <select name="category" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-medium">
                  <option value="Catering Vendor">Catering Vendor Invoice</option>
                  <option value="Groceries">Groceries & Rice</option>
                  <option value="Protein & Meat">Chicken, Beef & Fish</option>
                  <option value="Produce">Vegetables & Salad</option>
                  <option value="Utilities & Chef">Chef Salary & Utilities</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Receipt Note / Item</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Caterer Weekly Bill #401"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Paid By</label>
                  <select name="paidBy" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-medium">
                    <option value="Office Fund">Office Fund</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDepositModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">Collect Advance Deposit</h4>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDeposit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Staff Member</label>
                <select name="memberId" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-medium">
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Amount ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  required
                  placeholder="50.00"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-black text-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Deposit Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  name="note"
                  placeholder="Cash / Online Transfer"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Add Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-lg">{confirmConfig.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{confirmConfig.desc}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmConfig.action();
                  setShowConfirmModal(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
