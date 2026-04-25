// app/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  RefreshCcw, 
  BookOpenCheck, 
  ShieldCheck, 
  Globe2,
  Activity,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      
      {/* Transparent Glass Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-white/70 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
              <span className="text-white font-bold text-xl tracking-tighter">V</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">VISEA</span>
          </div>

          {/* Center Navigation Menus */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-slate-600">
            <a href="#analisis" className="hover:text-blue-600 transition-colors">Analisis Visual</a>
            <a href="#kurikulum" className="hover:text-blue-600 transition-colors">Kurikulum Dinamis</a>
            <a href="#feedback" className="hover:text-blue-600 transition-colors">Feedback Loop</a>
            <a href="#dampak" className="hover:text-blue-600 transition-colors">Dampak</a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => openAuth('login')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              Masuk
            </button>
            <button 
              onClick={() => openAuth('register')}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
            >
              Daftar
            </button>
          </div>

        </div>
      </nav>

      {/* Hero Section (Simplified) */}
      <section className="relative pt-44 pb-24 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Pendidikan Inklusif, <br/>Kini Hadir di Rumah.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            VISEA mendampingi orang tua dengan Kecerdasan Buatan untuk menciptakan pengalaman belajar yang tepat sasaran bagi anak berkebutuhan khusus.
          </p>
          <button 
            onClick={() => openAuth('register')}
            className="px-8 py-3.5 bg-slate-900 text-white text-base font-semibold rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1"
          >
            Mulai Perjalanan Belajar
          </button>
        </div>
        
        {/* Abstract Background Ornaments */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-60 -z-10"></div>
      </section>

      {/* Interactive Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Behavioral Analysis */}
          <div id="analisis" className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-default scroll-mt-24">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full transition-transform duration-700 group-hover:scale-[2.5] ease-out -z-10"></div>
            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Analisis Perilaku Real-time</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Mendeteksi pose, pelacakan arah mata, dan ekspresi mikro anak untuk menghitung Skor Keterlibatan secara langsung melalui kamera peranti Anda.
            </p>
          </div>

          {/* Card 2: RAG Curriculum */}
          <div id="kurikulum" className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-default scroll-mt-24">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-50 rounded-full transition-transform duration-700 group-hover:scale-[2.5] ease-out -z-10"></div>
            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
              <BookOpenCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Modul Spesifik SLB</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Model Kecerdasan Buatan kami hanya mengambil referensi dari Standar Pendidikan Khusus medis yang valid, menyesuaikan dengan kebutuhan khusus setiap anak.
            </p>
          </div>

          {/* Card 3: Feedback Loop */}
          <div id="feedback" className="group relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-default scroll-mt-24">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-teal-50 rounded-full transition-transform duration-700 group-hover:scale-[2.5] ease-out -z-10"></div>
            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
              <RefreshCcw className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Sistem Feedback Dinamis</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Jika anak mengalami beban sensorik, sistem otomatis menginstruksikan orang tua untuk mengubah metode, seperti beralih dari teks ke media visual.
            </p>
          </div>

        </div>
      </section>

      {/* Impact Section (No SDG mentions) */}
      <section id="dampak" className="py-24 px-6 bg-slate-900 text-white mt-10 rounded-t-[3rem] scroll-mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                <ShieldCheck className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                Mengembalikan Kepercayaan Diri Orang Tua.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Tantangan terbesar dalam mendidik anak berkebutuhan khusus adalah keraguan. VISEA menghilangkan keraguan tersebut dengan membimbing langkah Anda berdasarkan respons nyata dari anak.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                <Activity className="w-8 h-8 text-emerald-400 mb-4" />
                <h4 className="font-bold text-lg mb-2">Interaksi Dua Arah</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Tidak hanya menyediakan materi pasif, sistem kami "melihat" dan mengajarkan Anda cara terbaik merespons kondisi emosional anak.
                </p>
              </div>
              
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
                <Globe2 className="w-8 h-8 text-sky-400 mb-4" />
                <h4 className="font-bold text-lg mb-2">Akses Tanpa Batas</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Menghapus hambatan geografis dan ekonomi bagi keluarga yang kesulitan mengakses fasilitas Sekolah Luar Biasa secara fisik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                <span className="text-white font-bold text-2xl tracking-tighter">V</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {authMode === 'login' ? 'Selamat Datang Kembali' : 'Mulai Bersama VISEA'}
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                {authMode === 'login' 
                  ? 'Masuk untuk melanjutkan sesi belajar anak Anda.' 
                  : 'Daftar sekarang dan wujudkan pendidikan yang adaptif.'}
              </p>

              {/* Google Auth Button */}
              <button 
                onClick={() => window.location.href = '/dashboard'} // Simulasi login
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                Lanjutkan dengan Google
              </button>

              <div className="text-center text-sm text-slate-500 mt-4">
                {authMode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {authMode === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}