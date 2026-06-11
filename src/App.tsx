import { useState, useEffect, useRef } from 'react';
import {
  User,
  Monitor,
  Armchair,
  ArrowRight,
  ChevronDown,
  Thermometer,
  ShieldCheck,
  Zap,
  BarChart3,
  Search,
  Building2,
  Activity,
  AlertTriangle,
  Users,
  Phone,
  X,
  CheckCircle2
} from 'lucide-react';

interface PainPoint {
  area: string;
  level: string;
  score: number;
  icon: string;
}

interface Issue {
  title: string;
  desc: string;
  impact: string;
  icon: string;
  type: string;
}

interface Employee {
  nama: string;
  gender: string;
  usia: string;
  lama_bekerja: string;
  durasi_kerja: string;
  bagian: string;
  satker: string;
  nbm_score: number;
  nbm_category: string;
  rosa_score: number;
  rosa_category: string;
  titik_sakit: PainPoint[];
  masalah_utama: Issue[];
}

interface DeptStat {
  bagian: string;
  count: number;
  avg_nbm: number;
  avg_rosa: number;
}

interface SatkerStat {
  satker: string;
  count: number;
  avg_nbm: number;
  avg_rosa: number;
}

interface BodyPainStat {
  area: string;
  percentage: number;
  total_pained: number;
  agak_sakit: number;
  sakit: number;
  sangat_sakit: number;
}

interface RiskFactorStat {
  factor: string;
  percentage: number;
  count: number;
}

interface Statistics {
  total_employees: number;
  avg_nbm: number;
  avg_rosa: number;
  nbm_categories: Record<string, number>;
  rosa_categories: Record<string, number>;
  department_stats: DeptStat[];
  satker_stats: SatkerStat[];
  body_pain_stats: BodyPainStat[];
  risk_factor_stats: RiskFactorStat[];
}

interface ErgonomicData {
  employees: Employee[];
  statistics: Statistics;
}

const getGroupedPain = (titikSakit: PainPoint[]) => {
  const findScore = (areas: string[]) => {
    const scores = titikSakit.filter(t => areas.includes(t.area)).map(t => t.score);
    return scores.length > 0 ? Math.max(...scores) : 0;
  };

  const groups = [
    {
      area: "Leher",
      score: findScore(["Leher Atas", "Leher Bawah"]),
      icon: "🧣",
      detail: "Keluhan pada leher atas & leher bawah akibat posisi monitor tidak sejajar mata."
    },
    {
      area: "Bahu & Punggung",
      score: findScore(["Bahu Kiri", "Bahu Kanan", "Punggung Tengah", "Pinggang / Punggung Bawah"]),
      icon: "👔",
      detail: "Keluhan pada bahu & tulang belakang akibat sandaran punggung atau meja kerja."
    },
    {
      area: "Lengan & Tangan",
      score: findScore(["Lengan Atas Kiri", "Lengan Atas Kanan", "Lengan Bawah Kiri", "Lengan Bawah Kanan", "Pergelangan Kiri", "Pergelangan Kanan", "Tangan Kiri", "Tangan Kanan"]),
      icon: "✋",
      detail: "Keluhan pada pergelangan tangan & jari akibat posisi keyboard/mouse menekuk."
    },
    {
      area: "Paha & Pinggul",
      score: findScore(["Pantat (Buttock)", "Pantat (Bottom)", "Paha Kiri", "Paha Kanan"]),
      icon: "🪑",
      detail: "Keluhan pada pinggul, pantat, dan paha akibat tinggi dudukan kursi tidak sesuai."
    },
    {
      area: "Kaki & Lutut",
      score: findScore(["Lutut Kiri", "Lutut Kanan", "Betis Kiri", "Betis Kanan", "Pergelangan Kaki Kiri", "Pergelangan Kaki Kanan", "Kaki Kiri", "Kaki Kanan"]),
      icon: "🦵",
      detail: "Keluhan pada lutut & kaki akibat posisi kaki yang terlalu menekuk atau menggantung."
    }
  ];

  return groups.map(g => {
    let level = "Normal";
    if (g.score === 1) level = "Gejala Ringan";
    else if (g.score === 2) level = "Waspada";
    else if (g.score === 3) level = "Risiko Tinggi";
    return { ...g, level };
  });
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Monitor':
      return <Monitor className="text-rose-500" />;
    case 'Armchair':
      return <Armchair className="text-sky-500" />;
    case 'Zap':
      return <Zap className="text-amber-500" />;
    case 'Phone':
      return <Phone className="text-emerald-500" />;
    default:
      return <ShieldCheck className="text-blue-500" />;
  }
};

// Calculate pain statistics for a specific Satker
const getSatkerPainStats = (employees: Employee[]) => {
  const painCounts: Record<string, { total: number; agak: number; sakit: number; sangat: number }> = {};

  if (employees.length === 0) return [];

  // Initialize map based on first employee's structure
  employees[0].titik_sakit.forEach(t => {
    painCounts[t.area] = { total: 0, agak: 0, sakit: 0, sangat: 0 };
  });

  employees.forEach(emp => {
    emp.titik_sakit.forEach(t => {
      if (t.score > 0) {
        if (!painCounts[t.area]) {
          painCounts[t.area] = { total: 0, agak: 0, sakit: 0, sangat: 0 };
        }
        painCounts[t.area].total += 1;
        if (t.score === 1) painCounts[t.area].agak += 1;
        else if (t.score === 2) painCounts[t.area].sakit += 1;
        else if (t.score === 3) painCounts[t.area].sangat += 1;
      }
    });
  });

  const statsList = Object.entries(painCounts).map(([area, counts]) => {
    const percentage = employees.length > 0 ? ((counts.total / employees.length) * 100).toFixed(1) : "0.0";
    return {
      area,
      percentage: parseFloat(percentage),
      total_pained: counts.total,
      agak_sakit: counts.agak,
      sakit: counts.sakit,
      sangat_sakit: counts.sangat
    };
  });

  return statsList.sort((a, b) => b.percentage - a.percentage);
};

