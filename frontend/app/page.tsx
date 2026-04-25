// app/page.tsx
import VisionTracker from './components/VisionTracker' // <-- Tambahkan baris ini

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none pt-0.5">V</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800">VISEA</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
            Mode Pendamping
          </span>
          <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-sm" />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Kamera & Tracking */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-semibold text-slate-700">Pemantauan Visual</h2>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            
            {/* Implementasi VisionTracker di sini */}
            <div className="flex-1 relative bg-slate-900">
              <VisionTracker />
            </div>

          </div>
        </section>

        {/* Kolom Kanan: AI Feedback (HAC-11) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 min-h-[500px] flex flex-col">
            <h2 className="font-semibold text-slate-700 mb-4">Instruksi Cerdas AI</h2>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center mt-auto mb-auto">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-slate-800 font-medium mb-1">Menunggu Data Visual...</h3>
              <p className="text-sm text-slate-500">
                Sistem akan memberikan saran penyesuaian materi saat sesi belajar dimulai.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}