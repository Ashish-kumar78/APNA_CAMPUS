import React, { useState } from 'react';
import {
  Utensils,
  ShoppingBag,
  DollarSign,
  Coffee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  FileText,
  LogOut,
  Search,
  Plus,
  Edit2,
  Download,
  X,
  TrendingUp,
  Menu,
  MessageSquare
} from 'lucide-react';
import './CanteenPortal.css';
import '../components/AdminPortal.css';
import { downloadCanteenStatementPdf } from '../utils/pdfGenerator';
import { api } from '../services/api.js';
import { useTimeGreeting } from '../utils/timeGreeting.js';
import CampusConnect from './CampusConnect/CampusConnect.jsx';

export default function CanteenPortal({ account, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const greeting = useTimeGreeting();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Main Course',
    price: 50,
    prepTime: '10 mins',
    calories: '350 kcal'
  });

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  React.useEffect(() => {
    let active = true;
    Promise.all([api.getCanteenMenu(), api.getCanteenOrders()])
      .then(([menu, orderList]) => {
        if (!active) return;
        if (menu?.success) setFoodItems(menu.data || []);
        if (orderList?.success) setOrders(orderList.data || []);
      })
      .catch((err) => {
        if (active) showToast(`Could not load canteen records: ${err.message}`);
      });
    return () => { active = false; };
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await api.updateCanteenOrderStatus(orderId, newStatus);
      if (!result?.success) throw new Error(result?.message || 'Order update was rejected.');
      setOrders(prev => prev.map(o => o.id === orderId ? result.data : o));
      showToast(`Order ${orderId} is now marked as "${newStatus}"!`);
    } catch (err) {
      showToast(`Could not update order: ${err.message}`);
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      const result = await api.toggleFoodAvailability(itemId);
      if (!result?.success) throw new Error(result?.message || 'Availability update was rejected.');
      setFoodItems(prev => prev.map(item => item.id === itemId ? result.data : item));
      showToast(`${result.data.name} marked as ${result.data.isAvailable ? 'Available' : 'Out of Stock'}.`);
    } catch (err) {
      showToast(`Could not update menu item: ${err.message}`);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const newItem = {
      name: itemForm.name,
      category: itemForm.category,
      price: Number(itemForm.price),
      prepTime: itemForm.prepTime,
      calories: itemForm.calories,
      isAvailable: true
    };
    try {
      const result = await api.addFoodItem(newItem);
      if (!result?.success) throw new Error(result?.message || 'Menu item was not saved.');
      setFoodItems(prev => [...prev, result.data]);
      setIsAddItemModalOpen(false);
      showToast(`Added ${result.data.name} (₹${result.data.price}) to Smart Canteen menu!`);
    } catch (err) {
      showToast(`Could not add menu item: ${err.message}`);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
  const readyOrders = orders.filter(o => o.status === 'Ready').length;
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);

  return (
    <div className="canteen-portal-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          borderLeft: '4px solid #f59e0b'
        }}>
          <CheckCircle2 size={18} color="#fbbf24" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="canteen-header">
        <div className="canteen-brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!sidebarOpen && (
            <button
              className="campus-nav-toggle-btn"
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="Show Navigation"
              aria-label="Show Navigation"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="canteen-brand-icon" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="canteen-brand-text">
            <h1>APNA CAMPUS · SMART MESS &amp; CANTEEN</h1>
            <p>Food Services &amp; Kitchen Management Terminal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Top-Right Campus OS User Profile Pill with Sign Out */}
          <div className="campus-user-pill">
            <div className="campus-user-avatar">CAN</div>
            <div className="campus-user-details">
              <strong>{account?.name || 'Canteen Staff'}</strong>
              <small>Smart Mess &amp; Canteen Operations</small>
            </div>
            <button
              className="campus-logout-btn"
              type="button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className={`canteen-layout ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="canteen-sidebar">
            <div className="canteen-sidebar-header">
              <span className="canteen-sidebar-title">Canteen Menu</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="canteen-sidebar-close"
                title="Close Navigation"
              >
                <X size={16} />
              </button>
            </div>
            <button
              className={`canteen-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Layers size={17} /> Dashboard
            </button>
            <button
              className={`canteen-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={17} /> Live Order Queue ({pendingOrders + preparingOrders})
            </button>
            <button
              className={`canteen-nav-btn ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              <Utensils size={17} /> Food Menu & Pricing
            </button>
            <button
              className={`canteen-nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileText size={17} /> Daily Sales Reports
            </button>
          </aside>
        )}

        {/* Dynamic Content Pane */}
        <main className="canteen-main">
          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 120px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>{greeting}, {account?.name || 'Canteen Manager'}</h2>
                  <p>Central Kitchen &amp; Smart Canteen Operations · Daily campus meal statistics &amp; orders pipeline.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsAddItemModalOpen(true)}>
                  <Plus size={15} /> Add Food Item
                </button>
              </div>

              {/* KPI Grid */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Today's Total Orders</span>
                    <div className="admin-kpi-card-icon blue"><ShoppingBag size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">42</div>
                  <small style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <TrendingUp size={13} /> High lunch rush
                  </small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Today's Revenue</span>
                    <div className="admin-kpi-card-icon emerald"><DollarSign size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
                  <small style={{ color: '#64748b' }}>RFID & UPI Collections</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Menu Items Active</span>
                    <div className="admin-kpi-card-icon purple"><Utensils size={18} /></div>
                  </div>
                  <div className="admin-kpi-val">{foodItems.filter(f => f.isAvailable).length} / {foodItems.length}</div>
                  <small style={{ color: '#64748b' }}>All meal categories</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Pending / Preparing</span>
                    <div className="admin-kpi-card-icon amber"><Clock size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#d97706' }}>{pendingOrders + preparingOrders}</div>
                  <small style={{ color: '#d97706', fontWeight: 600 }}>In kitchen queue</small>
                </div>

                <div className="admin-kpi-card">
                  <div className="admin-kpi-card-header">
                    <span className="admin-kpi-label">Ready for Pickup</span>
                    <div className="admin-kpi-card-icon emerald"><CheckCircle2 size={18} /></div>
                  </div>
                  <div className="admin-kpi-val" style={{ color: '#059669' }}>{readyOrders}</div>
                  <small style={{ color: '#059669', fontWeight: 600 }}>At delivery counter</small>
                </div>
              </div>

              {/* Live Order Pipeline Quick View */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Live Kitchen Queue</h3>
                  <button className="admin-action-btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('orders')}>
                    View Full Screen Queue
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {orders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1rem',
                        borderLeft: `4px solid ${order.status === 'Completed' ? '#059669' : order.status === 'Ready' ? '#2563eb' : '#d97706'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: '#1e3a8a' }}>{order.token}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.id} · {order.orderedAt}</div>
                        </div>
                        <span className={`admin-badge ${order.status === 'Completed' ? 'approved' : order.status === 'Ready' ? 'active' : 'pending'}`}>
                          {order.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.35rem' }}>
                        {order.studentName} (Roll {order.rollNumber})
                      </div>

                      <ul style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#475569' }}>
                        {order.items.map((it, idx) => (
                          <li key={idx}>{it.qty} × {it.name} (₹{it.price})</li>
                        ))}
                      </ul>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                        <strong style={{ color: '#059669', fontSize: '0.95rem' }}>₹{order.totalAmount}</strong>
                        {order.status === 'Pending' && (
                          <button
                            className="admin-action-btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                          >
                            Accept & Prepare
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            className="admin-action-btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#2563eb' }}
                            onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'Ready' && (
                          <button
                            className="admin-action-btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#059669' }}
                            onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                          >
                            Deliver / Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ORDER QUEUE */}
          {activeTab === 'orders' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Kitchen Orders & Counter Dispatch Queue</h2>
                  <p>Real-time order workflow: Pending $\to$ Preparing $\to$ Ready $\to$ Completed.</p>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Token #</th>
                      <th>Order ID</th>
                      <th>Resident Student</th>
                      <th>Food Items</th>
                      <th>Total Amount</th>
                      <th>Payment Channel</th>
                      <th>Time Placed</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Kitchen Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{o.token}</strong></td>
                        <td><code>{o.id}</code></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.studentName}</div>
                          <small style={{ color: '#64748b' }}>Roll {o.rollNumber}</small>
                        </td>
                        <td>
                          {o.items.map((i, idx) => (
                            <span key={idx} style={{ display: 'inline-block', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginRight: '4px' }}>
                              {i.qty}× {i.name}
                            </span>
                          ))}
                        </td>
                        <td><strong style={{ color: '#059669' }}>₹{o.totalAmount}</strong></td>
                        <td><span className="admin-badge active">{o.paymentMode}</span></td>
                        <td>{o.orderedAt}</td>
                        <td>
                          <span className={`admin-badge ${o.status === 'Completed' ? 'approved' : o.status === 'Ready' ? 'active' : 'pending'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {o.status === 'Pending' && (
                            <button
                              className="admin-action-btn-primary"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                              onClick={() => handleUpdateOrderStatus(o.id, 'Preparing')}
                            >
                              Start Preparing
                            </button>
                          )}
                          {o.status === 'Preparing' && (
                            <button
                              className="admin-action-btn-primary"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#2563eb' }}
                              onClick={() => handleUpdateOrderStatus(o.id, 'Ready')}
                            >
                              Ready for Pickup
                            </button>
                          )}
                          {o.status === 'Ready' && (
                            <button
                              className="admin-action-btn-primary"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#059669' }}
                              onClick={() => handleUpdateOrderStatus(o.id, 'Completed')}
                            >
                              Mark Delivered
                            </button>
                          )}
                          {o.status === 'Completed' && (
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Delivered ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FOOD MENU & PRICING */}
          {activeTab === 'menu' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Smart Canteen Menu & Pricing Catalog</h2>
                  <p>Daily meal items, prices, calories, and instant out-of-stock toggle switches.</p>
                </div>
                <button className="admin-action-btn-primary" onClick={() => setIsAddItemModalOpen(true)}>
                  <Plus size={15} /> Add New Dish
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {foodItems.map(item => (
                  <div key={item.id} className="admin-card" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="admin-badge active">{item.category}</span>
                      <strong style={{ fontSize: '1.25rem', color: '#059669' }}>₹{item.price}</strong>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{item.name}</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                      <span>Prep: {item.prepTime}</span>
                      <span>Cal: {item.calories}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <span className={`admin-badge ${item.isAvailable ? 'approved' : 'rejected'}`}>
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                      <button
                        className="admin-action-btn-secondary"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.775rem' }}
                        onClick={() => handleToggleAvailability(item.id)}
                      >
                        {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DAILY SALES REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-view-header">
                <div>
                  <h2>Canteen Sales & Revenue Statements</h2>
                  <p>Daily transaction summaries, kitchen inventory usage, and RFID smart card reconciliation.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 className="admin-card-title">Daily Counter Sales Report</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Itemized quantity sold, gross revenue, and payment method distribution.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => {
                    downloadCanteenStatementPdf();
                    showToast('Generated & downloaded Daily Canteen Sales PDF.');
                  }}>
                    <Download size={15} /> Download PDF Statement
                  </button>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">RFID Smart Card Settlement Sheet</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
                    Digital wallet token ledger for reconciliation with bursar accounts.
                  </p>
                  <button className="admin-action-btn-primary" onClick={() => showToast('Exported RFID Settlement Spreadsheet.')}>
                    <Download size={15} /> Export Excel / CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD FOOD ITEM */}
      {isAddItemModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>Add Food Item to Menu</h3>
              <button className="admin-table-action-btn" onClick={() => setIsAddItemModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Item Name</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={itemForm.name}
                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="e.g. Masala Dosa"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Category</label>
                    <select
                      className="admin-form-select"
                      value={itemForm.category}
                      onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    >
                      <option value="Main Course">Main Course</option>
                      <option value="Breakfast/Snacks">Breakfast/Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={itemForm.price}
                      onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Preparation Time</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={itemForm.prepTime}
                      onChange={e => setItemForm({ ...itemForm, prepTime: e.target.value })}
                      placeholder="e.g. 10 mins"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Calories</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={itemForm.calories}
                      onChange={e => setItemForm({ ...itemForm, calories: e.target.value })}
                      placeholder="e.g. 350 kcal"
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-action-btn-secondary" onClick={() => setIsAddItemModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn-primary">
                  Save & Publish to Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
