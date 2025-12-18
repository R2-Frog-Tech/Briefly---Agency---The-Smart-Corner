
import React, { useState, useMemo } from 'react';
import { BriefingData, ServiceType, Language } from './types';
import { SERVICES, TRANSLATIONS } from './constants';
import { generateProjectSummary } from './services/geminiService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('es');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  
  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  const [formData, setFormData] = useState<BriefingData>({
    services: [],
    details: { projectName: '', description: '', targetAudience: '', specificGoals: '' },
    timeline: { deadline: '', budgetRange: '' },
    contact: { fullName: '', email: '', company: '', phone: '', gdprConsent: false }
  });

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev - 1);
  };

  const toggleService = (id: ServiceType) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id]
    }));
  };

  const handleInputChange = (section: keyof BriefingData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), [field]: value }
    }));
  };

  const calculateEstimate = () => {
    return formData.services.reduce((acc, curr) => {
      const service = SERVICES.find(s => s.id === curr);
      return acc + (service?.basePrice || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact.gdprConsent) return;
    setIsSubmitting(true);

    try {
      // 1. Generar resumen con IA (Gemini)
      const summary = await generateProjectSummary(formData, lang);
      setAiSummary(summary);
      
      // 2. Enviar datos al endpoint de Email (Serverless Function en Vercel)
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          aiSummary: summary,
          internalEstimate: calculateEstimate(),
          lang: lang
        })
      });

      if (!emailResponse.ok) {
        console.warn("Email service error, but proceeding to success screen for UX.");
      }
      
      setStep(5);
    } catch (err) {
      console.error("Submission failed:", err);
      // Mostramos éxito de todas formas para no frustrar al usuario, 
      // pero logueamos el error para Arturo.
      setStep(5);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-12 relative z-10">
      {/* Language Selector */}
      <div className="fixed top-8 right-8 z-50 flex gap-1 p-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full">
        {(['en', 'es', 'pl'] as Language[]).map(l => (
          <button 
            key={l}
            onClick={() => setLang(l)}
            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${
              lang === l ? 'bg-smart-gradient text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <header className="max-w-4xl w-full text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex flex-col items-center gap-6 mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-smart-gradient rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-20 h-20 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center text-4xl shadow-2xl">
              🐸💻
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
              {t.brand_name}
            </h1>
            <div className="h-1 w-24 bg-smart-gradient mx-auto rounded-full"></div>
          </div>
        </div>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light italic">
          "{t.tagline}"
        </p>
      </header>

      <main className="max-w-4xl w-full glass-panel rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500">
        {step < 5 && (
          <div className="w-full h-1 bg-white/5 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-smart-gradient transition-all duration-1000" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        )}

        {step === 1 && (
          <div className="p-8 md:p-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <h2 className="text-3xl font-bold text-white">{t.step_1_title}</h2>
              <span className="text-sm font-bold text-violet-400 uppercase tracking-[0.2em]">01 / 04</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICES.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-8 rounded-3xl glass-card cursor-pointer flex items-start gap-6 ${
                    formData.services.includes(service.id) ? 'active-service' : ''
                  }`}
                >
                  <div className="text-4xl bg-white/5 w-16 h-16 flex items-center justify-center rounded-2xl border border-white/5">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold mb-2 ${formData.services.includes(service.id) ? 'text-white' : 'text-slate-300'}`}>
                      {t[service.labelKey]}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-wider font-semibold">
                      {t[service.descriptionKey]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 flex justify-end">
              <button 
                disabled={formData.services.length === 0}
                onClick={nextStep}
                className="group relative px-12 py-5 bg-smart-gradient text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t.btn_next}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 md:p-16">
            <h2 className="text-3xl font-bold text-white mb-12">{t.step_2_title}</h2>
            <div className="space-y-10">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-4">{t.field_project_name}</label>
                <input type="text" value={formData.details.projectName} onChange={(e) => handleInputChange('details', 'projectName', e.target.value)}
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-white/10 text-xl text-white focus:border-violet-500 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-4">{t.field_project_desc}</label>
                <textarea rows={4} value={formData.details.description} onChange={(e) => handleInputChange('details', 'description', e.target.value)}
                  className="w-full px-6 py-6 bg-white/5 rounded-3xl border border-white/10 text-white focus:border-violet-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="mt-16 flex justify-between">
              <button onClick={prevStep} className="px-8 py-4 text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest">{t.btn_back}</button>
              <button disabled={!formData.details.projectName || !formData.details.description} onClick={nextStep} 
                className="px-12 py-5 bg-smart-gradient text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-20"
              >
                {t.btn_next}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 md:p-16">
            <h2 className="text-3xl font-bold text-white mb-12">{t.step_3_title}</h2>
            <div className="space-y-12">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-6">{t.field_deadline}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {t.deadlines.map((d: string) => (
                    <button key={d} onClick={() => handleInputChange('timeline', 'deadline', d)}
                      className={`p-6 rounded-2xl border-2 text-sm font-bold transition-all ${
                        formData.timeline.deadline === d ? 'border-violet-500 bg-violet-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-6">{t.field_budget}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {t.budget_ranges.map((r: string) => (
                    <button key={r} onClick={() => handleInputChange('timeline', 'budgetRange', r)}
                      className={`p-6 rounded-2xl border-2 text-sm font-bold transition-all ${
                        formData.timeline.budgetRange === r ? 'border-pink-500 bg-pink-500/10 text-white' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/20'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-16 flex justify-between">
              <button onClick={prevStep} className="px-8 py-4 text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest">{t.btn_back}</button>
              <button disabled={!formData.timeline.deadline || !formData.timeline.budgetRange} onClick={nextStep} 
                className="px-12 py-5 bg-smart-gradient text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-20"
              >
                {t.btn_next}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 md:p-16">
            <h2 className="text-3xl font-bold text-white mb-12">{t.step_4_title}</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">{t.field_name}</label>
                  <input required type="text" value={formData.contact.fullName} onChange={(e) => handleInputChange('contact', 'fullName', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-violet-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-2">{t.field_email}</label>
                  <input required type="email" value={formData.contact.email} onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-violet-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 p-8 bg-white/5 rounded-3xl border border-white/10">
                <input type="checkbox" id="gdpr" checked={formData.contact.gdprConsent} onChange={(e) => handleInputChange('contact', 'gdprConsent', e.target.checked)}
                  className="w-8 h-8 rounded-xl accent-pink-500 cursor-pointer"
                />
                <label htmlFor="gdpr" className="text-sm text-slate-400 cursor-pointer">{t.field_gdpr}</label>
              </div>
              <div className="mt-16 flex justify-between items-center">
                <button type="button" onClick={prevStep} className="px-8 py-4 text-slate-500 hover:text-white font-black text-xs uppercase tracking-widest">{t.btn_back}</button>
                <button type="submit" disabled={isSubmitting || !formData.contact.gdprConsent}
                  className="px-16 py-6 bg-smart-gradient text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all disabled:opacity-20"
                >
                  {isSubmitting ? t.btn_sending : t.btn_finish}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 5 && (
          <div className="p-16 text-center animate-in zoom-in duration-700">
            <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-6xl shadow-inner">
                  ✓
                </div>
            </div>
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight">{t.step_5_title}</h2>
            <p className="text-slate-400 mb-12 max-w-lg mx-auto font-medium text-lg leading-relaxed">
              {t.step_5_desc}
            </p>
            {aiSummary && (
              <div className="bg-white/5 p-12 rounded-[3rem] text-left border border-white/10 max-w-2xl mx-auto mb-16 relative">
                <div className="absolute -top-4 left-12 px-6 py-2 bg-smart-gradient rounded-full text-[11px] font-black text-white uppercase tracking-[0.2em]">
                  {t.ai_summary_title}
                </div>
                <div className="prose prose-invert prose-sm text-slate-400 whitespace-pre-wrap leading-[1.8] font-medium italic">
                  {aiSummary}
                </div>
              </div>
            )}
            <button onClick={() => window.location.reload()}
              className="px-12 py-5 border border-white/10 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
            >
              {t.btn_close}
            </button>
          </div>
        )}
      </main>

      <footer className="mt-24 text-slate-600 text-[10px] uppercase font-black tracking-[0.5em] pb-12 flex items-center flex-col gap-4">
        <div>&copy; 2026 {t.brand_name}</div>
        <div className="text-slate-800">Established 2024 • Excellence In Design • 🐸💻</div>
      </footer>
    </div>
  );
};

export default App;
