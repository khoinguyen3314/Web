import React, { useState, useEffect, useRef } from 'react';
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
  Home,
  Star,
  Gift,
  ShoppingBag
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
  
  const canvasRef = useRef(null);

  const currentUsername = localStorage.getItem("CurrentUsername") || "Guest";
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    if (isLoggedIn) {
        fetchData();
        const interval = setInterval(fetchBalance, 5000);
        return () => clearInterval(interval);
    }
  }, [isLoggedIn, isDevMode]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // --- ĐỒNG BỘ TRẠNG THÁI TỪ VANILLA HOME (PORT 5000) ---
    const userParam = urlParams.get('user');
    const authParam = urlParams.get('auth');
    
    if (userParam && authParam === 'true') {
        localStorage.setItem("CurrentUsername", userParam);
        localStorage.setItem("isLoggedIn", "true");
        // Reload nhẹ hoặc xóa param để sạch URL
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.reload(); 
        return;
    }

    const status = urlParams.get('paymentStatus'); 
    if (status) {
      if (status === 'success') showToast('Recharge Successful! Thank you.', 'success');
      else if (status === 'failed') showToast('Transaction failed or cancelled.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchBalance();
    }
  }, []);

  // Background Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const mouse = { x: null, y: null, radius: 200 };

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseOut = () => { mouse.x = null; mouse.y = null; };
    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('resize', handleResize);

    class Shard {
      constructor() { this.reset(); this.y = Math.random() * height; }
      reset() {
        this.x = Math.random() * width; this.y = height + Math.random() * 100;
        this.size = Math.random() * 18 + 10; this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = -(Math.random() * 0.6 + 0.4); this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.006; this.opacity = Math.random() * 0.35 + 0.15;
        this.points = []; const count = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const radius = this.size * (0.7 + Math.random() * 0.5);
          this.points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        }
      }
      update() {
        this.x += this.speedX; this.y += this.speedY; this.angle += this.spin;
        if (mouse.x !== null) {
          const dx = this.x - mouse.x; const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius && distance > 0) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x += (dx / distance) * force * 2; this.y += (dy / distance) * force * 2;
          }
        }
        if (this.y < -50 || this.x < -50 || this.x > width + 50) this.reset();
      }
      draw() {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
        const grad = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
        grad.addColorStop(0, `rgba(0,242,254,${this.opacity})`);
        grad.addColorStop(0.5, `rgba(236,72,153,${this.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(255,255,255,${this.opacity * 0.4})`);
        ctx.fillStyle = grad; ctx.strokeStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) ctx.lineTo(this.points[i].x, this.points[i].y);
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      }
    }

    const shards = Array.from({ length: 26 }, () => new Shard());
    let waveOffset = 0;
    const animate = () => {
      ctx.fillStyle = "#0f0f2d"; ctx.fillRect(0, 0, width, height);
      waveOffset += 0.0018;
      [{a:50, f:0.0014, c:"rgba(0,242,254,.12)"}, {a:35, f:0.0018, c:"rgba(236,72,153,.10)"}, {a:65, f:0.001, c:"rgba(255,255,255,.08)"}].forEach(w => {
        ctx.beginPath(); ctx.strokeStyle = w.c;
        for (let x = 0; x <= width; x += 10) {
          const y = height * 0.65 + (Math.sin(x * w.f + waveOffset) + Math.cos(x * w.f * 0.5)) * w.a;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      shards.forEach(s => { s.update(); s.draw(); });
      requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('resize', handleResize);
    };
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
    <div className="web-store-wrapper">
      <canvas ref={canvasRef} id="rhythm-canvas" />
      <div className="vignette-overlay" />
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="ambient-glow-center" />

      {/* Toast */}
      <div className={`toast-container-web ${toast.show ? 'visible' : ''}`}>
        <div className={`toast-web ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      </div>

      {/* Navbar */}
      <header className="navbar-web">
        <div onClick={handleDevToggle} className="logo-web cinzel">
          RHYTHM <span className="logo-glow">GAME</span>
        </div>
        <nav className="nav-links-web">
            <a href="http://localhost:5000/Home.html">HOME</a>
            <div className="balance-card-mini">
                <Coins size={16} color="#00f2fe" />
                <span>{balance.toLocaleString()} RC</span>
            </div>
            <div className="user-pill">
                <Crown size={14} color="#ffd700" />
                <span>{currentUsername}</span>
            </div>
        </nav>
      </header>

      <main className="page-container-web">
        <div className="page-header-web">
            <h1 className="cinzel">RECHARGE STORE</h1>
            <p>Upgrade your musical experience with premium RC packages</p>
        </div>

        <div className="store-grid">
          {packages.map(pkg => (
            <div 
                key={pkg.id} 
                className={`package-card-web ${pkg.id === 'p3' || pkg.id === 'p4' ? 'popular' : ''}`}
                onClick={() => {
                    setSelectedPackage(pkg);
                    setShowPaymentModal(true);
                }}
            >
                { (pkg.id === 'p3' || pkg.id === 'p4') && <div className="popular-tag">HOT</div> }
                <div className="pkg-icon"><Coins size={48} color={pkg.price === 0 ? "#10b981" : "#00f2fe"} /></div>
                <div className="pkg-amount">{pkg.amount.toLocaleString()} <span className="rc-text">RC</span></div>
                <div className="pkg-desc">{pkg.description}</div>
                <div className="pkg-price-btn">
                    {pkg.price === 0 ? 'CLAIM FREE' : `${pkg.price.toLocaleString()} VND`}
                </div>
            </div>
          ))}
        </div>

        {isDevMode && (
          <div className="dev-section-web glass-card-web">
            <h2 className="cinzel"><Zap size={24} color="#ec4899" /> DEVELOPER TOOLS</h2>
            <div className="dev-grid-web">
              {devPackages.map(pkg => (
                <button key={pkg.id} className="dev-btn-web" onClick={() => handlePayment(pkg.id, 'dev')}>
                    {pkg.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay-web" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content-web glass-card-web" onClick={e => e.stopPropagation()}>
            <button className="modal-close-web" onClick={() => setShowPaymentModal(false)}><X size={24} /></button>
            <div className="modal-header-web">
              <h3 className="cinzel">SELECT PAYMENT METHOD</h3>
              <p>Purchasing: <strong>{selectedPackage?.amount.toLocaleString()} RC</strong> for {selectedPackage?.price === 0 ? '0 VND' : `${selectedPackage?.price.toLocaleString()} VND`}</p>
            </div>
            
            <div className="method-list-web">
              <button className="method-item-web" onClick={() => handlePayment(selectedPackage.id, 'vnpay')}>
                <div className="method-icon-vnpay" />
                <div className="method-text">
                    <span className="method-name">VNPay / QR Code</span>
                    <span className="method-sub">Secure payment via VNPay gateway</span>
                </div>
                <ChevronRight size={20} />
              </button>

              <button className="method-item-web" onClick={() => handlePayment(selectedPackage.id, 'momo')}>
                <div className="method-icon-momo" />
                <div className="method-text">
                    <span className="method-name">MoMo Wallet</span>
                    <span className="method-sub">Instant payment via MoMo app</span>
                </div>
                <ChevronRight size={20} />
              </button>

              <button className="method-item-web" onClick={() => handlePayment(selectedPackage.id, 'momo_atm')}>
                <div className="method-icon-momo" />
                <div className="method-text">
                    <span className="method-name">MoMo ATM</span>
                    <span className="method-sub">Payment via Domestic ATM cards</span>
                </div>
                <ChevronRight size={20} />
              </button>

              {selectedPackage?.price === 0 && (
                <button className="method-item-web claim-item-web" onClick={() => handlePayment(selectedPackage.id, 'free')}>
                    <div className="method-icon-free"><Gift size={28} color="#10b981" /></div>
                    <div className="method-text">
                        <span className="method-name" style={{color: '#10b981'}}>Claim Free</span>
                        <span className="method-sub">Exclusive offer for new players</span>
                    </div>
                    <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-screen-web">
          <div className="spinner-web" />
          <p>{loadingText}</p>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        :root {
            --accent-cyan: #00f2fe;
            --accent-pink: #ec4899;
            --bg-dark: #0f0f2d;
            --glass: rgba(255, 255, 255, 0.06);
            --glass-border: rgba(255, 255, 255, 0.12);
        }

        .web-store-wrapper {
            font-family: 'Montserrat', sans-serif;
            color: white;
            min-height: 100vh;
            background: var(--bg-dark);
        }

        .cinzel { font-family: 'Cinzel', serif; letter-spacing: 3px; }

        #rhythm-canvas { position: fixed; inset: 0; z-index: -3; width: 100%; height: 100%; }
        .vignette-overlay { position: fixed; inset: 0; background: radial-gradient(circle at center, rgba(21,21,60,0.15), rgba(10,8,28,0.8)); z-index: -2; pointer-events: none; }
        .ambient-glow-1 { position: fixed; top: -10%; left: -10%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(0,242,254,0.15), transparent 70%); filter: blur(80px); z-index: -1; pointer-events: none; }
        .ambient-glow-2 { position: fixed; bottom: -10%; right: -10%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%); filter: blur(80px); z-index: -1; pointer-events: none; }
        .ambient-glow-center { position: fixed; top: 50%; left: 50%; width: 900px; height: 900px; transform: translate(-50%,-50%); background: radial-gradient(circle, rgba(147,51,234,0.1), transparent 70%); filter: blur(100px); z-index: -1; pointer-events: none; }

        .navbar-web { position: fixed; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 25px 60px; z-index: 100; background: rgba(15, 15, 45, 0.6); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); }
        .logo-web { font-size: 1.8rem; font-weight: 700; cursor: pointer; text-shadow: 0 0 15px var(--accent-cyan); }
        .logo-glow { color: var(--accent-cyan); }
        .nav-links-web { display: flex; align-items: center; gap: 40px; }
        .nav-links-web a { text-decoration: none; color: rgba(255,255,255,0.8); font-weight: 600; font-size: 0.9rem; transition: 0.3s; }
        .nav-links-web a:hover { color: white; text-shadow: 0 0 10px var(--accent-cyan); }
        
        .balance-card-mini { background: rgba(0, 242, 254, 0.1); border: 1px solid rgba(0, 242, 254, 0.3); padding: 8px 18px; border-radius: 20px; display: flex; align-items: center; gap: 10px; font-weight: 800; color: var(--accent-cyan); }
        .user-pill { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); padding: 8px 18px; border-radius: 20px; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; font-weight: 600; }

        .page-container-web { max-width: 1400px; margin: 0 auto; padding: 160px 60px 100px; position: relative; z-index: 10; }
        .page-header-web { text-align: center; margin-bottom: 80px; }
        .page-header-web h1 { font-size: 3.5rem; margin-bottom: 20px; text-shadow: 0 0 20px rgba(0,242,254,0.4); }
        .page-header-web p { color: rgba(255,255,255,0.6); font-size: 1.1rem; letter-spacing: 2px; }

        .store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
        .package-card-web { background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)); border: 1px solid var(--glass-border); backdrop-filter: blur(20px); border-radius: 30px; padding: 50px 30px; text-align: center; transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; position: relative; overflow: hidden; }
        .package-card-web:hover { transform: translateY(-12px); border-color: var(--accent-cyan); background: rgba(255,255,255,0.08); box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 20px rgba(0, 242, 254, 0.1); }
        .package-card-web.popular { border-color: rgba(236, 72, 153, 0.4); }
        .popular-tag { position: absolute; top: 15px; right: -30px; background: var(--accent-pink); color: white; padding: 5px 40px; transform: rotate(45deg); font-size: 0.7rem; font-weight: 800; letter-spacing: 2px; }
        
        .pkg-icon { margin-bottom: 25px; }
        .pkg-amount { font-size: 2.2rem; font-weight: 900; margin-bottom: 10px; }
        .rc-text { font-size: 1rem; color: var(--accent-cyan); }
        .pkg-desc { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 35px; }
        .pkg-price-btn { background: rgba(0, 242, 254, 0.1); border: 1px solid rgba(0, 242, 254, 0.2); color: var(--accent-cyan); padding: 15px; border-radius: 18px; font-weight: 800; font-size: 1.1rem; transition: 0.3s; }
        .package-card-web:hover .pkg-price-btn { background: var(--accent-cyan); color: #000; }

        .dev-section-web { margin-top: 100px; padding: 40px; text-align: center; }
        .dev-section-web h2 { font-size: 1.2rem; margin-bottom: 30px; color: var(--accent-pink); display: flex; align-items: center; justify-content: center; gap: 15px; }
        .dev-grid-web { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; }
        .dev-btn-web { background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.2); color: #fff; padding: 12px 25px; border-radius: 15px; cursor: pointer; transition: 0.2s; }
        .dev-btn-web:hover { background: var(--accent-pink); border-color: var(--accent-pink); }

        .modal-overlay-web { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content-web { max-width: 550px; width: 100%; padding: 50px; position: relative; animation: popWeb 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popWeb { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-close-web { position: absolute; top: 25px; right: 25px; background: none; border: none; color: white; opacity: 0.5; cursor: pointer; transition: 0.2s; }
        .modal-close-web:hover { opacity: 1; transform: rotate(90deg); }
        .modal-header-web { text-align: center; margin-bottom: 40px; }
        .modal-header-web h3 { font-size: 1.5rem; color: var(--accent-cyan); margin-bottom: 15px; }
        .modal-header-web p { color: rgba(255,255,255,0.6); }

        .method-list-web { display: flex; flex-direction: column; gap: 15px; }
        .method-item-web { width: 100%; display: flex; align-items: center; gap: 25px; padding: 22px 30px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 20px; color: white; cursor: pointer; transition: 0.2s; text-align: left; }
        .method-item-web:hover { background: rgba(255,255,255,0.08); border-color: var(--accent-cyan); transform: translateX(10px); }
        .method-icon-vnpay { width: 50px; height: 50px; background: url('http://localhost:5000/LogoBank/VNPay.png') center/contain no-repeat; }
        .method-icon-momo { width: 50px; height: 50px; background: url('http://localhost:5000/LogoBank/Momo.png') center/contain no-repeat; }
        .method-text { flex: 1; }
        .method-name { display: block; font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; }
        .method-sub { display: block; font-size: 0.8rem; color: rgba(255,255,255,0.5); }

        .loading-screen-web { position: fixed; inset: 0; background: rgba(10, 10, 45, 0.98); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000; gap: 20px; }
        .spinner-web { width: 60px; height: 60px; border: 5px solid rgba(0, 242, 254, 0.1); border-top-color: var(--accent-cyan); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .toast-container-web { position: fixed; top: 30px; left: 50%; transform: translateX(-50%) translateY(-100px); transition: 0.4s; z-index: 3000; }
        .toast-container-web.visible { transform: translateX(-50%) translateY(0); }
        .toast-web { background: rgba(15, 15, 45, 0.9); backdrop-filter: blur(10px); padding: 18px 30px; border-radius: 20px; border: 1px solid var(--accent-cyan); display: flex; align-items: center; gap: 15px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .toast-web.error { border-color: var(--accent-pink); }

        .glass-card-web { background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04)); border: 1px solid var(--glass-border); backdrop-filter: blur(30px); border-radius: 30px; }
      `}</style>
    </div>
  );
}

export default App;