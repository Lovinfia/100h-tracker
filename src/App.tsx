import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Home, 
  BarChart2,
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  X, 
  ShieldAlert,
  Award,
  Sparkles,
  Clock,
  Play,
  Pause,
  Timer as TimerIcon,
  Download,
  Upload,
  Edit2,
  Check
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  categories: string[];
  totalHours: number;
  currentHours: number;
  startDate: string;
  endDate: string;
  description: string;
  completed: boolean;
  abandoned: boolean;
}

const ALL_CATEGORIES = ['智慧', '体力', '创造力', '技巧', '财富', '精神力'] as const;

export default function App() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('track100_mario_goals_v5');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: '1',
        title: 'WORLD 1: 深度阅读与学识构建',
        categories: ['智慧'],
        totalHours: 100,
        currentHours: 18,
        startDate: '2026-07-01',
        endDate: '2026-10-01',
        description: '蘑菇王国知识闯关',
        completed: false,
        abandoned: false
      },
      {
        id: '2',
        title: 'WORLD 2: 核心体能与力量特训',
        categories: ['体力'],
        totalHours: 100,
        currentHours: 45,
        startDate: '2026-07-01',
        endDate: '2026-12-31',
        description: '跳跃冲刺，超越自我',
        completed: false,
        abandoned: false
      }
    ];
  });

  const [mainTab, setMainTab] = useState<'home' | 'stats'>('home');
  const [homeSubTab, setHomeSubTab] = useState<'list' | 'timer'>('list');

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategories, setNewCategories] = useState<string[]>(['智慧']);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleText, setEditingTitleText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 计时器相关状态
  const [timerGoalId, setTimerGoalId] = useState<string>(goals[0]?.id || '');
  const [timerSeconds, setTimerSeconds] = useState<number>(3600);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);

  // 用于后台时间戳计算的 Ref
  const targetTimestampRef = useRef<number | null>(null);
  const stopwatchStartTimeRef = useRef<number | null>(null);
  const stopwatchInitialSecondsRef = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem('track100_mario_goals_v5', JSON.stringify(goals));
  }, [goals]);

  // 核心优化：基于时间戳的计时器 + 页面可见性恢复（完美支持后台挂起/锁屏恢复）
  useEffect(() => {
    let interval: any = null;

    if (timerRunning) {
      // 1. 初始化计时基准时间戳
      if (timerMode === 'countdown') {
        if (!targetTimestampRef.current) {
          targetTimestampRef.current = Date.now() + timerSeconds * 1000;
        }
      } else {
        if (!stopwatchStartTimeRef.current) {
          stopwatchStartTimeRef.current = Date.now();
          stopwatchInitialSecondsRef.current = stopwatchSeconds;
        }
      }

      // 2. 循环计算
      interval = setInterval(() => {
        if (timerMode === 'countdown') {
          if (targetTimestampRef.current) {
            const remaining = Math.max(0, Math.ceil((targetTimestampRef.current - Date.now()) / 1000));
            setTimerSeconds(remaining);
            if (remaining <= 0) {
              setTimerRunning(false);
              targetTimestampRef.current = null;
              alert('STAGE CLEAR! 计时1小时已完成, 已为你自动计入对应任务！');
              if (timerGoalId) handleCheckIn(timerGoalId);
              setTimerSeconds(3600);
            }
          }
        } else {
          if (stopwatchStartTimeRef.current) {
            const elapsed = Math.floor((Date.now() - stopwatchStartTimeRef.current) / 1000);
            setStopwatchSeconds(stopwatchInitialSecondsRef.current + elapsed);
          }
        }
      }, 500); // 缩短检测频率使反馈更精准

      // 3. 监听页面可见性（用户从后台切回网页时立刻校准时间）
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && timerRunning) {
          if (timerMode === 'countdown' && targetTimestampRef.current) {
            const remaining = Math.max(0, Math.ceil((targetTimestampRef.current - Date.now()) / 1000));
            setTimerSeconds(remaining);
            if (remaining <= 0) {
              setTimerRunning(false);
              targetTimestampRef.current = null;
              alert('STAGE CLEAR! 计时1小时已完成, 已为你自动计入对应任务！');
              if (timerGoalId) handleCheckIn(timerGoalId);
              setTimerSeconds(3600);
            }
          } else if (timerMode === 'stopwatch' && stopwatchStartTimeRef.current) {
            const elapsed = Math.floor((Date.now() - stopwatchStartTimeRef.current) / 1000);
            setStopwatchSeconds(stopwatchInitialSecondsRef.current + elapsed);
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (interval) clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      // 暂停时清空时间戳基准
      targetTimestampRef.current = null;
      stopwatchStartTimeRef.current = null;
    }
  }, [timerRunning, timerMode, timerGoalId]);

  const completedGoalsCount = goals.filter(g => g.currentHours >= 100 || g.completed).length;
  const totalExp = completedGoalsCount * 10;
  
  const calculateLevel = (exp: number) => {
    let level = 1;
    let remainingExp = exp;
    for (let i = 1; i < 5; i++) {
      if (remainingExp >= 50) { remainingExp -= 50; level++; } 
      else { return { level, currentExpInLevel: remainingExp, nextLevelExp: 50 }; }
    }
    while (remainingExp >= 100) { remainingExp -= 100; level++; }
    return { level, currentExpInLevel: remainingExp, nextLevelExp: 100 };
  };

  const rpgStatus = calculateLevel(totalExp);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newCategories.length === 0) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newTitle,
      categories: newCategories,
      totalHours: 100,
      currentHours: 0,
      startDate: newStartDate,
      endDate: newEndDate || 'MARIO WORLD',
      description: newDesc,
      completed: false,
      abandoned: false
    };

    setGoals([newGoal, ...goals]);
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  const handleCheckIn = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id && !g.abandoned) {
        const next = Math.min(100, g.currentHours + 1);
        return { ...g, currentHours: next, completed: next >= 100 };
      }
      return g;
    }));
  };

  const handleUndo = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id && !g.abandoned) {
        const prev = Math.max(0, g.currentHours - 1);
        return { ...g, currentHours: prev, completed: false };
      }
      return g;
    }));
  };

  const handleAbandon = (id: string) => {
    if (confirm('GAME OVER? 确定要放弃当前挑战吗？')) {
      setGoals(goals.map(g => g.id === id ? { ...g, abandoned: true } : g));
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定清除该关卡存档吗？')) {
      setGoals(goals.filter(g => g.id !== id));
      if (activeGoalId === id) setActiveGoalId(null);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(goals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `track100_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setGoals(parsed);
            alert('存档导入成功！');
          } else {
            alert('文件格式错误，非法的存档数据。');
          }
        } catch (error) {
          alert('解析 JSON 文件失败。');
        }
      };
    }
  };

  const handleSaveTitle = (id: string) => {
    if (!editingTitleText.trim()) return;
    setGoals(goals.map(g => g.id === id ? { ...g, title: editingTitleText.trim() } : g));
    setIsEditingTitle(false);
  };

  const filteredGoals = goals.filter(g => {
    if (selectedCategoryFilter !== 'All' && selectedCategoryFilter !== '全部' && !g.categories.includes(selectedCategoryFilter)) return false;
    if (statusFilter === 'ongoing' && (g.completed || g.abandoned)) return false;
    if (statusFilter === 'completed' && !g.completed) return false;
    return true;
  });

  const activeGoal = goals.find(g => g.id === activeGoalId);

  const calculateEstimatedDays = (goal: Goal) => {
    if (goal.currentHours >= 100 || goal.completed) return 'STAGE CLEAR!';
    if (goal.currentHours === 0) return 'READY';
    const start = new Date(goal.startDate).getTime();
    const now = new Date().getTime();
    const daysPassed = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
    const hoursPerDay = goal.currentHours / daysPassed;
    if (hoursPerDay <= 0) return '计算中...';
    const remainingHours = 100 - goal.currentHours;
    const daysNeeded = Math.ceil(remainingHours / hoursPerDay);
    return `约需 ${daysNeeded} 天`;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#081c10] text-[#ecfdf5] flex justify-center pb-28 font-mono select-none overflow-x-hidden">
      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-2xl bg-[#0f2d18] border-x-4 border-[#1b4d2c] pb-12">
        
        <header className="px-5 pt-6 pb-4 bg-gradient-to-b from-[#144222] to-[#0f2d18] rounded-b-3xl border-b-4 border-[#226e3e]">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#4ade80] font-black flex items-center gap-1">
                🍄 100 CHANGE EVERYTHING
              </div>
              <h1 className="text-xl font-black tracking-wider text-[#ffd700] mt-1 drop-shadow-[2px_2px_0px_#000]">
                SUPER 100 WORLD
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportData} 
                title="导出存档"
                className="bg-[#081c10] border-2 border-[#226e3e] text-[#4ade80] p-1.5 rounded-lg hover:border-[#ffd700]"
              >
                <Download size={15} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                title="导入存档"
                className="bg-[#081c10] border-2 border-[#226e3e] text-[#4ade80] p-1.5 rounded-lg hover:border-[#ffd700]"
              >
                <Upload size={15} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportData} 
                accept=".json" 
                className="hidden" 
              />

              <div className="bg-[#081c10] border-2 border-[#ffd700] text-[#ffd700] px-3 py-1.5 rounded-none shadow-[3px_3px_0px_#000] flex items-center gap-1.5 ml-1">
                <Award size={15} className="text-[#ffd700]" />
                <span className="text-xs font-black">LV.{rpgStatus.level}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-[#081c10] p-3 rounded-xl border-2 border-[#226e3e] shadow-[inset_2px_2px_0px_#000]">
            <div className="flex justify-between text-[11px] font-bold text-[#a7f3d0] mb-1">
              <span>COIN EXP: <span className="text-[#ffd700] font-black">{totalExp}</span></span>
              <span>NEXT LV: <span className="text-[#4ade80] font-black">{rpgStatus.currentExpInLevel}</span>/{rpgStatus.nextLevelExp}</span>
            </div>
            <div className="w-full bg-[#05140b] h-2.5 rounded-none overflow-hidden p-0.5 border border-[#226e3e]">
              <div 
                className="bg-gradient-to-r from-[#22c55e] to-[#4ade80] h-full transition-all duration-300 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                style={{ width: `${(rpgStatus.currentExpInLevel / rpgStatus.nextLevelExp) * 100}%` }}
              ></div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth">
          {activeGoal ? (
            <div className="flex flex-col animate-fadeIn pb-6">
              <button 
                onClick={() => { setActiveGoalId(null); setIsEditingTitle(false); }}
                className="text-xs text-[#4ade80] font-bold mb-4 flex items-center gap-1 hover:text-white"
              >
                ◀ [ 返回任务列表 ]
              </button>

              <div className="bg-[#144222] rounded-xl p-4 shadow-lg border-2 border-[#226e3e] mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-1">
                    {activeGoal.categories.map(cat => (
                      <span key={cat} className="text-[10px] px-2.5 py-0.5 bg-[#1b5e20] text-[#ffd700] border border-[#4ade80] font-black">
                        ★ {cat}
                      </span>
                    ))}
                  </div>
                  <button onClick={(e) => handleDelete(activeGoal.id, e)} className="text-emerald-400/60 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="text"
                        value={editingTitleText}
                        onChange={e => setEditingTitleText(e.target.value)}
                        className="flex-1 bg-[#081c10] text-white border-2 border-[#ffd700] rounded px-2 py-1 text-xs focus:outline-none"
                      />
                      <button 
                        onClick={() => handleSaveTitle(activeGoal.id)}
                        className="p-1.5 bg-[#22c55e] text-[#081c10] rounded font-bold"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => setIsEditingTitle(false)}
                        className="p-1.5 bg-gray-700 text-white rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-black text-white">{activeGoal.title}</h2>
                      <button 
                        onClick={() => { setIsEditingTitle(true); setEditingTitleText(activeGoal.title); }}
                        className="text-emerald-300 hover:text-[#ffd700] p-1 flex items-center gap-1 text-[11px]"
                      >
                        <Edit2 size={13} /> 修改
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-emerald-200/70 mt-1">{activeGoal.description || '无备注'}</p>
                
                <div className="flex justify-between items-center text-xs text-emerald-300 mt-3 pt-2 border-t border-[#226e3e]">
                  <span>START: {activeGoal.startDate}</span>
                  <span className="font-black text-[#4ade80]">
                    {activeGoal.currentHours} / 100 H
                  </span>
                </div>
              </div>

              <div className="bg-[#144222] rounded-xl p-4 shadow-lg border-2 border-[#226e3e] flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-black tracking-wider text-emerald-200">STAGE 100 GRID</span>
                  <span className="text-xs font-black text-[#4ade80]">
                    {Math.round((activeGoal.currentHours / 100) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-10 gap-1.5 my-auto py-2 px-1">
                  {Array.from({ length: 100 }).map((_, index) => {
                    const isChecked = index < activeGoal.currentHours;
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (!activeGoal.abandoned) {
                            if (index === activeGoal.currentHours) handleCheckIn(activeGoal.id);
                            else if (index === activeGoal.currentHours - 1) handleUndo(activeGoal.id);
                          }
                        }}
                        className={`aspect-square rounded-[3px] transition-all cursor-pointer border ${
                          isChecked 
                            ? 'bg-[#22c55e] border-[#4ade80] shadow-[0_0_4px_rgba(74,222,128,0.5)]' 
                            : 'bg-[#081c10] border-[#1b4d2c] hover:border-[#22c55e]'
                        }`}
                      ></div>
                    );
                  })}
                </div>

                {activeGoal.abandoned ? (
                  <div className="text-center py-3 text-red-400 text-xs font-bold bg-red-950/40 border border-red-900/50 rounded-xl mt-4">
                    GAME OVER (已放弃) ⚠️
                  </div>
                ) : (
                  <div className="space-y-2 mt-4 pt-3 border-t border-[#226e3e]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUndo(activeGoal.id)}
                        disabled={activeGoal.currentHours <= 0}
                        className="flex-1 py-3 bg-[#081c10] hover:bg-[#1b4d2c] disabled:opacity-30 text-emerald-200 rounded-lg font-bold flex items-center justify-center gap-1 text-xs border border-[#226e3e]"
                      >
                        <RotateCcw size={14} /> 撤销 -1h
                      </button>
                      <button
                        onClick={() => handleCheckIn(activeGoal.id)}
                        disabled={activeGoal.currentHours >= 100}
                        className="flex-2 py-3 bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] hover:from-[#2e7d32] hover:to-[#388e3c] disabled:opacity-40 text-white rounded-lg font-black flex items-center justify-center gap-1.5 text-xs shadow-lg border border-[#4ade80]"
                      >
                        <CheckCircle2 size={16} /> 闯关打卡 (+1h)
                      </button>
                    </div>
                    <button
                      onClick={() => handleAbandon(activeGoal.id)}
                      className="w-full py-2 bg-transparent hover:bg-red-950/30 text-red-400/80 rounded-lg font-semibold text-xs flex items-center justify-center gap-1"
                    >
                      <ShieldAlert size={14} /> 放弃本关挑战
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : mainTab === 'stats' ? (
            <div className="space-y-4 animate-fadeIn pb-6">
              <div className="bg-[#144222] p-5 rounded-xl border-2 border-[#226e3e] shadow-lg flex flex-col items-center">
                <h4 className="text-xs font-black text-[#ffd700] mb-4 tracking-wider flex items-center gap-1.5 self-start">
                  <Sparkles size={14} className="text-[#ffd700]" /> 六维属性雷达 (HEXAGON STATS)
                </h4>
                
                <div className="relative w-48 h-48 my-2 flex items-center justify-center">
                  <div className="absolute w-40 h-40 border border-[#226e3e] rounded-full opacity-60"></div>
                  <div className="absolute w-28 h-28 border border-[#226e3e] rounded-full opacity-60"></div>
                  <div className="absolute w-14 h-14 border border-[#226e3e] rounded-full opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-[#226e3e]"></div></div>
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-[1px] h-full bg-[#226e3e]"></div></div>

                  {ALL_CATEGORIES.map((cat, idx) => {
                    const angle = (idx * 60) * (Math.PI / 180);
                    const catHours = goals
                      .filter(g => g.categories.includes(cat))
                      .reduce((sum, g) => sum + g.currentHours, 0);
                    const scoreRatio = Math.min(1, catHours / 100);
                    const radius = 70 * scoreRatio;
                    const x = 96 + radius * Math.cos(angle - Math.PI / 2);
                    const y = 96 + radius * Math.sin(angle - Math.PI / 2);
                    const labelRadius = 90;
                    const lx = 96 + labelRadius * Math.cos(angle - Math.PI / 2) - 14;
                    const ly = 96 + labelRadius * Math.sin(angle - Math.PI / 2) - 8;

                    return (
                      <React.Fragment key={cat}>
                        <div className="absolute w-2 h-2 bg-[#4ade80] rounded-full shadow-[0_0_6px_#4ade80]" style={{ left: `${x}px`, top: `${y}px` }}></div>
                        <span className="absolute text-[10px] font-black text-emerald-200 text-center w-8" style={{ left: `${lx}px`, top: `${ly}px` }}>{cat}</span>
                      </React.Fragment>
                    );
                  })}

                  <div className="z-10 bg-[#081c10] border-2 border-[#ffd700] px-2.5 py-1 text-center shadow-lg">
                    <div className="text-[9px] text-[#ffd700] font-bold">LEVEL</div>
                    <div className="text-xs font-black text-white">{rpgStatus.level}</div>
                  </div>
                </div>

                <div className="w-full space-y-2 mt-4 pt-3 border-t border-[#226e3e] text-xs">
                  {ALL_CATEGORIES.map(cat => {
                    const catHours = goals
                      .filter(g => g.categories.includes(cat))
                      .reduce((sum, g) => sum + g.currentHours, 0);
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="w-12 font-bold text-emerald-200">{cat}</span>
                        <div className="flex-1 bg-[#081c10] h-2.5 rounded-none overflow-hidden border border-[#226e3e]">
                          <div className="bg-gradient-to-r from-[#166534] to-[#22c55e] h-full" style={{ width: `${Math.min(100, catHours)}%` }}></div>
                        </div>
                        <span className="w-10 text-right font-bold text-[#4ade80]">{catHours}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#144222] p-5 rounded-xl border-2 border-[#226e3e] shadow-lg">
                <h4 className="text-xs font-black text-[#ffd700] mb-3 tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-[#ffd700]" /> ETA 预计完成天数预测
                </h4>
                <div className="space-y-2.5">
                  {goals.map(goal => (
                    <div key={goal.id} className="bg-[#081c10] p-3 rounded-lg border border-[#226e3e] flex justify-between items-center">
                      <div>
                        <div className="text-xs font-black text-white">{goal.title}</div>
                        <div className="text-[10px] text-emerald-300/80 mt-0.5">当前: {goal.currentHours} / 100h</div>
                      </div>
                      <span className="text-[11px] font-black px-2.5 py-1 bg-[#1b5e20]/60 text-[#4ade80] border border-[#4ade80]/40">
                        {calculateEstimatedDays(goal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col pb-6">
              
              <div className="grid grid-cols-2 gap-2 mb-4 bg-[#081c10] p-1.5 rounded-xl border-2 border-[#226e3e] shadow-inner">
                <button 
                  onClick={() => setHomeSubTab('list')}
                  className={`py-2 rounded-lg text-xs font-black transition-all ${homeSubTab === 'list' ? 'bg-[#1b5e20] text-[#ffd700] shadow-md border border-[#4ade80]' : 'text-emerald-300 hover:text-white'}`}
                >
                  任务列表
                </button>
                <button 
                  onClick={() => setHomeSubTab('timer')}
                  className={`py-2 rounded-lg text-xs font-black transition-all ${homeSubTab === 'timer' ? 'bg-[#1b5e20] text-[#ffd700] shadow-md border border-[#4ade80]' : 'text-emerald-300 hover:text-white'}`}
                >
                  计时链接
                </button>
              </div>

              {homeSubTab === 'list' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {['all', 'ongoing', 'completed'].map((st) => (
                      <button 
                        key={st}
                        onClick={() => setStatusFilter(st as any)}
                        className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all border ${statusFilter === st ? 'bg-[#ffd700] text-[#081c10] border-[#ffd700] font-black' : 'bg-[#144222] text-emerald-200 border-[#226e3e]'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {['全部', ...ALL_CATEGORIES].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-md text-[11px] whitespace-nowrap transition-all font-bold border ${
                          selectedCategoryFilter === cat 
                            ? 'bg-[#2e7d32] text-[#ffd700] border-[#4ade80]' 
                            : 'bg-[#144222] text-emerald-200 border-[#226e3e]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredGoals.length === 0 ? (
                      <div className="text-center py-12 text-emerald-400/60 text-xs font-medium">
                        暂无相关关卡任务，点击下方 [+] 创建新挑战！
                      </div>
                    ) : (
                      filteredGoals.map(goal => {
                        const percentage = Math.round((goal.currentHours / 100) * 100);
                        return (
                          <div
                            key={goal.id}
                            onClick={() => setActiveGoalId(goal.id)}
                            className={`bg-[#144222] rounded-xl p-4 shadow-lg border-2 transition-all cursor-pointer relative group ${
                              goal.abandoned ? 'opacity-50 border-gray-700' : 'border-[#226e3e] hover:border-[#ffd700]'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-wrap gap-1">
                                {goal.categories.map(cat => (
                                  <span key={cat} className="text-[9px] px-2 py-0.5 bg-[#1b5e20] text-[#ffd700] border border-[#4ade80] font-bold">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs font-black text-[#4ade80]">
                                {percentage}%
                              </span>
                            </div>

                            <h3 className="text-sm font-black text-white group-hover:text-[#ffd700] transition-colors line-clamp-1">
                              {goal.title}
                            </h3>

                            <div className="mt-3">
                              <div className="flex justify-between text-[10px] text-emerald-200/80 mb-1">
                                <span>已投入进度</span>
                                <span className="font-bold text-[#4ade80]">{goal.currentHours} / 100 H</span>
                              </div>
                              <div className="w-full bg-[#081c10] h-2 rounded-none overflow-hidden p-0.5 border border-[#226e3e]">
                                <div 
                                  className="bg-gradient-to-r from-[#166534] to-[#22c55e] h-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, goal.currentHours)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {homeSubTab === 'timer' && (
                <div className="bg-[#144222] p-5 rounded-xl border-2 border-[#226e3e] shadow-lg space-y-5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-[#ffd700] font-black text-xs">
                    <TimerIcon size={16} /> 专注计时挑战器 (Background Active Timer)
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-200 block mb-1">选择当前挑战任务：</label>
                    <select 
                      value={timerGoalId} 
                      onChange={e => setTimerGoalId(e.target.value)}
                      className="w-full bg-[#081c10] text-white border-2 border-[#226e3e] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ffd700]"
                    >
                      {goals.filter(g => !g.completed && !g.abandoned).map(g => (
                        <option key={g.id} value={g.id}>{g.title} ({g.currentHours}h/100h)</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setTimerMode('countdown'); setTimerSeconds(3600); setTimerRunning(false); }}
                      className={`flex-1 py-2 text-xs font-bold border-2 rounded-lg ${timerMode === 'countdown' ? 'bg-[#ffd700] text-[#081c10] border-[#ffd700] font-black' : 'bg-[#081c10] text-emerald-200 border-[#226e3e]'}`}
                    >
                      1小时倒计时
                    </button>
                    <button 
                      onClick={() => { setTimerMode('stopwatch'); setStopwatchSeconds(0); setTimerRunning(false); }}
                      className={`flex-1 py-2 text-xs font-bold border-2 rounded-lg ${timerMode === 'stopwatch' ? 'bg-[#ffd700] text-[#081c10] border-[#ffd700] font-black' : 'bg-[#081c10] text-emerald-200 border-[#226e3e]'}`}
                    >
                      正计时计数
                    </button>
                  </div>

                  <div className="bg-[#081c10] border-4 border-[#226e3e] rounded-2xl p-6 text-center shadow-[inset_4px_4px_0px_#000]">
                    <div className="text-3xl sm:text-4xl font-black text-[#ffd700] tracking-widest drop-shadow-[2px_2px_0px_#000]">
                      {timerMode === 'countdown' ? formatTime(timerSeconds) : formatTime(stopwatchSeconds)}
                    </div>
                    <div className="text-[10px] text-emerald-300 mt-2 font-bold uppercase">
                      {timerMode === 'countdown' ? '切后台/锁屏会自动计算真实流逝时间' : '后台挂起正计时计算中'}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`flex-1 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg border-2 ${
                        timerRunning 
                          ? 'bg-red-950 text-red-400 border-red-800' 
                          : 'bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] text-white border-[#ffd700]'
                      }`}
                    >
                      {timerRunning ? <><Pause size={16} /> 暂停计时</> : <><Play size={16} /> 开始计时</>}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (timerGoalId) {
                          handleCheckIn(timerGoalId);
                          alert('已手动向关联任务计入 1 小时！');
                        } else {
                          alert('请先选择一个关联任务');
                        }
                      }}
                      className="px-4 py-3.5 bg-[#081c10] hover:bg-[#1b4d2c] text-[#ffd700] border-2 border-[#226e3e] rounded-xl text-xs font-black"
                    >
                      手动+1h
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        <nav className="absolute bottom-0 left-0 right-0 bg-[#0f2d18]/95 backdrop-blur border-t-4 border-[#226e3e] px-8 py-3 flex justify-around items-center z-10">
          <button 
            onClick={() => { setMainTab('home'); setActiveGoalId(null); setIsEditingTitle(false); }}
            className={`flex flex-col items-center gap-1 transition-colors ${mainTab === 'home' && !activeGoalId ? 'text-[#ffd700]' : 'text-emerald-500 hover:text-emerald-300'}`}
          >
            <Home size={18} />
            <span className="text-[9px] font-bold">HOME</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-gradient-to-tr from-[#ca8a04] to-[#ffd700] hover:from-[#b45309] hover:to-[#eab308] text-[#081c10] rounded-full shadow-lg flex items-center justify-center -mt-6 transition-transform hover:scale-105 border-4 border-[#0f2d18] font-black text-xl"
          >
            +
          </button>

          <button 
            onClick={() => { setMainTab('stats'); setActiveGoalId(null); setIsEditingTitle(false); }}
            className={`flex flex-col items-center gap-1 transition-colors ${mainTab === 'stats' && !activeGoalId ? 'text-[#ffd700]' : 'text-emerald-500 hover:text-emerald-300'}`}
          >
            <BarChart2 size={18} />
            <span className="text-[9px] font-bold">STATS</span>
          </button>
        </nav>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-[#0f2d18] w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border-2 border-[#226e3e] animate-slideUp">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-[#ffd700]">🍄 创建新的 100 小时世界关卡</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-emerald-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-emerald-200 block mb-1">关卡任务名称</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：WORLD 3: 精通 TypeScript"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-[#081c10] text-white border-2 border-[#226e3e] rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#ffd700]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-200 block mb-1">分类 (可多选)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_CATEGORIES.map(cat => {
                      const isSelected = newCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => {
                            if (isSelected) {
                              if (newCategories.length > 1) {
                                setNewCategories(newCategories.filter(c => c !== cat));
                              }
                            } else {
                              setNewCategories([...newCategories, cat]);
                            }
                          }}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                            isSelected 
                              ? 'bg-[#ffd700] text-[#081c10] border-[#ffd700] font-black' 
                              : 'bg-[#081c10] text-emerald-200 border-[#226e3e]'
                          }`}
                        >
                          {cat} {isSelected ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-200 block mb-1">开始日期</label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={e => setNewStartDate(e.target.value)}
                      className="w-full bg-[#081c10] text-white border border-[#226e3e] rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#ffd700]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-200 block mb-1">预计结束</label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={e => setNewEndDate(e.target.value)}
                      className="w-full bg-[#081c10] text-white border border-[#226e3e] rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#ffd700]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-200 block mb-1">备注说明</label>
                  <input
                    type="text"
                    placeholder="通关秘籍 / 目标描述..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-[#081c10] text-white border border-[#226e3e] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#ffd700]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#ca8a04] to-[#ffd700] hover:from-[#b45309] hover:to-[#eab308] text-[#081c10] rounded-xl font-black text-xs shadow-lg border-2 border-white/20 transition-all mt-2"
                >
                  创建关卡
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
