// Apna Campus ERP — Kitchen Inventory Section
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, AlertTriangle, CheckCircle2, 
  Download, ArrowDownRight, ArrowUpRight, ShoppingCart, RefreshCw, X, Check
} from 'lucide-react';
import { canteenStore } from '../../services/canteenStore';

export default function CanteenKitchenInventorySection({ showToast, account }) {
  const [dataVersion, setDataVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txItemId, setTxItemId] = useState('inv-01');
  const [txType, setTxType] = useState('PURCHASE'); // PURCHASE, DAILY_USAGE, WASTAGE_DISPOSAL
  const [txQty, setTxQty] = useState('50');
  const [txSupplier, setTxSupplier] = useState('Odisha Agro Wholesale Mandi');
  const [txInvoice, setTxInvoice] = useState('INV-AGRO-2026-901');
  const [txReason, setTxReason] = useState('Routine bi-weekly bulk replenishment');

  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1);
    window.addEventListener('cms_canteen_updated', handleUpdate);
    return () => window.removeEventListener('cms_canteen_updated', handleUpdate);
  }, []);

  const inventory = useMemo(() => {
    let items = canteenStore.getKitchenInventory(selectedCategory);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.itemCode.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [selectedCategory, search, dataVersion]);

  const allItems = useMemo(() => canteenStore.getKitchenInventory('All'), [dataVersion]);

  const categories = useMemo(() => {
    return Array.from(new Set(allItems.map(i => i.category)));
  }, [allItems]);

  const lowStockCount = useMemo(() => {
    return allItems.filter(i => i.remainingStock <= i.minThreshold).length;
  }, [allItems]);

  const handleTxSubmit = (e) => {
    e.preventDefault();
    const res = canteenStore.recordInventoryTransaction({
      itemId: txItemId,
      type: txType,
      quantity: Number(txQty),
      supplier: txSupplier,
      invoiceNo: txInvoice,
      reason: txReason
    }, account?.name || 'Inventory Officer');

    if (res.success) {
      showToast?.(res.message, 'success');
      setIsTxModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Item Code', 'Item Name', 'Category', 'Unit', 'Opening Stock',
      'Purchased Qty', 'Used Qty', 'Remaining Stock', 'Wastage', 'Closing Stock', 'Unit Cost'
    ];
    const rows = inventory.map(i => [
      i.itemCode, i.name, i.category, i.unit, i.openingStock,
      i.purchasedQuantity, i.usedQuantity, i.remainingStock, i.wastage, i.closingStock, i.costPerUnit
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kitchen_Inventory_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('Inventory ledger exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Central Kitchen Stock Register
              </span>
              {lowStockCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {lowStockCount} Items Low
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Kitchen Raw Materials & Inventory Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tracks stock levels of Rice, Dal, Vegetables, Oils, Dairy, and Spices with batch replenishment and wastage records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-emerald-500" /> Export Ledger
            </button>
            <button
              onClick={() => {
                setTxType('PURCHASE');
                setIsTxModalOpen(true);
              }}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <ShoppingCart className="w-4 h-4" /> Record Procurement
            </button>
            <button
              onClick={() => {
                setTxType('DAILY_USAGE');
                setIsTxModalOpen(true);
              }}
              className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <ArrowDownRight className="w-4 h-4" /> Log Daily Usage
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search ingredient by name or item code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories ({allItems.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Stock Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Item Code & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Opening</th>
                <th className="py-3 px-4">Purchased</th>
                <th className="py-3 px-4">Used Qty</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Wastage</th>
                <th className="py-3 px-4">Closing Stock</th>
                <th className="py-3 px-4">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {inventory.map(item => {
                const isLow = item.remainingStock <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.itemCode} • ₹{item.costPerUnit}/{item.unit}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.category}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {item.openingStock} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      +{item.purchasedQuantity} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-600 dark:text-amber-400">
                      -{item.usedQuantity} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {item.remainingStock} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-rose-500">
                      {item.wastage} {item.unit}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {item.closingStock} {item.unit}
                    </td>

                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Reorder Now
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Healthy Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setIsTxModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Record Stock Transaction</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Procurement purchase, daily kitchen consumption, or wastage disposal</p>
              </div>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Ingredient</label>
                <select
                  value={txItemId}
                  onChange={e => setTxItemId(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {allItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.itemCode}) — Stock: {i.remainingStock} {i.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PURCHASE">Procurement (Purchase)</option>
                    <option value="DAILY_USAGE">Daily Kitchen Usage</option>
                    <option value="WASTAGE_DISPOSAL">Wastage Disposal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.5"
                    value={txQty}
                    onChange={e => setTxQty(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {txType === 'PURCHASE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                    <input
                      type="text"
                      value={txSupplier}
                      onChange={e => setTxSupplier(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={txInvoice}
                      onChange={e => setTxInvoice(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={txReason}
                  onChange={e => setTxReason(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Submit Stock Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

