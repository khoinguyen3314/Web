import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Wallet, 
  Zap, 
  ShieldCheck, 
  Coins, 
  ChevronRight,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  Crown,
  LogOut,
  Home
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [packages, setPackages] = useState([]);
  const [devPackages, setDevPackages] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isDevMode, setIsDevMode] = useState(false);
  const [devClickCount, setDevClickCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const currentUsername = localStorage.getItem("CurrentUsername") || "Guest";
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    // No more annoying alerts! 
    if (isLoggedIn) {
        fetchData();
        const interval = setInterval(fetchBalance, 5000);
        return () => clearInterval(interval);
    }
  }, [isLoggedIn, isDevMode]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('paymentStatus'); 
    if (status) {
      if (status === 'success') showToast('Recharge Successful! Thank you.', 'success');
      else if (status === 'failed') showToast('Transaction failed or cancelled.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchBalance();
    }
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/packages?dev=${isDevMode}`);
      setPackages(res.data.packages);
      setDevPackages(res.data.devPackages);
    } catch (err) {}
  };

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/balance`, {
        headers: { 'x-user-id': currentUsername }
      });
      setBalance(res.data.balance);
    } catch (err) {}
  };

  const handleDevToggle = () => {
    setDevClickCount(prev => {
      if (prev + 1 >= 5) {
        setIsDevMode(!isDevMode);
        showToast(isDevMode ? 'Developer Mode Disabled' : 'Developer Mode Enabled!', 'success');
        return 0;
      }
      return prev + 1;
    });
  };

  const handlePayment = async (packageId, provider) => {
    if (!isLoggedIn) {
        showToast('Please login from Home page first!', 'error');
        return;
    }
    setLoading(true);
    setLoadingText('Connecting...');
    try {
      const res = await axios.post(`${API_BASE}/payment/${provider}`, { 
        packageId, userId: currentUsername 
      });
      if (provider === 'dev' || provider === 'free') {
        showToast(res.data.message, res.data.success !== false ? 'success' : 'error');
        fetchBalance();
        setLoading(false);
        setShowPaymentModal(false);
      } else if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err) {
      showToast('Connection to payment server failed.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container">
      <div className="ambient-glow cyan" />
      <div className="ambient-glow pink" />

      {/* Toast */}
      <div className={`toast-container ${toast.show ? 'visible' : ''}`}>
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      </div>

      {/* Header */}
      <header className="app-header">
        <div onClick={handleDevToggle} className="app-logo cinzel">
          RHYTHM <span className="logo-glow">STORE</span>
        </div>
        <nav className="header-nav">
            <a href="http://localhost:5000/Home.html" className="nav-link-btn">
                <Home size={18} />
                HOME
            </a>
            <div className="user-info-react">
                <div className="balance-badge-react">
                    <Coins size={14} />
                    <span>{balance.toLocaleString()} RC</span>
                </div>
            </div>
        </nav>
      </header>

      <main className="app-main">
        <div className="recharge-hero">
            <h1 className="hero-title cinzel">RECHARGE</h1>
            <p className="hero-subtitle">Upgrade your musical experience</p>
            <div className="user-welcome">
                Welcome back, <span className="username-highlight">{currentUsername}</span>
            </div>
        </div>

        <div className="section-title">RC PACKAGES</div>
        <div className="package-grid">
          {packages.map(pkg => (
            <div 
                key={pkg.id} 
                className={`package-item ${pkg.id === 'p3' || pkg.id === 'p4' ? 'featured' : ''}`}
                onClick={() => {
                    setSelectedPackage(pkg);
                    setShowPaymentModal(true);
                }}
            >
                { (pkg.id === 'p3' || pkg.id === 'p4') && <div className="featured-label">HOT</div> }
                <div className="item-icon"><Coins size={36} color={pkg.price === 0 ? "#10b981" : "#00f2fe"} /></div>
                <div className="item-amount">{pkg.amount.toLocaleString()} <span className="rc-unit">RC</span></div>
                <div className="item-desc">{pkg.description}</div>
                <div className="item-price-btn">
                    {pkg.price === 0 ? 'FREE' : `${pkg.price.toLocaleString()} VND`}
                </div>
            </div>
          ))}
        </div>

        {isDevMode && (
          <>
            <div className="section-title dev-title">DEVELOPER TOOLS</div>
            <div className="package-grid">
              {devPackages.map(pkg => (
                <div key={pkg.id} className="package-item dev-item" onClick={() => handlePayment(pkg.id, 'dev')}>
                    <div className="item-icon"><Zap size={36} color="#ec4899" /></div>
                    <div className="item-amount">DEV TEST</div>
                    <div className="item-desc">{pkg.name}</div>
                    <div className="item-price-btn">FREE</div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>SELECT METHOD</h3>
              <button className="sheet-close" onClick={() => setShowPaymentModal(false)}><X size={24} /></button>
            </div>
            <div className="sheet-body">
              <div className="payment-summary">
                <span className="summary-pkg">{selectedPackage?.name}</span>
                <span className="summary-price">{selectedPackage?.price === 0 ? '0 VND' : `${selectedPackage?.price.toLocaleString()} VND`}</span>
              </div>
              <button className="payment-method-row" onClick={() => handlePayment(selectedPackage.id, 'vnpay')}>
                <div className="method-logo vnpay" />
                <div className="method-info"><span className="method-name">VNPay Wallet / QR Code</span><span className="method-sub">Secure payment via VNPay gateway</span></div>
                <ChevronRight size={20} className="method-arrow" />
              </button>
              <button className="payment-method-row" onClick={() => handlePayment(selectedPackage.id, 'momo')}>
                <div className="method-logo momo" />
                <div className="method-info"><span className="method-name">MoMo Wallet</span><span className="method-sub">Instant payment via MoMo app</span></div>
                <ChevronRight size={20} className="method-arrow" />
              </button>
              {selectedPackage?.price === 0 && (
                <button className="payment-method-row free-claim" onClick={() => handlePayment(selectedPackage.id, 'free')}>
                    <div className="method-logo free"><Zap size={24} color="#10b981" /></div>
                    <div className="method-info"><span className="method-name" style={{color: '#10b981'}}>Claim Free</span><span className="method-sub">Exclusive offer for new players</span></div>
                    <ChevronRight size={20} className="method-arrow" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && <div className="app-loader"><div className="loader-spinner" /><span>{loadingText}</span></div>}

      <style>{`
        .cinzel { font-family: 'Cinzel', serif; letter-spacing: 2px; }
        .header-nav { display: flex; align-items: center; gap: 15px; }
        .nav-link-btn { 
            display: flex; align-items: center; gap: 8px;
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); 
            color: #fff; padding: 8px 15px; border-radius: 12px; font-weight: 600; font-size: 0.8rem;
            text-decoration: none; transition: 0.3s;
        }
        .nav-link-btn:hover { background: rgba(255, 255, 255, 0.15); border-color: var(--accent-cyan); }

        .ambient-glow { position: fixed; width: 400px; height: 400px; filter: blur(100px); z-index: -1; opacity: 0.15; pointer-events: none; }
        .ambient-glow.cyan { top: -100px; left: -100px; background: var(--accent-cyan); }
        .ambient-glow.pink { bottom: -100px; right: -100px; background: var(--accent-pink); }
        
        .app-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 24px; background: rgba(15, 15, 45, 0.85); backdrop-filter: blur(15px); border-bottom: 1px solid var(--glass-border); position: sticky; top: 0; z-index: 100; }
        .logo-glow { color: var(--accent-cyan); text-shadow: 0 0 10px var(--accent-cyan); }
        
        .balance-badge-react { background: rgba(0, 242, 254, 0.1); padding: 6px 12px; border-radius: 15px; display: flex; align-items: center; gap: 8px; color: var(--accent-cyan); font-size: 0.85rem; font-weight: 700; border: 1px solid rgba(0, 242, 254, 0.2); }
        
        .app-main { padding: 25px; }
        .recharge-hero { text-align: center; margin-bottom: 40px; }
        .hero-title { font-size: 2.2rem; margin-bottom: 8px; text-shadow: 0 0 15px rgba(0,242,254,0.3); }
        .hero-subtitle { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 15px; }
        .username-highlight { color: var(--accent-cyan); font-weight: 700; }
        
        .section-title { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); letter-spacing: 2px; margin-bottom: 20px; }
        .package-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .package-item { background: var(--bg-indigo); border: 1px solid var(--glass-border); border-radius: 20px; padding: 25px 15px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden; }
        .package-item:hover { transform: translateY(-5px); border-color: var(--accent-cyan); }
        .featured { border-color: var(--accent-pink); }
        .featured-label { position: absolute; top: 10px; right: -25px; background: var(--accent-pink); font-size: 0.6rem; padding: 2px 30px; transform: rotate(45deg); font-weight: 800; }
        
        .item-amount { font-size: 1.4rem; font-weight: 800; margin-bottom: 5px; }
        .rc-unit { font-size: 0.8rem; color: var(--accent-cyan); }
        .item-desc { font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 10px; }
        .item-price-btn { margin-top: 20px; width: 100%; padding: 10px; border-radius: 12px; background: rgba(0,242,254,0.1); color: var(--accent-cyan); font-weight: 800; border: 1px solid rgba(0,242,254,0.2); text-align: center; font-size: 0.9rem; }
        
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: flex-end; z-index: 1000; }
        .modal-sheet { width: 100%; background: #15153c; border-radius: 25px 25px 0 0; padding: 30px; border-top: 2px solid var(--accent-cyan); animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .sheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .sheet-header h3 { font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--accent-cyan); }
        .sheet-close { background: none; border: none; color: var(--text-muted); cursor: pointer; }

        .payment-method-row { width: 100%; padding: 18px; background: rgba(255,255,255,0.03); border-radius: 18px; margin-bottom: 12px; display: flex; align-items: center; gap: 18px; border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; transition: 0.2s; }
        .payment-method-row:hover { background: rgba(255,255,255,0.08); border-color: var(--accent-cyan); transform: scale(1.02); }
        .method-logo { width: 45px; height: 45px; background-size: contain; background-repeat: no-repeat; background-position: center; border-radius: 10px; }
        .method-logo.vnpay { background-image: url('/LogoBank/VNPay.png'); }
        .method-logo.momo { background-image: url('/LogoBank/Momo.png'); }

        .app-loader { position: fixed; inset: 0; background: rgba(10, 10, 45, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000; gap: 20px; color: #fff; }
        .loader-spinner { width: 45px; height: 45px; border: 4px solid rgba(0, 242, 254, 0.1); border-top-color: var(--accent-cyan); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .toast-container { position: fixed; top: 15px; left: 50%; transform: translateX(-50%) translateY(-100px); transition: 0.4s; z-index: 3000; width: 90%; }
        .toast-container.visible { transform: translateX(-50%) translateY(0); }
        .toast { background: rgba(15, 15, 45, 0.95); padding: 15px 20px; border-radius: 12px; border: 1px solid var(--accent-cyan); display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}

export default App;