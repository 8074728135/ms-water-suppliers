import { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import {
  Receipt,
  Plus,
  Fuel,
  Wrench,
  Truck,
  Trash2,
  X,
  Calendar,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ExpenseItem {
  id: string;
  category: 'Fuel' | 'Maintenance' | 'Salaries' | 'Vehicle Upkeep' | 'Other';
  amount: number;
  description: string;
  vehicle: string;
  date: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('ms_water_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* */
      }
    }
    return [
      {
        id: '1',
        category: 'Fuel',
        amount: 1500,
        description: 'Diesel refill at Indian Oil Pump, Lepakshi Road',
        vehicle: 'Tanker 1 (AP 04 XX 1024)',
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: '2',
        category: 'Maintenance',
        amount: 450,
        description: 'Water pump hose rubber coupling replacement',
        vehicle: 'Tanker 1 (AP 04 XX 1024)',
        date: new Date().toISOString().split('T')[0],
      },
    ];
  });

  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState<ExpenseItem['category']>('Fuel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vehicle, setVehicle] = useState('Tanker 1 (AP 04 XX 1024)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    localStorage.setItem('ms_water_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newExpense: ExpenseItem = {
      id: String(Date.now()),
      category,
      amount: amt,
      description: description || category,
      vehicle,
      date,
    };

    setExpenses([newExpense, ...expenses]);
    toast.success('Expense recorded successfully');
    setShowAdd(false);
    setAmount('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    toast.success('Expense entry removed');
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const fuelExpenses = expenses
    .filter((e) => e.category === 'Fuel')
    .reduce((acc, e) => acc + e.amount, 0);
  const maintExpenses = expenses
    .filter((e) => e.category === 'Maintenance' || e.category === 'Vehicle Upkeep')
    .reduce((acc, e) => acc + e.amount, 0);

  return (
    <AppShell breadcrumb="Management / Expenses">
      <Toaster position="top-right" />
      <div className="space-y-12 sm:space-y-16">
        {/* Header Module */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Operational Expenses</h1>
            <p className="text-base text-slate-500 mt-2 leading-relaxed">
              Tanker diesel, maintenance schedules, driver wages, and fleet operating costs.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary text-sm h-11 px-6 self-start sm:self-auto font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Financial KPI Cards Module with Centered Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Total Recorded Expenses
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-1 tabular-nums">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              {expenses.length} total ledger entries recorded
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Fuel (Diesel)
            </div>
            <div className="text-3xl sm:text-4xl font-black text-sky-600 my-1 tabular-nums">
              ₹{fuelExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              Tanker mileage and refills in Hindupur
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-9 shadow-xs flex flex-col items-center text-center justify-center min-h-[190px]">
            <div className="text-xs text-slate-500 uppercase font-extrabold tracking-wider mb-2">
              Maintenance & Spares
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 my-1 tabular-nums">
              ₹{maintExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              Hoses, valves, pumps, tires and servicing
            </div>
          </div>
        </div>

        {/* Expenses Table Module */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          {expenses.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              No expenses recorded yet.
            </div>
          ) : (
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Vehicle / Tanker</th>
                  <th>Amount</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="text-xs text-slate-600">
                        {item.date}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-800 font-medium">
                        {item.description}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.vehicle}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-100"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Expense Modal with Generous 4-Sided Padding */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-9 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Record Business Expense
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="input-field text-sm h-11 px-3.5 bg-white"
                >
                  <option value="Fuel">Fuel / Diesel</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Vehicle Upkeep">Vehicle Upkeep</option>
                  <option value="Salaries">Driver Daily Allowance / Salary</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Amount in Rupees (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="input-field text-sm h-11 px-3.5 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Description / Note
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15L Diesel at Lepakshi Petrol Bunk"
                  className="input-field text-sm h-11 px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Vehicle / Asset
                </label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g. Tanker 1"
                  className="input-field text-sm h-11 px-3.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field text-sm h-11 px-3.5"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="btn-secondary text-xs h-11 px-5 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs h-11 px-6 font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
