import { useState, useEffect } from 'react';
import { 
  User, 
  ChevronDown, 
  Monitor, 
  Armchair, 
  ArrowRight,
  Thermometer, 
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react'; 
const App = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const data = {
    nama: "Ikhsanuddin",
    gender: "Perempuan",
    usia: 19,
    bagian: "Distribusi",
    skorTotal: 18,
    status: "Aman (Risiko Rendah)",
    pesanSingkat: "Secara umum kondisi Anda baik, namun ada gejala awal pada area tangan yang perlu diwaspadai.",
    titikSakit: [
      { area: "Tangan & Jari", level: "Waspada", icon: "✋", detail: "Sering terasa kaku saat mengetik lama.", score: 1.5 },
      { area: "Punggung Tengah", level: "Gejala Ringan", icon: "👤", detail: "Pegal akibat posisi duduk kurang tegak.", score: 1.1 },
      { area: "Lutut & Kaki", level: "Gejala Ringan", icon: "🦵", detail: "Efek posisi kaki yang terlalu menekuk.", score: 1.0 },
      { area: "Leher", level: "Normal", icon: "🧣", detail: "Sedikit kaku namun masih batas wajar.", score: 0.4 },
      { area: "Bahu", level: "Normal", icon: "👔", detail: "Beban kerja bahu masih terkendali.", score: 0.3 }
    ],
    masalahUtama: [
      { 
        title: "Leher Sering Menoleh", 
        desc: "Layar monitor tidak sejajar mata, memaksa leher terus memutar.",
        impact: "Sakit leher atas & bahu",
        icon: <Monitor className="text-rose-400" />
      },
      { 
        title: "Meja Terlalu Tinggi", 
        desc: "Membuat bahu terangkat (shrugging) dan pergelangan tangan menekuk.",
        impact: "Kram tangan & jari",
        icon: <Zap className="text-amber-400" />
      },
      { 
        title: "Kursi Kurang Nyaman", 
        desc: "Sandaran tangan keras dan posisi punggung belum tertopang sempurna.",
        impact: "Pegal punggung bawah",
        icon: <Armchair className="text-cyan-400" />
      }
    ]
  };

  // Custom Radar Chart Calculation
  const radarLabels = data.titikSakit.map(d => d.area);
  const radarScores = data.titikSakit.map(d => d.score);
  const maxScore = 2; // Maximum scale for radar
  const center = 150;
  const radius = 100;

 const getPoint = (score: number, index: number, total: number) => { 
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (score / maxScore) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const radarPath = radarScores.map((score, i) => {
    const p = getPoint(score, i, radarScores.length);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ') + ' Z';

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Background Parallax Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]"
          style={{ transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px)` }}
        />
        <div 
          className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]"
          style={{ transform: `translate(-${scrollY * 0.05}px, -${scrollY * 0.1}px)` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-400">Personal Health Analytics</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic leading-tight">
            ERGONOMIC <br /> REPORT.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light">
            Halo <span className="text-white font-medium">{data.nama}</span>, ini adalah hasil pemetaan kesehatan tubuhmu saat bekerja di <span className="text-white font-medium">BPS Wakatobi</span>.
          </p>

          <div className="mt-12">
            <button className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-bold transition-all overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">Cek Kondisimu <ArrowRight size={18} /></span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce text-white/20">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Identity & Status */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Status Badge */}
          <div className="md:col-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black border border-white/5 shadow-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Level Risiko</h2>
                <p className="text-slate-500">Berdasarkan skor Nordic Body Map</p>
              </div>
              <ShieldCheck size={40} className="text-emerald-500" />
            </div>
            
            <div className="mt-12 flex items-end gap-4">
              <div className="text-7xl font-black text-emerald-500">{data.skorTotal}</div>
              <div className="pb-2">
                <div className="text-sm font-bold uppercase tracking-widest text-emerald-500/60">Total Skor</div>
                <div className="text-2xl font-bold text-white leading-tight">{data.status}</div>
              </div>
            </div>
            
            <p className="mt-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-200/80 italic text-sm">
              "{data.pesanSingkat}"
            </p>
          </div>

          {/* Mini Profile */}
          <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
              <User size={40} className="text-black" />
            </div>
            <h3 className="text-2xl font-bold">{data.nama}</h3>
            <p className="text-emerald-400 font-mono text-sm mt-1">{data.bagian}</p>
            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="text-slate-500 text-left">Usia</span>
                <span className="font-bold">{data.usia} thn</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="text-slate-500 text-left">Gender</span>
                <span className="font-bold">{data.gender}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Analytics Section (CHART) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="bg-slate-900/30 border border-white/5 rounded-[3rem] p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold tracking-widest uppercase">
                <BarChart3 size={12} /> Visual Analysis
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Peta Distribusi Keluhan</h2>
              <p className="text-slate-400 mb-8 leading-relaxed text-lg">
                Grafik ini menunjukkan persebaran intensitas nyeri pada tubuhmu. Semakin menjauh titik dari pusat, semakin tinggi tingkat ketidaknyamanan pada area tersebut.
              </p>
              
              <div className="space-y-4">
                {data.titikSakit.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-xs font-bold text-slate-500 uppercase tracking-tighter">{item.area}</div>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300" 
                        style={{ width: `${(item.score / maxScore) * 100}%`, transition: 'width 1.5s ease-out' }} 
                      />
                    </div>
                    <div className="text-xs font-mono text-emerald-400">{item.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center">
              {/* Radar Chart SVG */}
              <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                {/* Background Circles */}
                {[0.25, 0.5, 0.75, 1].map((step, i) => (
                  <circle
                    key={i}
                    cx={center}
                    cy={center}
                    r={radius * step}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeDasharray="4 4"
                  />
                ))}
                {/* Axis Lines */}
               {radarLabels.map((_, i) => {
                  const p = getPoint(maxScore, i, radarLabels.length);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={p.x}
                      y2={p.y}
                      stroke="rgba(255,255,255,0.05)"
                    />
                  );
                })}
                {/* Data Path */}
                <path
                  d={radarPath}
                  fill="rgba(16,185,129,0.15)"
                  stroke="#10b981"
                  strokeWidth="2"
                  className="transition-all duration-1000"
                />
                {/* Points */}
                {radarScores.map((score, i) => {
                  const p = getPoint(score, i, radarScores.length);
                  return (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#10b981"
                      className="hover:r-6 transition-all"
                    />
                  );
                })}
                {/* Labels */}
                {radarLabels.map((label, i) => {
                  const p = getPoint(maxScore + 0.3, i, radarLabels.length);
                  return (
                    <text
                      key={i}
                      x={p.x}
                      y={p.y}
                      fill="rgba(255,255,255,0.3)"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="uppercase tracking-tighter"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Map ( Nordic Body Map Simplified ) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Detail Keluhan Tubuh</h2>
          <p className="text-slate-400">Analisis spesifik per bagian tubuh berdasarkan survei harian.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.titikSakit.slice(0,3).map((item, idx) => (
            <div key={idx} className="group p-8 rounded-[2rem] bg-slate-900/50 border border-white/5 hover:border-emerald-500/50 transition-all">
              <div className="text-5xl mb-6">{item.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xl font-bold">{item.area}</h4>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{item.detail}</p>
              <div className="mt-6 inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                {item.level}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10 mb-20">
        <div className="flex items-center gap-3 mb-12 px-8">
          <Thermometer className="text-emerald-500" />
          <h2 className="text-3xl font-bold">Penyebab Utama & Solusinya</h2>
        </div>

        <div className="space-y-4 px-8 pb-8">
          {data.masalahUtama.map((item, idx) => (
            <div key={idx} className="group grid grid-cols-1 md:grid-cols-12 items-center gap-8 p-8 rounded-3xl bg-black/40 border border-white/5 hover:bg-black/60 transition-all">
              <div className="md:col-span-1 flex justify-center">
                {item.icon}
              </div>
              <div className="md:col-span-6">
                <h4 className="text-xl font-bold mb-1 text-white group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
              <div className="md:col-span-5 text-right md:text-left p-4 rounded-2xl bg-white/5">
                <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Dampak Fisik</div>
                <div className="text-sm font-medium">{item.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actionable Footer */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-1 rounded-[3rem] shadow-2xl shadow-emerald-500/20 transform hover:scale-[1.01] transition-transform">
          <div className="bg-[#050505] rounded-[2.9rem] p-12 md:p-20">
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-white">Mulai Perbaiki Hari Ini.</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-6 py-3 rounded-full bg-white/5 border border-white/10">💻 Naikkan layar monitor sejajar mata</span>
              <span className="px-6 py-3 rounded-full bg-white/5 border border-white/10">🧘‍♂️ Peregangan tangan tiap 2 jam</span>
              <span className="px-6 py-3 rounded-full bg-white/5 border border-white/10">🪑 Gunakan bantal tambahan untuk punggung</span>
            </div>
            <button className="mt-12 text-emerald-500 font-bold flex items-center gap-2 mx-auto hover:gap-4 transition-all">
              Pelajari Teknik Ergonomi Lengkap <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center text-slate-600 text-xs border-t border-white/5">
        <p>Laporan ini dihasilkan secara otomatis menggunakan Data-Driven Ergonomic Analysis v1.0</p>
        <p className="mt-2 tracking-widest uppercase">BPS Kabupaten Wakatobi &copy; 2026</p>
      </footer>

    </div>
  );
};

export default App;