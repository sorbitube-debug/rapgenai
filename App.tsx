
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Mic2, Sparkles, Disc, Zap, Volume2, Sliders, Hash, AlignJustify, Activity, 
  Gauge, BrainCircuit, Layers, Filter, Check, Info, HelpCircle, ChevronDown, 
  ChevronUp, Music, Layout, ThermometerSun, Brain, Loader2, Info as InfoIcon,
  Puzzle, Cloud, FolderOpen, Save, RefreshCw, MessageCircle
} from 'lucide-react';
import { generateRapLyrics } from './services/gemini';
import { telemetry } from './services/telemetry';
import { cloudStorage } from './services/cloudStorage';
import { RapStyle, RapLength, LyricResponse, RhymeScheme, RapTone, RhymeComplexity, CloudProject } from './types';
import { LyricCard } from './components/LyricCard';
import { PluginMarketplace } from './components/PluginMarketplace';

const STYLE_VARIATIONS: Record<RapStyle, string[]> = {
  [RapStyle.Gangsta]: ["دریل (Drill)", "ترپ (Trap)", "گنگستا اولد اسکول", "وست کوست (West Coast)", "دارک و خشن (Dark)", "هاردکور (Hardcore)"],
  [RapStyle.Emotional]: ["دیس لاو (Diss Love)", "آر اند بی (R&B)", "دل‌نوشته و غمگین", "عاشقانه (Romantic)", "ملودیک", "نامه (Letter)"],
  [RapStyle.Social]: ["اجتماعی سیاسی", "اعتراضی (Protest)", "داستان‌گویی (Storytelling)", "فقر و خیابان", "فلسفی و عمیق", "حقایق (Conscious)"],
  [RapStyle.Party]: ["کلاب و پارتی", "شیش و هشت (6/8)", "فان و طنز", "تراپ رقصی", "افرو (Afrobeat)", "بنگر (Banger)"],
  [RapStyle.Motivational]: ["ورزشی و باشگاه", "مسیر موفقیت", "جنگجو (Warrior)", "امیدبخش", "سرگذشت من", "قدرت و اراده"],
  [RapStyle.OldSchool]: ["بوم بپ (Boom Bap)", "کلاسیک دهه 80", "جی فانک (G-Funk)", "فلو تکنیکی", "جازی (Jazz Rap)", "زیرزمینی (Underground)"]
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'generator' | 'marketplace' | 'cloud'>('generator');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<RapStyle>(RapStyle.Gangsta);
  const [tone, setTone] = useState<RapTone>(RapTone.Aggressive);
  const [complexity, setComplexity] = useState<RhymeComplexity>(RhymeComplexity.Medium);
  const [subStyle, setSubStyle] = useState<string>(STYLE_VARIATIONS[RapStyle.Gangsta][0]);
  const [length, setLength] = useState<RapLength>(RapLength.Medium);
  const [rhymeScheme, setRhymeScheme] = useState<RhymeScheme>(RhymeScheme.Freestyle);
  const [keywords, setKeywords] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  
  const [creativity, setCreativity] = useState(0.8);
  const [topK, setTopK] = useState(40);
  const [topP, setTopP] = useState(0.95);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LyricResponse & { id?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeInputTab, setActiveInputTab] = useState<'style' | 'keywords' | 'advanced'>('style');
  const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([]);

  useEffect(() => {
    setSubStyle(STYLE_VARIATIONS[style][0]);
  }, [style]);

  useEffect(() => {
    setCloudProjects(cloudStorage.getProjects());
  }, [activeView]);

  const currentVariant = useMemo(() => telemetry.getVariant(), []);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('لطفا ابتدا یک موضوع وارد کنید!');
      return;
    }
    const startTime = Date.now();
    telemetry.log('generation_start', { topic, style, variant: currentVariant });
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateRapLyrics(topic, style, tone, complexity, subStyle, length, keywords, creativity, topK, topP, rhymeScheme, useThinking);
      const projectId = Math.random().toString(36).substr(2, 9);
      setResult({ ...data, id: projectId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطایی رخ داد.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, style, tone, complexity, subStyle, length, keywords, creativity, topK, topP, rhymeScheme, useThinking, currentVariant]);

  const openProject = (p: CloudProject) => {
    setResult({
      title: p.title,
      content: p.lyrics,
      variant: 'Standard_Flow_v1',
      suggestedBpm: p.bpm,
      id: p.id
    });
    setTopic(p.title);
    setStyle(p.style);
    setActiveView('generator');
  };

  return (
    <div className="min-h-screen bg-rap-dark text-white pb-20 selection:bg-rap-accent">
      <nav className="w-full border-b border-white/5 bg-rap-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('generator')}>
              <div className="bg-gradient-to-tr from-rap-accent to-purple-600 p-2 rounded-lg"><Mic2 size={24} className="text-white" /></div>
              <span className="font-black text-xl tracking-tighter">RAP<span className="text-rap-accent">GEN</span>.AI</span>
            </div>
            
            <div className="hidden lg:flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button onClick={() => setActiveView('generator')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'generator' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}> Generator </button>
              <button onClick={() => setActiveView('cloud')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'cloud' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}> <Cloud size={14} /> Cloud Hub </button>
              <button onClick={() => setActiveView('marketplace')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'marketplace' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}> <Puzzle size={14} /> Plugins </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 flex items-center gap-2">
                <RefreshCw size={10} className="animate-spin" /> Connected to RapCloud
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-12">
        {activeView === 'generator' && (
          <>
            <div className="text-center mb-12 animate-fadeIn">
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight leading-[1.1]">
                تکنیک و <span className="text-transparent bg-clip-text bg-gradient-to-r from-rap-accent to-purple-500">فلو</span> در دستان تو
              </h1>
              <p className="text-rap-muted text-lg max-w-xl mx-auto font-medium">موتور هوشمند تولید لیریک رپ با رعایت استانداردهای فنی مارکت.</p>
            </div>

            <div className="bg-rap-card border border-white/5 rounded-3xl shadow-2xl mb-10 overflow-hidden animate-fadeIn">
              <div className="flex border-b border-white/5 bg-black/20">
                  {[
                      { id: 'style', icon: Sparkles, label: 'موضوع و سبک' },
                      { id: 'keywords', icon: Hash, label: 'کلمات و فنی' },
                      { id: 'advanced', icon: Sliders, label: 'تنظیمات پیشرفته' }
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveInputTab(tab.id as any)} className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeInputTab === tab.id ? 'bg-white/5 text-rap-accent border-b-2 border-rap-accent' : 'text-gray-500 hover:text-gray-300'}`}>
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                  ))}
              </div>

              <div className="p-8">
                <div className="space-y-8">
                    {activeInputTab === 'style' && (
                      <div className="space-y-8 animate-fadeIn">
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-400"><Sparkles size={16} className="text-rap-accent" /> موضوع آهنگ</label>
                          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="مثلا: تهران 1403، رفاقت، نبرد تا پیروزی..." className="w-full bg-rap-dark border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rap-accent outline-none text-xl placeholder-gray-700 text-right" dir="rtl" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.values(RapStyle).map((s) => (
                              <button key={s} onClick={() => setStyle(s)} className={`p-4 rounded-2xl border text-sm font-bold transition-all ${style === s ? 'bg-rap-accent text-white border-rap-accent shadow-lg shadow-rap-accent/30' : 'bg-rap-dark border-white/5 text-gray-500 hover:border-white/20'}`}>{s}</button>
                            ))}
                        </div>
                      </div>
                    )}
                    {/* ... other input tabs logic ... */}
                </div>

                <div className="mt-10">
                  <button onClick={handleGenerate} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${isLoading ? 'bg-gray-800 cursor-wait' : 'bg-gradient-to-r from-rap-accent to-purple-600 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-rap-accent/20'}`}>
                    {isLoading ? <><Loader2 className="animate-spin" /> در حال پردازش...</> : <><Zap /> بسازش</>}
                  </button>
                </div>
              </div>
            </div>
            {result && <LyricCard id={result.id} title={result.title} content={result.content} variant={result.variant} topic={topic} style={style} suggestedStyle={result.suggestedStyle} suggestedBpm={result.suggestedBpm} />}
          </>
        )}

        {activeView === 'cloud' && (
          <div className="space-y-8 animate-fadeIn text-right" dir="rtl">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white flex items-center gap-3"><Cloud className="text-rap-accent" /> مرکز پروژه‌های ابری</h2>
                <button onClick={() => setActiveView('generator')} className="bg-rap-accent px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-rap-accent/20">پروژه جدید</button>
             </div>

             {cloudProjects.length === 0 ? (
               <div className="py-20 bg-rap-card rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 opacity-50">
                  <FolderOpen size={48} />
                  <p className="font-bold">هنوز پروژه‌ای در ابر ذخیره نشده است.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cloudProjects.map(p => (
                    <div key={p.id} onClick={() => openProject(p)} className="bg-rap-card border border-white/5 p-6 rounded-3xl hover:border-rap-accent transition-all cursor-pointer group">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-black text-white group-hover:text-rap-accent transition-colors">{p.title}</h3>
                          <div className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500">ویرایش {new Date(p.lastModified).toLocaleDateString()}</div>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1 border border-white/10 rounded">{p.style}</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1 border border-white/10 rounded">{p.bpm} BPM</span>
                          <span className="text-[10px] font-bold text-rap-accent flex items-center gap-1"><MessageCircle size={10} /> {p.comments.length}</span>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        )}

        {activeView === 'marketplace' && <PluginMarketplace />}
      </main>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
