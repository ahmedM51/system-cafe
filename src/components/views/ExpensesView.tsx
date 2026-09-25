import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { Expense } from '../../types';
import { Receipt, Plus, DollarSign, Calendar, User, Tag } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, currentShift } = useCafe();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<Expense['category']>('supplies');
  const [notes, setNotes] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;
    addExpense(title, amount, category, notes);
    setTitle('');
    setAmount(0);
    setNotes('');
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryLabels = {
    supplies: 'خامات ومستلزمات',
    utilities: 'فواتير ومرافق',
    maintenance: 'صيانة وإصلاحات',
    staff: 'مرتبات ويوميات',
    other: 'أخرى',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-2xl border border-[#e8ded0] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#231f1e] tracking-tight">المصروفات اليومية</h1>
          <p className="text-xs text-[#827163] mt-1 font-medium">
            تسجيل المصروفات النثرية وسحب الكاش من الدرج بموافقة الإدارة.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#faf6f0] border border-[#ded3c3] px-4 py-2 rounded-xl text-xs font-semibold text-[#4a3d34]">
          <span>إجمالي المصروفات:</span>
          <span className="text-base font-black text-[#231f1e] font-mono">{totalExpenses.toLocaleString()} ج</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form to add expense */}
        <div className="bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-xs h-fit space-y-4">
          <h2 className="text-base font-black text-[#231f1e] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#8c6239]" />
            <span>تسجيل مصروف جديد</span>
          </h2>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6e5f54]">بند الصرف</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: شراء نعناع، أدوات نظافة..."
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">المبلغ المطلوب (جنيه)</label>
              <input
                type="number"
                required
                min={1}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs font-bold text-[#231f1e]"
              >
                <option value="supplies">خامات ومستلزمات سريعة</option>
                <option value="maintenance">صيانة دورية وأعطال</option>
                <option value="utilities">فواتير ونثريات</option>
                <option value="staff">وجبات وضيافة عمال</option>
                <option value="other">مصروفات أخرى</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6e5f54]">ملاحظات (رقم الفاتورة أو المورد)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اختياري..."
                className="w-full mt-1 bg-[#faf6f0] border border-[#ded3c3] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#231f1e] hover:bg-[#38312e] text-white rounded-xl text-xs font-black transition cursor-pointer"
            >
              خصم من الدرج وتسجيل المصروف
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e8ded0] p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-[#231f1e]">سجل مصروفات اليوم</h2>

          <div className="divide-y divide-[#f5efe6] max-h-[500px] overflow-y-auto">
            {expenses.map((exp) => (
              <div key={exp.id} className="py-3.5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#231f1e]">{exp.title}</div>
                  <div className="flex items-center gap-3 text-[11px] text-[#8c7b6d]">
                    <span className="bg-[#faf6f0] px-2 py-0.5 rounded border border-[#ded3c3]">
                      {categoryLabels[exp.category]}
                    </span>
                    <span>المسؤول: {exp.cashier}</span>
                    {exp.notes && <span>({exp.notes})</span>}
                  </div>
                </div>

                <div className="text-sm font-black text-rose-800 font-mono">
                  -{exp.amount.toLocaleString()} ج
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