// Calculate risk factor statistics for a specific Satker
const getSatkerRiskStats = (employees: Employee[]) => {
  const riskCounts: Record<string, number> = {};

  employees.forEach(emp => {
    emp.masalah_utama.forEach(issue => {
      riskCounts[issue.title] = (riskCounts[issue.title] || 0) + 1;
    });
  });

  const statsList = Object.entries(riskCounts).map(([factor, count]) => {
    const percentage = employees.length > 0 ? ((count / employees.length) * 100).toFixed(1) : "0.0";
    return {
      factor,
      percentage: parseFloat(percentage),
      count
    };
  });

  return statsList.sort((a, b) => b.percentage - a.percentage);
};

const App = () => {
  const [scrollY, setScrollY] = useState(0);
  const [hash, setHash] = useState(window.location.hash);

  // Data states
  const [data, setData] = useState<ErgonomicData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<'personal' | 'provincial' | 'satker'>('personal');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showOnlyPained, setShowOnlyPained] = useState<boolean>(false);
  const [selectedSatker, setSelectedSatker] = useState<string>('');

  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Sync scroll positioning
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch data dynamically based on active route
  useEffect(() => {
    if (hash === '#/provinsi') {
      setLoading(true);
      setSelectedEmployee(null);
      setSearchQuery('');
      setCurrentTab('personal');
      fetch('/provinsi_data.json')
        .then(res => res.json())
        .then((jsonData: ErgonomicData) => {
          setData(jsonData);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load Provinsi data:", err);
          setLoading(false);
        });
    } else if (hash === '#/kabkota') {
      setLoading(true);
      setSelectedEmployee(null);
      setSearchQuery('');
      setCurrentTab('personal');
      fetch('/kabkota_data.json')
        .then(res => res.json())
        .then((jsonData: ErgonomicData) => {
          setData(jsonData);
          setLoading(false);
          if (jsonData.employees && jsonData.employees.length > 0) {
            const satkers = Array.from(new Set(jsonData.employees.map(e => e.satker))).sort();
            if (satkers.length > 0) {
              setSelectedSatker(satkers[0]);
            }
          }
        })
        .catch(err => {
          console.error("Failed to load Kabkota data:", err);
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [hash]);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Back to main portal
  const handleBackToPortal = () => {
    window.location.hash = '';
  };

  if (hash !== '#/provinsi' && hash !== '#/kabkota') {
    /* MAIN PORTAL LANDING PAGE */
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/15 via-white to-sky-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between relative overflow-hidden">

        {/* Colorful Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-200/35 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-cyan-100/60 blur-[100px]" />
          <div className="absolute top-[15%] right-[10%] w-[35%] h-[35%] rounded-full bg-pink-100/40 blur-[110px]" />
        </div>

        {/* Portal Header */}
        <header className="relative z-10 px-8 py-6 max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Activity size={20} className="text-white font-black" />
            </div>
            <div>
              <span className="font-bold text-blue-900 tracking-widest text-sm uppercase">DellCare Sultra</span>
              <span className="text-[9px] text-blue-500 font-mono block leading-none tracking-widest uppercase">Prov Sultra</span>
            </div>
          </div>
        </header>

        {/* Portal Body */}
        <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 w-full flex-grow flex flex-col justify-center items-center">
          <div className="text-center mb-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-700">Ergonomic Health Portal</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4 leading-none italic bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
              DellCare.
            </h1>
            <h2 className="text-lg md:text-xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent font-mono uppercase">
              Analisis Kondisi Ergonomi Pegawai
            </h2>
            <p className="text-base text-slate-500 font-light leading-relaxed mb-6">
              Selamat datang di portal analisis kondisi ergonomi pegawai Badan Pusat Statistik se-Provinsi Sulawesi Tenggara. Pilih lingkup satuan kerja di bawah ini:
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-[9px] md:text-xs text-blue-600 font-mono text-center mb-8">
              <span>🚀</span>
              <span>Proker Analisis Kesehatan Masyarakat Magang Hub Batch 3 BPS Provinsi Sultra - Delima Yulia Hartati S.KM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

            {/* Card 1: Provinsi */}
            <a
              href="#/provinsi"
              className="group p-8 md:p-10 rounded-[3rem] bg-gradient-to-br from-blue-50/80 via-white to-white border border-blue-100 hover:border-blue-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] shadow-md transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full blur-2xl group-hover:bg-blue-200/50 transition-all" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-100/40 rounded-full blur-xl" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-all">
                  <Building2 size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">BPS Provinsi</h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">
                  Laporan ergonomi personal dan dashboard analisis kesehatan untuk pegawai di lingkungan kantor **BPS Provinsi Sulawesi Tenggara**.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-3 font-bold text-sm text-blue-600 group-hover:text-blue-800 transition-colors">
                Buka Analisis Provinsi <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Card 2: Kabkota */}
            <a
              href="#/kabkota"
              className="group p-8 md:p-10 rounded-[3rem] bg-gradient-to-br from-pink-50/60 via-white to-white border border-pink-100 hover:border-pink-300 hover:shadow-[0_20px_50px_rgba(236,72,153,0.12)] shadow-md transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-200/30 rounded-full blur-2xl group-hover:bg-pink-200/50 transition-all" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100/30 rounded-full blur-xl" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-all">
                  <Users size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">BPS Kabupaten/Kota</h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed">
                  Laporan ergonomi personal dan dashboard analisis pemetaan risiko komparatif untuk seluruh pegawai **BPS Kabupaten/Kota se-Sulawesi Tenggara**.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-3 font-bold text-sm text-pink-600 group-hover:text-pink-800 transition-colors">
                Buka Analisis Kabupaten/Kota <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

          </div>
        </main>

        {/* Portal Footer */}
        <footer className="relative z-10 py-10 text-center text-slate-500 text-xs border-t border-blue-100 mt-12">
          <p>Portal DellCare Sulawesi Tenggara &copy; 2026</p>
          <p className="mt-2 tracking-widest uppercase text-[10px] text-blue-400">Data-Driven Ergonomic Analysis</p>
          <p className="mt-2 text-slate-400 text-[10px] font-mono">Prov Sultra - Proker Analisis Kesehatan Masyarakat Magang Hub Batch 3 BPS Provinsi Sultra - Delima Yulia Hartati S.KM</p>
        </footer>

      </div>
    );
  }

  // Loading state inside router
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 text-slate-800 flex flex-col items-center justify-center gap-4">
        <div className="relative flex h-14 w-14">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-14 w-14 bg-gradient-to-br from-blue-500 to-sky-600 shadow-lg shadow-blue-400/40"></span>
        </div>
        <p className="text-blue-600 font-mono tracking-widest text-sm uppercase animate-pulse">Memuat Data Analisis...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 text-slate-800 flex flex-col items-center justify-center gap-4">
        <AlertTriangle size={48} className="text-rose-500" />
        <p className="text-rose-600 font-mono text-sm uppercase">Gagal memuat basis data ergonomi.</p>
        <button onClick={handleBackToPortal} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/30">
          Kembali ke Portal Utama
        </button>
      </div>
    );
  }

  const isKabkoRoute = hash === '#/kabkota';
  const portalName = isKabkoRoute ? "BPS Kabupaten/Kota" : "BPS Provinsi Sultra";

  // Filter autocomplete suggestions
  const filteredSuggestions = searchQuery.trim() !== ''
    ? data.employees.filter(emp =>
      emp.nama.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8)
    : data.employees.slice(0, 5);

  // Grouped pain points for selected employee radar chart
  const groupedPain = selectedEmployee ? getGroupedPain(selectedEmployee.titik_sakit) : [];

  // Custom Radar Chart Calculation
  const radarLabels = groupedPain.map(d => d.area);
  const radarScores = groupedPain.map(d => d.score);
  const maxScore = 3;
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

  const radarPath = radarScores.length > 0 ? radarScores.map((score, i) => {
    const p = getPoint(score, i, radarScores.length);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ') + ' Z' : '';

  // Get active pain points for selected employee
  const activePainPoints = selectedEmployee
    ? selectedEmployee.titik_sakit.filter(t => t.score > 0)
    : [];

  // Get high risk ratio for stats
  const totalEmployees = data.statistics.total_employees;
  const totalHighRisk = data.statistics.rosa_categories["Risiko Tinggi"] || 0;
  const highRiskPercentage = ((totalHighRisk / totalEmployees) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/15 via-white to-sky-50/40 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">

      {/* Background Parallax Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[120px]"
          style={{ transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.02}px)` }}
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-pink-200/25 blur-[100px]"
          style={{ transform: `translate(-${scrollY * 0.02}px, -${scrollY * 0.05}px)` }}
        />
        <div
          className="absolute top-[15%] right-[20%] w-[35%] h-[35%] rounded-full bg-purple-100/20 blur-[110px]"
          style={{ transform: `translate(${scrollY * 0.03}px, -${scrollY * 0.03}px)` }}
        />
        <div className="absolute bottom-0 left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-100/30 blur-[80px]" />
      </div>

      {/* Floating Modern Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl bg-white/90 border border-blue-100 shadow-lg shadow-blue-100/50 backdrop-blur-lg">

          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToPortal}
              className="p-2 hover:bg-blue-50 rounded-xl text-slate-500 hover:text-blue-700 transition-all text-xs font-bold flex items-center gap-1 shrink-0"
              title="Kembali ke Portal Utama"
            >
              <X size={15} /> <span className="hidden sm:inline">Portal</span>
            </button>
            <div className="h-5 w-[1px] bg-blue-100 shrink-0" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
                <Activity size={18} className="text-white font-black" />
              </div>
              <div className="hidden xs:block">
                <span className="font-bold text-slate-800 tracking-wider text-xs block">{portalName}</span>
                <span className="text-[8px] text-blue-500 font-mono block leading-none uppercase">DellCare Sultra</span>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-blue-50/80 p-1 rounded-xl border border-blue-100 shrink-0">
            <button
              onClick={() => setCurrentTab('personal')}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center gap-2.5 ${currentTab === 'personal' ? 'bg-gradient-to-r from-blue-600 to-pink-500 text-white shadow-md shadow-indigo-500/25' : 'text-slate-500 hover:text-blue-700'}`}
            >
              <User size={13} /> Laporan Personal
            </button>
            <button
              onClick={() => setCurrentTab('provincial')}
              className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center gap-2.5 ${currentTab === 'provincial' ? 'bg-gradient-to-r from-blue-600 to-pink-500 text-white shadow-md shadow-indigo-500/25' : 'text-slate-500 hover:text-blue-700'}`}
            >
              <Building2 size={13} /> {isKabkoRoute ? 'Analisis Kabkota' : 'Analisis Provinsi'}
            </button>
            {isKabkoRoute && (
              <button
                onClick={() => setCurrentTab('satker')}
                className={`px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center gap-2.5 ${currentTab === 'satker' ? 'bg-gradient-to-r from-blue-600 to-pink-500 text-white shadow-md shadow-indigo-500/25' : 'text-slate-500 hover:text-blue-700'}`}
              >
                <Building2 size={13} /> Analisis Per Kabkota
              </button>
            )}
          </nav>

        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 min-h-screen relative z-10">

        {(() => {
          if (currentTab === 'personal') {
            return (
              /* TAB 1: PERSONAL REPORT */
              <>
                {/* Hero Section & Search Input */}
                <section className="relative flex flex-col items-center justify-center text-center px-6 pt-12 pb-16">
                  <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-blue-700">Personal Health Analytics</span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-500 bg-clip-text text-transparent italic leading-tight uppercase">
                    Laporan {isKabkoRoute ? 'Kabkota' : 'Provinsi'}.
                  </h1>

                  <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto font-light mb-8">
                    Cari nama pegawai {isKabkoRoute ? 'BPS Kabupaten/Kota' : 'BPS Provinsi Sultra'} untuk memuat hasil survei ergonomi personal.
                  </p>

                  {/* Search Box */}
                  <div className="w-full max-w-lg relative" ref={suggestionsRef}>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-blue-500/8 rounded-2xl blur-md group-hover:bg-blue-500/12 transition-all pointer-events-none" />
                      <div className="relative flex items-center bg-white border border-blue-100 rounded-2xl p-1 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-blue-100/60 transition-all shadow-sm">
                        <Search className="text-blue-400 ml-4 mr-2" size={18} />
                        <input
                          type="text"
                          placeholder="Ketik nama pegawai..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          className="w-full bg-transparent border-none outline-none py-3 pr-4 text-sm text-slate-800 placeholder-slate-400"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setShowSuggestions(false);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all mr-1"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-blue-100 shadow-2xl shadow-blue-100/60 max-h-80 overflow-y-auto z-40 text-left divide-y divide-blue-50">
                        {filteredSuggestions.length > 0 ? (
                          filteredSuggestions.map((emp, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setSearchQuery(emp.nama);
                                setShowSuggestions(false);
                              }}
                              className="w-full px-5 py-3.5 hover:bg-blue-50 flex items-center justify-between transition-all group"
                            >
                              <div>
                                <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{emp.nama}</div>
                                <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                                  {isKabkoRoute ? emp.satker : emp.bagian} &bull; {emp.usia}
                                </div>
                              </div>
                              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${emp.rosa_category === 'Risiko Tinggi' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                {emp.rosa_category}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-5 py-4 text-xs text-slate-400 text-center font-mono">
                            Tidak ada pegawai dengan nama "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {selectedEmployee ? (
                  /* INDIVIDUAL ERGONOMIC REPORT CONTENT */
                  <>
                    {/* Employee Info Header */}
                    <section className="relative z-10 max-w-5xl mx-auto px-6 mb-8">
                      <div className="p-6 md:p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/50 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                            <User size={32} className="text-white" />
                          </div>
                          <div className="text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{selectedEmployee.nama}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 font-mono uppercase">
                                {isKabkoRoute ? selectedEmployee.satker : `Bagian: ${selectedEmployee.bagian}`}
                              </span>
                              {isKabkoRoute && (
                                <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 font-mono">
                                  Bagian: {selectedEmployee.bagian}
                                </span>
                              )}
                              <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-sky-700">
                                {selectedEmployee.gender}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-xs text-sky-700">
                                {selectedEmployee.usia}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="h-[1px] md:h-auto w-full md:w-[1px] bg-blue-100" />
                        <div className="grid grid-cols-2 gap-4 shrink-0 text-center md:text-left">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Lama Bekerja</div>
                            <div className="text-base font-bold text-slate-800 mt-0.5">{selectedEmployee.lama_bekerja}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Durasi Kerja</div>
                            <div className="text-base font-bold text-slate-800 mt-0.5">{selectedEmployee.durasi_kerja} / Hari</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* NBM & ROSA score summaries */}
                    <section className="relative z-10 max-w-5xl mx-auto px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Nordic Body Map Score Card */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100 hover:border-emerald-300 shadow-md shadow-emerald-100/40 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_10px_30px_rgba(16,185,129,0.08)] transition-all duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-100/50 transition-all" />
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold mb-1 text-slate-900">Tingkat Keluhan</h3>
                              <p className="text-xs text-slate-500 font-medium">Berdasarkan skor Nordic Body Map</p>
                            </div>
                            <ShieldCheck size={24} className="text-emerald-600" />
                          </div>

                          <div className="mt-8 flex items-end gap-3">
                            <div className="text-6xl font-black text-emerald-600">{selectedEmployee.nbm_score}</div>
                            <div className="pb-1.5">
                              <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70">Total Skor</div>
                              <div className="text-lg font-bold text-slate-800 leading-tight">({selectedEmployee.nbm_category})</div>
                            </div>
                          </div>

                          <p className="mt-6 p-4 rounded-xl bg-white border border-emerald-100/60 text-slate-600 italic text-xs leading-relaxed">
                            Skor NBM diperoleh dari evaluasi subjektif rasa sakit/kaku pada 28 bagian tubuh yang dialami oleh pegawai selama beraktivitas.
                          </p>
                        </div>

                        {/* ROSA Score Card */}
                        <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-50/60 to-white border border-rose-100 hover:border-rose-300 shadow-md shadow-rose-100/40 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_10px_30px_rgba(244,63,94,0.08)] transition-all duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/30 rounded-full blur-xl pointer-events-none group-hover:bg-rose-100/50 transition-all" />
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold mb-1 text-slate-900">Level Risiko</h3>
                              <p className="text-xs text-slate-500 font-medium">Berdasarkan skor Rapid Office Strain Assessment</p>
                            </div>
                            <ShieldCheck size={24} className={selectedEmployee.rosa_score >= 5 ? 'text-rose-600' : 'text-amber-500'} />
                          </div>

                          <div className="mt-8 flex items-end gap-3">
                            <div className={`text-6xl font-black ${selectedEmployee.rosa_score >= 5 ? 'text-rose-600' : 'text-amber-600'}`}>
                              {selectedEmployee.rosa_score}
                            </div>
                            <div className="pb-1.5">
                              <div className={`text-[9px] font-bold uppercase tracking-widest ${selectedEmployee.rosa_score >= 5 ? 'text-rose-600/70' : 'text-amber-600/70'}`}>Total Skor ROSA</div>
                              <div className="text-lg font-bold text-slate-800 leading-tight">({selectedEmployee.rosa_category})</div>
                            </div>
                          </div>

                          <p className="mt-6 p-4 rounded-xl bg-white border border-rose-100/60 text-slate-600 italic text-xs leading-relaxed">
                            Skor ROSA ≥ 5 menunjukkan lingkungan kerja Anda tidak aman dan memiliki risiko ergonomi tinggi. Dibutuhkan intervensi/perubahan fasilitas segera.
                          </p>
                        </div>

                      </div>
                    </section>

                    {/* Radar Chart & Major Pain Groups — VIBRANT BLUE SECTION */}
                    <section className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[3rem] p-8 md:p-12 overflow-hidden relative shadow-2xl shadow-blue-800/30">
                        {/* Decorative orbs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                          <div className="lg:col-span-7">
                            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-cyan-300 text-[10px] font-bold tracking-widest uppercase">
                              <BarChart3 size={12} /> Peta Distribusi Keluhan
                            </div>
                            <h3 className="text-3xl font-bold mb-4 tracking-tight text-white">Kondisi Area Tubuh</h3>
                            <p className="text-blue-200 mb-8 leading-relaxed text-sm">
                              Berdasarkan pengelompokan 28 titik Nordic Body Map ke dalam 5 bagian utama tubuh untuk mendeteksi area paling rentan mengalami cedera.
                            </p>

                            <div className="space-y-4">
                              {groupedPain.map((item, idx) => (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-white flex items-center gap-1.5">
                                      <span>{item.icon}</span> {item.area}
                                    </span>
                                    <span className={`font-semibold ${item.score === 3 ? 'text-rose-300' : item.score === 2 ? 'text-amber-300' : item.score === 1 ? 'text-yellow-300' : 'text-blue-300'}`}>
                                      {item.level} ({item.score}/3)
                                    </span>
                                  </div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full bg-gradient-to-r ${item.score === 3 ? 'from-rose-500 to-rose-400' : item.score === 2 ? 'from-amber-400 to-amber-300' : item.score === 1 ? 'from-yellow-400 to-yellow-200' : 'from-blue-400 to-blue-300'}`}
                                      style={{ width: `${(item.score / maxScore) * 100}%`, transition: 'width 1.5s ease-out' }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="lg:col-span-5 flex justify-center">
                            {/* Radar Chart SVG */}
                            <div className="relative">
                              <svg width="280" height="280" viewBox="0 0 300 300" className="drop-shadow-[0_0_25px_rgba(125,211,252,0.25)]">
                                {/* Background Circles */}
                                {[0.33, 0.66, 1].map((step, i) => (
                                  <circle
                                    key={i}
                                    cx={center}
                                    cy={center}
                                    r={radius * step}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.15)"
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
                                      stroke="rgba(255,255,255,0.15)"
                                    />
                                  );
                                })}
                                {/* Data Path */}
                                {radarPath && (
                                  <path
                                    d={radarPath}
                                    fill="rgba(125,211,252,0.25)"
                                    stroke="#7dd3fc"
                                    strokeWidth="2.5"
                                    className="transition-all duration-1000"
                                  />
                                )}
                                {/* Points */}
                                {radarScores.map((score, i) => {
                                  const p = getPoint(score, i, radarScores.length);
                                  return (
                                    <circle
                                      key={i}
                                      cx={p.x}
                                      cy={p.y}
                                      r="5"
                                      fill="#38bdf8"
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                  );
                                })}
                                {/* Labels */}
                                {radarLabels.map((label, i) => {
                                  const p = getPoint(maxScore + 0.35, i, radarLabels.length);
                                  return (
                                    <text
                                      key={i}
                                      x={p.x}
                                      y={p.y}
                                      fill="rgba(255,255,255,0.75)"
                                      fontSize="9"
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
                      </div>
                    </section>

                    {/* Nordic Body Map 28-point details — DEEP VIBRANT SECTION */}
                    <section className="relative z-10 max-w-5xl mx-auto px-6 py-4">
                      <div className="p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-950 border border-blue-800/50 shadow-xl shadow-indigo-950/40">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                          <div>
                            <h3 className="text-2xl font-bold text-white">Rincian 28 Titik Keluhan Tubuh (NBM)</h3>
                            <p className="text-xs text-blue-300 mt-1">Status dan detail rasa sakit pada setiap area yang dipetakan secara objektif.</p>
                          </div>

                          <button
                            onClick={() => setShowOnlyPained(!showOnlyPained)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showOnlyPained ? 'bg-sky-400 text-blue-900 border-sky-400' : 'bg-transparent text-blue-200 border-white/20 hover:text-white hover:border-white/40'}`}
                          >
                            {showOnlyPained ? "Tampilkan Semua Titik" : "Tampilkan Titik Sakit Saja"}
                          </button>
                        </div>

                        {activePainPoints.length === 0 ? (
                          <div className="p-10 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col items-center gap-3">
                            <CheckCircle2 size={40} className="text-cyan-400" />
                            <h4 className="text-lg font-bold text-cyan-300">Kondisi Tubuh Sempurna</h4>
                            <p className="text-xs text-blue-300 max-w-md">Luar biasa! Pegawai tidak melaporkan adanya keluhan rasa sakit atau kaku pada 28 bagian tubuh. Pertahankan postur kerja Anda.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedEmployee.titik_sakit
                              .filter(t => !showOnlyPained || t.score > 0)
                              .map((item, idx) => {
                                let badgeStyle = "bg-white/10 text-blue-200 border-white/10";
                                if (item.score === 1) badgeStyle = "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
                                else if (item.score === 2) badgeStyle = "bg-amber-500/15 text-amber-300 border-amber-500/30";
                                else if (item.score === 3) badgeStyle = "bg-rose-500/15 text-rose-300 border-rose-500/30";

                                return (
                                  <div
                                    key={idx}
                                    className={`p-4 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-between gap-3 ${item.score > 0 ? 'hover:border-sky-400/30 transition-all' : ''}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">{item.icon}</span>
                                      <div>
                                        <div className="text-xs font-bold text-white">{item.area}</div>
                                        <div className="text-[10px] text-blue-300 font-mono mt-0.5">NBM #{idx}</div>
                                      </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border shrink-0 ${badgeStyle}`}>
                                      {item.level}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Major Workstation Setup Issues & Solutions */}
                    <section className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                      <div className="p-8 md:p-12 bg-gradient-to-br from-blue-50 via-white to-sky-50 rounded-[4rem] border border-blue-100 shadow-md shadow-blue-100/50">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                            <Monitor className="text-white" size={20} />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900">Faktor Risiko Workstation & Solusi</h3>
                        </div>

                        {selectedEmployee.masalah_utama && selectedEmployee.masalah_utama.length > 0 ? (
                          <div className="space-y-4">
                            {selectedEmployee.masalah_utama.map((item, idx) => (
                              <div key={idx} className="group grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-6 rounded-3xl bg-white border border-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/60 transition-all">
                                <div className="md:col-span-1 flex justify-center">
                                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                    {getIconComponent(item.icon)}
                                  </div>
                                </div>
                                <div className="md:col-span-6">
                                  <h4 className="text-lg font-bold mb-1 text-slate-900 group-hover:text-blue-700 transition-colors">{item.title}</h4>
                                  <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <div className="md:col-span-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                  <div className="text-[9px] uppercase font-bold text-rose-500 mb-1">Dampak Kesehatan</div>
                                  <div className="text-xs font-medium text-slate-700 leading-snug">{item.impact}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-3xl bg-white border border-blue-100 text-center text-slate-500 text-xs">
                            Tidak ada faktor risiko tinggi terdeteksi dari tata letak ruang kerja Anda.
                          </div>
                        )}

                        <div className="mt-8 p-5 bg-white border border-blue-100 rounded-2xl shadow-sm">
                          <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-blue-600" /> Tips Ergonomi Umum Harian
                          </h4>
                          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                            <li>Lakukan peregangan otot (stretching) selama 2 menit setiap 2 jam bekerja.</li>
                            <li>Atur posisi duduk agar siku membentuk sudut 90 derajat sejajar permukaan meja.</li>
                            <li>Gunakan bantal penyangga pinggang tambahan di kursi jika posisi kursi terlalu merebah.</li>
                          </ul>
                        </div>
                      </div>
                    </section>
                  </>
                ) : (
                  /* NO EMPLOYEE SELECTED (WELCOME STATE) */
                  <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
                    <div className="p-12 rounded-[3rem] bg-white border border-blue-100 shadow-lg shadow-blue-100/50">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mx-auto mb-6 border border-blue-200">
                        <User size={40} className="text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-slate-900">Cari Nama Pegawai</h3>
                      <p className="text-slate-500 max-w-md mx-auto text-sm">
                        Gunakan kolom pencarian di atas untuk memasukkan nama pegawai {isKabkoRoute ? 'BPS Kabupaten/Kota' : 'BPS Provinsi Sultra'} dan membuka laporan ergonomi detailnya.
                      </p>
                    </div>
                  </section>
                )}
              </>
            );
          } else if (currentTab === 'provincial') {
            return (
              /* TAB 2: AGGREGATE DASHBOARD VIEW (PROVINSI or KABKO) */
              <section className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">

                {/* Header */}
                <div className="text-center md:text-left mb-10">
                  <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                    <Building2 size={12} /> {isKabkoRoute ? 'Analisis Tingkat Kabupaten/Kota' : 'Analisis Tingkat Provinsi'}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-500 bg-clip-text text-transparent uppercase font-black">
                    DASHBOARD ERGONOMI {isKabkoRoute ? 'KABKOTA' : 'PROVINSI'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Analisis statistik komparatif dan pemetaan risiko ergonomi untuk seluruh pegawai {isKabkoRoute ? 'BPS Kabupaten/Kota se-Sulawesi Tenggara' : 'BPS Provinsi Sulawesi Tenggara'}.
                  </p>
                </div>

                {/* Executive Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                  {/* Card 1: Total Employees */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-md shadow-blue-100/50 flex items-center justify-between hover:shadow-lg hover:border-blue-200 transition-all">
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Responden Diuji</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">{totalEmployees} <span className="text-xs text-slate-500 font-normal">Pegawai</span></div>
                      <div className="text-[10px] text-blue-600 font-mono mt-1">100% Data Valid</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/30">
                      <Users size={20} />
                    </div>
                  </div>

                  {/* Card 2: Average NBM Score */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-md shadow-sky-100/50 flex items-center justify-between hover:shadow-lg hover:border-sky-200 transition-all">
                    <div>
                      <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Rerata Skor NBM</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">{data.statistics.avg_nbm}</div>
                      <div className="text-[10px] text-sky-600 font-mono mt-1">Kategori Keluhan Ringan</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-sky-500/30">
                      <Activity size={20} />
                    </div>
                  </div>

                  {/* Card 3: Average ROSA Score */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-md shadow-amber-100/50 flex items-center justify-between hover:shadow-lg hover:border-amber-200 transition-all">
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Rerata Skor ROSA</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">{data.statistics.avg_rosa}</div>
                      <div className="text-[10px] text-rose-500 font-mono mt-1">Kategori Risiko Tinggi</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/30">
                      <AlertTriangle size={20} />
                    </div>
                  </div>

                  {/* Card 4: High Risk Ratio */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 shadow-md shadow-rose-100/50 flex items-center justify-between hover:shadow-lg hover:border-rose-200 transition-all">
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Rasio Risiko Tinggi</div>
                      <div className="text-3xl font-black text-rose-600 mt-1">{highRiskPercentage}%</div>
                      <div className="text-[10px] text-slate-500 mt-1">{totalHighRisk} Pegawai Berisiko</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/30">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                </div>

                {/* Distributions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                  {/* NBM Categories */}
                  <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Activity size={14} className="text-blue-600" />
                      </div>
                      Distribusi Kategori Keluhan NBM
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(data.statistics.nbm_categories).map(([cat, count], idx) => {
                        const percentage = ((count / totalEmployees) * 100).toFixed(1);
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{cat}</span>
                              <span className="text-blue-600">{count} Pegawai ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden border border-blue-100">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ROSA Categories */}
                  <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                        <Monitor size={14} className="text-rose-500" />
                      </div>
                      Distribusi Kategori Risiko ROSA
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(data.statistics.rosa_categories).map(([cat, count], idx) => {
                        const percentage = ((count / totalEmployees) * 100).toFixed(1);
                        const isHigh = cat.toLowerCase().includes('tinggi');
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{cat}</span>
                              <span className={`${isHigh ? 'text-rose-600' : 'text-amber-600'}`}>{count} Pegawai ({percentage}%)</span>
                            </div>
                            <div className="h-2.5 bg-rose-50 rounded-full overflow-hidden border border-rose-100">
                              <div
                                className={`h-full rounded-full ${isHigh ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-amber-400 to-amber-300'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Satker Comparison Table (KABKO Route Only) */}
                {isKabkoRoute && data.statistics.satker_stats && data.statistics.satker_stats.length > 0 && (
                  <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800 mb-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 size={14} className="text-blue-600" />
                      </div>
                      Profil Risiko Ergonomi per Kabupaten/Kota
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">Peta kerentanan ergonomi tiap kantor BPS Kabupaten/Kota yang diurutkan berdasarkan rerata skor ROSA (Kondisi workstation).</p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-blue-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <th className="pb-3 pr-4">Satuan Kerja (Satker)</th>
                            <th className="pb-3 px-4">Jumlah Pegawai</th>
                            <th className="pb-3 px-4">Rerata NBM</th>
                            <th className="pb-3 px-4">Rerata ROSA</th>
                            <th className="pb-3 pl-4 text-right">Tingkat Risiko Rata-rata</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50 text-sm">
                          {data.statistics.satker_stats.map((item, idx) => {
                            const isHighRisk = item.avg_rosa >= 5.0;
                            return (
                              <tr key={idx} className="hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => {
                                setSelectedSatker(item.satker);
                                setCurrentTab('satker');
                              }}>
                                <td className="py-4 pr-4 font-bold text-slate-900 hover:text-blue-700 transition-colors">{item.satker}</td>
                                <td className="py-4 px-4 font-mono text-slate-600">{item.count} orang</td>
                                <td className="py-4 px-4 font-mono text-slate-600">{item.avg_nbm}</td>
                                <td className="py-4 px-4 font-mono text-slate-600">{item.avg_rosa}</td>
                                <td className="py-4 pl-4 text-right">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${isHighRisk ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                    {isHighRisk ? 'Risiko Tinggi' : 'Risiko Sedang'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pain Areas & Risk Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                  {/* Pain Areas */}
                  <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                        <Thermometer size={14} className="text-sky-600" />
                      </div>
                      Area Keluhan Tubuh Terbanyak (NBM)
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">Persentase pegawai yang merasakan keluhan (Agak Sakit / Sakit / Sangat Sakit) pada bagian tubuh tertentu.</p>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {data.statistics.body_pain_stats.slice(0, 8).map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700">#{idx + 1} {item.area}</span>
                            <span className="text-blue-600 font-mono font-bold">{item.percentage}%</span>
                          </div>
                          <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 text-right font-mono">
                            {item.total_pained} dari {totalEmployees} pegawai &bull; {item.sakit + item.sangat_sakit} keluhan berat
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                        <Zap size={14} className="text-rose-500" />
                      </div>
                      Faktor Bahaya Ergonomi Terbesar (ROSA)
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">Persentase ketidaksesuaian fasilitas atau tata letak workstation pegawai yang terdeteksi bermasalah.</p>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {data.statistics.risk_factor_stats.slice(0, 8).map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-slate-700">#{idx + 1} {item.factor}</span>
                            <span className="text-rose-600 font-mono font-bold">{item.percentage}%</span>
                          </div>
                          <div className="h-2 bg-rose-50/50 rounded-full overflow-hidden border border-rose-100/50">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 text-right font-mono">
                            Mempengaruhi {item.count} dari {totalEmployees} pegawai
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Department Comparison Table */}
                <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800 mb-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 size={14} className="text-blue-600" />
                    </div>
                    Perbandingan Risiko Ergonomi per Bagian Kerja
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Peta kerentanan ergonomi tiap divisi/bagian kerja (Umum, Nerwilis, IPDS, Sosial, dsb) diurutkan berdasarkan rerata skor ROSA.</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-blue-100 text-slate-500 text-xs uppercase font-bold tracking-wider">
                          <th className="pb-3 pr-4">Nama Bagian</th>
                          <th className="pb-3 px-4">Jumlah Pegawai</th>
                          <th className="pb-3 px-4">Rerata Skor NBM</th>
                          <th className="pb-3 px-4">Rerata Skor ROSA</th>
                          <th className="pb-3 pl-4 text-right">Tingkat Risiko Workstation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50 text-sm">
                        {data.statistics.department_stats.map((dept, idx) => {
                          const isHighRisk = dept.avg_rosa >= 5.0;
                          return (
                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                              <td className="py-4 pr-4 font-bold text-slate-900">{dept.bagian}</td>
                              <td className="py-4 px-4 font-mono text-slate-600">{dept.count} orang</td>
                              <td className="py-4 px-4 font-mono text-slate-600">{dept.avg_nbm}</td>
                              <td className="py-4 px-4 font-mono text-slate-600">{dept.avg_rosa}</td>
                              <td className="py-4 pl-4 text-right">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${isHighRisk ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                  {isHighRisk ? 'Risiko Tinggi' : 'Risiko Sedang'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-8 md:p-12 bg-gradient-to-br from-blue-50 via-white to-sky-50 border border-blue-100 shadow-md shadow-blue-100/40 rounded-[4rem] text-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                      <ShieldCheck className="text-white" size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Rekomendasi Kebijakan Mitigasi Ergonomi</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                    Berdasarkan data analisis ergonomi dari {totalEmployees} responden pegawai se-Sulawesi Tenggara, berikut adalah langkah mitigasi yang disarankan untuk jajaran pimpinan:
                  </p>

                  <div className="space-y-6">
                    {/* Recommendation 1: Kursi */}
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-blue-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                        <Armchair size={18} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">Standarisasi Kursi Ergonomis Kerja</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Sebesar **{data.statistics.risk_factor_stats.find(r => r.factor.includes("Kursi"))?.percentage || "80"}%** pegawai memiliki kursi yang ketinggiannya statis. Direkomendasikan pengadaan kursi dengan tuas hidrolik penyesuai tinggi serta sandaran tangan yang bisa diatur untuk menyelaraskan postur siku-bahu.
                        </p>
                      </div>
                    </div>

                    {/* Recommendation 2: Monitor */}
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-blue-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                        <Monitor size={18} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">Penyesuaian Ketinggian Monitor Layar</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Lebih dari **50%** pegawai mengalami keluhan nyeri leher akibat letak monitor yang terlampau rendah. Disarankan penyediaan stand monitor tambahan atau melatih pegawai mengatur sudut kemiringan monitor agar sejajar mata.
                        </p>
                      </div>
                    </div>

                    {/* Recommendation 3: Peregangan */}
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-blue-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200 flex items-center justify-center text-cyan-600 shrink-0">
                        <Activity size={18} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">Implementasi Stretching Massal Terjadwal</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Keluhan tertinggi terdeteksi pada area **{data.statistics.body_pain_stats[0]?.area || "Pinggang / Punggung Bawah"} ({data.statistics.body_pain_stats[0]?.percentage || "75"}%)** karena durasi duduk tanpa jeda. Manajemen perlu menerapkan pengingat peregangan massal di seluruh unit kerja setiap pukul 10:00 dan 14:00 WITA.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </section>
            );
          } else if (currentTab === 'satker') {
            /* TAB 3: REGENCY SPECIFIC DASHBOARD VIEW */
            const satkerEmployees = data.employees.filter(e => e.satker === selectedSatker);
            const totalSatkerEmployees = satkerEmployees.length;
            const avgSatkerNbm = totalSatkerEmployees > 0
              ? (satkerEmployees.reduce((sum, e) => sum + e.nbm_score, 0) / totalSatkerEmployees).toFixed(1)
              : 0;
            const avgSatkerRosa = totalSatkerEmployees > 0
              ? (satkerEmployees.reduce((sum, e) => sum + e.rosa_score, 0) / totalSatkerEmployees).toFixed(1)
              : 0;
            const satkerHighRiskCount = satkerEmployees.filter(e => e.rosa_score >= 5).length;
            const satkerHighRiskPercentage = totalSatkerEmployees > 0
              ? ((satkerHighRiskCount / totalSatkerEmployees) * 100).toFixed(1)
              : "0.0";

            const satkerPainStats = getSatkerPainStats(satkerEmployees);
            const satkerRiskStats = getSatkerRiskStats(satkerEmployees);
            const uniqueSatkers = Array.from(new Set(data.employees.map(e => e.satker))).sort();

            return (
              <section className="max-w-6xl mx-auto px-6 py-8 animate-fade-in">

                {/* Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-blue-100">
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                      <Building2 size={12} /> Analisis Per Kabupaten/Kota
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">ANALISIS DETAIL KABKOTA</h2>
                    <p className="text-xs text-slate-500 mt-1">Pilih satuan kerja di bawah ini untuk meninjau peta keluhan & risiko ergonomi setempat secara khusus.</p>
                  </div>

                  <div className="relative min-w-[280px] self-center">
                    <select
                      value={selectedSatker}
                      onChange={(e) => setSelectedSatker(e.target.value)}
                      className="w-full bg-white border border-blue-200 text-slate-800 rounded-2xl px-5 py-3.5 outline-none shadow-sm text-sm font-semibold appearance-none cursor-pointer focus:border-blue-500 focus:shadow-md transition-all pr-10"
                    >
                      {uniqueSatkers.map((satker, i) => (
                        <option key={i} value={satker} className="bg-white text-slate-800">
                          {satker}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Satker Executive Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 shadow-md transition-all duration-300 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Pegawai Diuji</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">{totalSatkerEmployees} <span className="text-xs text-slate-500 font-normal">Orang</span></div>
                      <div className="text-[10px] text-blue-600 font-mono mt-1 font-semibold">BPS di Wilayah Terkait</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/30">
                      <Users size={20} />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 shadow-md transition-all duration-300 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Rerata Skor NBM</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">{avgSatkerNbm}</div>
                      <div className="text-[10px] text-emerald-600 font-mono mt-1 font-semibold">Tingkat Keluhan Satker</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/30">
                      <Activity size={20} />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100/50 shadow-md transition-all duration-300 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Rerata Skor ROSA</div>
                      <div className="text-3xl font-black text-slate-900 mt-1">{avgSatkerRosa}</div>
                      <div className="text-[10px] text-rose-600 font-mono mt-1 font-semibold">Bahaya Fasilitas Satker</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/30">
                      <AlertTriangle size={20} />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 shadow-md transition-all duration-300 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Rasio Risiko Tinggi</div>
                      <div className="text-3xl font-black text-rose-600 mt-1">{satkerHighRiskPercentage}%</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-semibold">{satkerHighRiskCount} Pegawai Kritis</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/30">
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                </div>

                {/* Specific Satker Stats details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Satker Pain Areas */}
                  <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                        <Thermometer size={14} className="text-sky-600" />
                      </div>
                      Keluhan Tubuh Terbanyak di Satker
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {satkerPainStats.length > 0 ? (
                        satkerPainStats.slice(0, 6).map((item, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-700">#{idx + 1} {item.area}</span>
                              <span className="text-blue-600 font-mono font-bold">{item.percentage}%</span>
                            </div>
                            <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-400 text-xs font-mono">
                          Tidak ada keluhan rasa sakit dilaporkan di satker ini.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Satker Risk Factors */}
                  <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                        <Zap size={14} className="text-rose-500" />
                      </div>
                      Faktor Bahaya Terbesar di Satker
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {satkerRiskStats.length > 0 ? (
                        satkerRiskStats.slice(0, 6).map((item, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-slate-700">#{idx + 1} {item.factor}</span>
                              <span className="text-rose-600 font-mono font-bold">{item.percentage}%</span>
                            </div>
                            <div className="h-2 bg-rose-50/50 rounded-full overflow-hidden border border-rose-100/50">
                              <div
                                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-400 text-xs font-mono">
                          Tidak ada faktor bahaya workstation terdeteksi di satker ini.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employees List in Satker */}
                <div className="p-8 rounded-[2rem] bg-white border border-blue-100 shadow-md shadow-blue-100/40 text-slate-800">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <User size={14} className="text-blue-600" />
                    </div>
                    Daftar Pegawai di {selectedSatker}
                  </h3>

                  {satkerEmployees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {satkerEmployees.map((emp, i) => {
                        const isHighRisk = emp.rosa_score >= 5;
                        return (
                          <div
                            key={i}
                            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/50 to-white border border-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/60 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <h4 className="text-base font-bold text-slate-900 mb-1">{emp.nama}</h4>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{emp.bagian} &bull; {emp.usia}</p>

                              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-blue-50">
                                <div>
                                  <span className="text-[9px] text-blue-400 uppercase block">NBM Score</span>
                                  <span className="text-xs font-bold text-blue-700">{emp.nbm_score} ({emp.nbm_category})</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-blue-400 uppercase block">ROSA Score</span>
                                  <span className={`text-xs font-bold ${isHighRisk ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {emp.rosa_score} ({emp.rosa_category})
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setSearchQuery(emp.nama);
                                setCurrentTab('personal');
                                setShowSuggestions(false);
                              }}
                              className="mt-6 w-full py-2 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-bold text-blue-600 transition-all flex items-center justify-center gap-2 border border-blue-100 hover:border-blue-600 hover:shadow-md hover:shadow-blue-500/30"
                            >
                              Buka Laporan Personal <ArrowRight size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500 text-xs font-mono">
                      Tidak ada pegawai terdaftar di satker ini.
                    </div>
                  )}
                </div>

              </section>
            );
          }
          return null;
        })()}

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center text-slate-500 text-xs border-t border-blue-100 mt-12 bg-white/60 backdrop-blur-sm">
        <p>Laporan ini dihasilkan secara otomatis menggunakan Data-Driven Ergonomic Analysis v2.0</p>
        <p className="mt-2 tracking-widest uppercase text-blue-400">Badan Pusat Statistik Sulawesi Tenggara &copy; 2026</p>
        <p className="mt-2 text-slate-400 text-[10px] font-mono">Prov Sultra - Proker Analisis Kesehatan Masyarakat Magang Hub Batch 3 BPS Provinsi Sultra - Delima Yulia Hartati S.KM</p>
      </footer>

    </div>
  );
};

export default App;