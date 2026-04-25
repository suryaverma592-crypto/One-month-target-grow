import { useState, useMemo } from 'react';
import { Check, X, Copy, RotateCcw, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DayData {
  day: number;
  startBalance: number;
  targetProfit: number;
  endBalance: number;
}

export default function App() {
  const [initialAmount, setInitialAmount] = useState<number>(6);
  const [profitPercent, setProfitPercent] = useState<number>(10);
  const [planMonths, setPlanMonths] = useState<number>(1);
  const [statuses, setStatuses] = useState<Record<number, 'success' | 'fail' | 'pending'>>({});
  const [actuals, setActuals] = useState<Record<number, string>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);

  const totalDays = planMonths * 30;

  const tableData = useMemo(() => {
    const data: (DayData & { fixedGoal: number })[] = [];
    let currentBalance = initialAmount;
    let fixedBalance = initialAmount;

    for (let i = 1; i <= totalDays; i++) {
        const target = currentBalance * (profitPercent / 100);
        const expectedEnd = currentBalance + target;
        
        // Fixed plan calculation (ignores actuals)
        const fixedTarget = fixedBalance * (profitPercent / 100);
        const fixedGoal = fixedBalance + fixedTarget;

        data.push({
            day: i,
            startBalance: currentBalance,
            targetProfit: target,
            endBalance: expectedEnd,
            fixedGoal: fixedGoal
        });

        // Update fixed balance for next iteration
        fixedBalance = fixedGoal;

        // Use actual amount for next day's start balance if user entered it
        const userActual = actuals[i];
        if (userActual && !isNaN(parseFloat(userActual))) {
            currentBalance = parseFloat(userActual);
        } else {
            currentBalance = expectedEnd;
        }
    }
    return data;
  }, [initialAmount, totalDays, profitPercent, actuals]);

  const toggleStatus = (day: number) => {
    setStatuses(prev => {
        const current = prev[day] || 'pending';
        let next: 'success' | 'fail' | 'pending';
        if (current === 'pending') next = 'success';
        else if (current === 'success') next = 'fail';
        else next = 'pending';
        return { ...prev, [day]: next };
    });
  };

  const copyToClipboard = () => {
    let text = "30-Day 10% Daily Profit Plan (Start: $" + initialAmount + ")\n\n";
    text += "Day | Start Balance | Target Profit | Expected End | Actual End | Status | Reason\n";
    text += "---|---|---|---|---|---|---\n";
    tableData.forEach(row => {
        const statusIcon = statuses[row.day] === 'success' ? '✅' : statuses[row.day] === 'fail' ? '❌' : '⬜';
        const actual = actuals[row.day] || '-';
        const reason = reasons[row.day] || '-';
        text += `${row.day} | ${row.startBalance.toFixed(2)} | ${row.targetProfit.toFixed(2)} | ${row.endBalance.toFixed(2)} | ${actual} | ${statusIcon} | ${reason}\n`;
    });
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetProgress = () => {
    if (confirm("Reset all progress?")) {
        setStatuses({});
        setActuals({});
        setReasons({});
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col gap-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-200 pb-8"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-1">
            Compound Growth Tracker
          </h1>
          <p className="text-slate-500 uppercase text-xs font-bold tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            Daily Goal: {profitPercent}% Profit • Month 01
          </p>
        </div>
        <div className="text-left md:text-right">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-tighter mb-1">Total Expected Gain</div>
          <div className="text-3xl font-mono font-black text-blue-600">
            ${tableData[totalDays - 1]?.endBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        <div className="lg:col-span-4 space-y-6">
          <div className="card-container p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block px-1">Starting Capital ($)</label>
              <input 
                type="number" 
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={copyToClipboard}
                className="primary-button col-span-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </button>
              <button 
                onClick={resetProgress}
                className="secondary-button flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <div className="secondary-button flex items-center justify-center gap-2 h-[46px] p-0 overflow-hidden relative group border-blue-200 bg-blue-50/10">
                <TrendingUp className="w-4 h-4 ml-4 flex-shrink-0 text-blue-500" />
                <select 
                  value={profitPercent}
                  onChange={(e) => setProfitPercent(Number(e.target.value))}
                  className="bg-transparent border-none outline-none appearance-none flex-1 h-full pl-2 pr-8 font-bold text-slate-800 cursor-pointer focus:ring-0"
                >
                  {Array.from({ length: 100 }, (_, i) => i + 1).map(val => (
                    <option key={val} value={val} className="text-slate-900 font-sans">{val}% Daily</option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none opacity-40">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card-container p-6 bg-slate-900 text-white border-0">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4">Live Statistics</div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-mono font-bold text-emerald-400">
                  {Object.values(statuses).filter(s => s === 'success').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Hits</div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-red-400">
                  {Object.values(statuses).filter(s => s === 'fail').length}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Misses</div>
              </div>
              <div className="col-span-2 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xl font-mono font-bold text-blue-400">
                    {(tableData[totalDays - 1]?.endBalance / (initialAmount || 1)).toFixed(1)}x
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Multiplier</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block text-right">Plan Duration</div>
                  <select 
                    value={planMonths}
                    onChange={(e) => setPlanMonths(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 font-mono text-xs text-blue-400 focus:outline-none focus:border-blue-500 cursor-pointer text-right"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m} className="bg-slate-900">{m} {m === 1 ? 'Month' : 'Months'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 card-container">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[50px_1fr_1fr_1.2fr_1.2fr_1.2fr_70px_1.8fr]">
                <div className="col-header">#</div>
                <div className="col-header">Start</div>
                <div className="col-header">Target</div>
                <div className="col-header">Goal</div>
                <div className="col-header bg-blue-50/50">Fixed Plan</div>
                <div className="col-header">Actual Result ($)</div>
                <div className="col-header text-center">Stat</div>
                <div className="col-header">Notes</div>
              </div>

              <div className="divide-y divide-slate-100">
                {tableData.map((row) => (
                  <motion.div 
                    key={row.day}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`data-row grid grid-cols-[50px_1fr_1fr_1.2fr_1.2fr_1.2fr_70px_1.8fr] items-center ${statuses[row.day] === 'success' ? 'bg-emerald-50/20' : statuses[row.day] === 'fail' ? 'bg-red-50/20' : ''}`}
                  >
                    <div className="px-4 py-3 font-mono text-[10px] text-slate-400">{row.day.toString().padStart(2, '0')}</div>
                    <div className="px-4 py-3 data-value text-sm text-slate-400 opacity-60">
                      ${row.startBalance.toFixed(2)}
                    </div>
                    <div className="px-4 py-3 data-value text-sm text-emerald-600/60">
                      +${row.targetProfit.toFixed(2)}
                    </div>
                    <div className="px-4 py-3 data-value text-sm font-bold text-slate-900">
                      ${row.endBalance.toFixed(2)}
                    </div>
                    <div className="px-4 py-3 data-value text-sm font-bold text-blue-600 bg-blue-50/20 h-full flex items-center">
                      ${row.fixedGoal.toFixed(2)}
                    </div>
                    <div className="px-4 py-3">
                      <input 
                        type="text"
                        placeholder="--"
                        value={actuals[row.day] || ''}
                        onChange={(e) => setActuals(prev => ({ ...prev, [row.day]: e.target.value }))}
                        className="w-full bg-white/50 border border-slate-200 rounded px-2 py-1 font-mono text-sm focus:bg-white focus:border-blue-400 outline-none transition-all"
                      />
                    </div>
                    <div className="px-4 py-3 flex justify-center">
                      <button 
                        onClick={() => toggleStatus(row.day)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                          statuses[row.day] === 'success' 
                          ? 'bg-emerald-500 text-white' 
                          : statuses[row.day] === 'fail'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400'
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {statuses[row.day] === 'success' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key="check">
                              <Check className="w-3 h-3" />
                            </motion.div>
                          )}
                          {statuses[row.day] === 'fail' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key="cross">
                              <X className="w-3 h-3" />
                            </motion.div>
                          )}
                          {statuses[row.day] === 'pending' && (
                             <div key="dot" className="w-1 h-1 rounded-full bg-current" />
                          )}
                        </AnimatePresence>
                      </button>
                    </div>
                    <div className="px-4 py-3">
                      <input 
                        type="text"
                        placeholder="Log notes..."
                        value={reasons[row.day] || ''}
                        onChange={(e) => setReasons(prev => ({ ...prev, [row.day]: e.target.value }))}
                        className="w-full bg-transparent border-0 focus:ring-0 text-xs italic text-slate-500 placeholder:text-slate-300 outline-none"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <footer className="mt-8 mb-12 p-8 bg-slate-800 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl shadow-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="z-10 text-center md:text-left">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] block mb-1">Simulated Potential</span>
          <span className="text-4xl font-black font-mono tracking-tighter">
            ${tableData[totalDays - 1]?.endBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="z-10 flex flex-wrap justify-center gap-4">
           <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-mono">
              <span className="text-slate-400 mr-2">EFFICIENCY:</span>
              <span className="text-emerald-400">
                {((Object.values(statuses).filter(s => s === 'success').length / (Object.values(statuses).length || 1)) * 100).toFixed(0)}%
              </span>
           </div>
           <div className="bg-blue-500/20 border border-blue-400/20 text-blue-300 px-4 py-2 rounded-xl text-xs font-mono">
              <span className="opacity-60 mr-2">EST. GROWTH:</span>
              <span>17.4x</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
