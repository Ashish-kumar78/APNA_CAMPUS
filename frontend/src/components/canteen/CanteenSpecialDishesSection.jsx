// Apna Campus ERP — Special Dishes & Extra Curries Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  UtensilsCrossed, Plus, Search, CheckCircle2, Clock, 
  CreditCard, Sparkles, AlertCircle, ShoppingBag, X, Check
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenSpecialDishesSection({ showToast, account }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [activeTab, setActiveTab] = useState('menu'); // menu, live_orders
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  // Form State
  const [orderStudentId, setOrderStudentId] = useState('2401432265');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderMealType, setOrderMealType] = useState('Dinner');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const dishes = useMemo(() => canteenStore.getSpecialDishes(), [dataVersion]);
  const transactions = useMemo(() => canteenStore.getSpecialTransactions(), [dataVersion]);
  const hostellers = useMemo(() => canteenStore.getHostellers({}, 'admin'), [dataVersion]);

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!selectedDish) return;

    const res = canteenStore.orderSpecialDish({
      studentId: orderStudentId,
      dishId: selectedDish.id,
      quantity: Number(orderQuantity),
      scheduledMealType: orderMealType,
      scheduledDate: new Date().toISOString().split('T')[0]
    });

    if (res.success) {
      showToast?.(`Order placed successfully! Token #${res.transaction.token} generated.`, 'success');
      setIsOrderModalOpen(false);
      setSelectedDish(null);
    } else {
      showToast?.(res.message, 'error');
    }
  };

  const handleMarkServed = (txId) => {
    canteenStore.markSpecialDishServed(txId, account?.name || 'Chef In-Charge');
    showToast?.(`Order ${txId} confirmed as SERVED!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <UtensilsCrossed className="w-3.5 h-3.5" /> A-La-Carte Curries & Special Add-Ons
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Special Dishes & Live Kitchen Order Tokens
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Provides extra nutritional options, festival feasts, and prepaid RFID wallet billing for students and staff.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-1.5 px-4 rounded-lg transition ${
                activeTab === 'menu'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Special Menu ({dishes.length})
            </button>
            <button
              onClick={() => setActiveTab('live_orders')}
              className={`py-1.5 px-4 rounded-lg transition ${
                activeTab === 'live_orders'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Live Kitchen Orders ({transactions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Menu Cards */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dishes.map(dish => (
            <div key={dish.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      {dish.category}
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      ₹{dish.price}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{dish.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dish.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => {
                    setSelectedDish(dish);
                    setIsOrderModalOpen(true);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <ShoppingBag className="w-4 h-4" /> Issue Special Token
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Orders Table */}
      {activeTab === 'live_orders' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Live Kitchen Token Queue
            </h3>
            <span className="text-xs text-slate-400">Sorted by order time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Ordered Dish</th>
                  <th className="py-3 px-4">Meal & Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      #{tx.token}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{tx.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-400">ID: {tx.studentId}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {tx.dishName} (x{tx.quantity})
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <div>{tx.scheduledMealType}</div>
                      <div className="text-[10px] text-slate-400">{tx.scheduledServingDate}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{tx.totalAdditionalCharge}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.orderStatus === 'Served'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {tx.orderStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {tx.orderStatus !== 'Served' ? (
                        <button
                          onClick={() => handleMarkServed(tx.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                        >
                          Mark Served
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Served by {tx.servedBy || 'Kitchen'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Token Modal */}
      {isOrderModalOpen && selectedDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              Issue Special Meal Token
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {selectedDish.name} (₹{selectedDish.price})
            </p>

            <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Student</label>
                <select
                  value={orderStudentId}
                  onChange={e => setOrderStudentId(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {hostellers.map(h => (
                    <option key={h.studentId} value={h.studentId}>
                      {h.name} ({h.rollNumber}) — {h.hostelName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Serving Meal</label>
                  <select
                    value={orderMealType}
                    onChange={e => setOrderMealType(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Portions</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={orderQuantity}
                    onChange={e => setOrderQuantity(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Billing:</span>
                <span className="text-indigo-600 text-sm">₹{selectedDish.price * orderQuantity}</span>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Issue Kitchen Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

