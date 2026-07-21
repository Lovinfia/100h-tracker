import React, { useState, useEffect } from 'react';
import { 
  Trophy, CheckCircle2, Plus, 
  Home, BarChart2, BookOpen, 
  Dumbbell, Sparkles, Wrench, Coins, Zap, Trash2
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: 'wisdom' | 'body' | 'creativity' | 'skill' | 'wealth' | 'spirit';
  worldId: number;
  hours: number;
  targetHours: number;
  completed: boolean;
  date: string;
}

const WORLD_NAMES: Record<number, string> = {
  1: '深度阅读与学识构建',
  2: '核心体能与力量特训',
  3: '全栈创意与AI工程',
  4: '尖端技巧与实战演练',
  5: '财富认知与复利增长',
  6: '内在精神与心流重塑'
};

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  wisdom: { label: '智慧', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: BookOpen },
  body: { label: '体力', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Dumbbell },
  creativity: { label: '创造力', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Sparkles },
  skill: { label: '技巧', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Wrench },
  wealth: { label: '财富', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Coins },
  spirit: { label: '精神力', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: Zap },
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('super_100_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: '1', title: '精读技术专著与文献', category: 'wisdom', worldId: 1, hours: 18, targetHours: 100, completed: false, date: '2026-05-01' },
      { id: '2', title: '核心体能与力量特训', category: 'body', worldId: 2, hours: 45, targetHours: 100, completed: false, date: '2026-05-02' }
    ];
  });

  const [activeTab, setActiveTab] = useState<'home' | 'add' | 'stats'>('home');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<keyof typeof CATEGORY_LABELS>('wisdom');
  const [newWorldId, setNewWorldId] = useState<number>(1);
  const [newHours, setNewHours] = useState<number>(2);

  useEffect(() => {
    localStorage.setItem('super_100_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const totalHours = tasks.reduce((acc, t) => acc + (Number(t.hours) || 0), 0);
  const currentLevel = Math.floor(totalHours / 50) + 1;
  const currentExp = totalHours % 50;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      worldId: Number(newWorldId),
      hours: Number(newHours),
      targetHours: 100,
      completed: false,
      date: new Date().toISOString().split('T')[0]
    };

    setTasks([newTask, ...tasks]);
    setNewTitle('');
    setActiveTab('home');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus === 'ongoing' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  });

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-emerald-50/40 text-zinc-900 flex flex-col font-mono select-none">
      
      {/* 顶部标题栏：加入绿色主题基调 */}
      <header className="bg-white border-b-2 border-zinc-900 px-4 py-3 shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🍄</span>
          <h1 className="font-bold tracking-wider text-xs sm:text-base text-emerald-900">100 CHANGE EVERYTHING</h1>
        </div>
        <div className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
          v2.4
        </div>
      </header>

      {/* 中间主容器 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full pb-28">
        
        {/* 状态面板 */}
        <div className="bg-white border-2 border-zinc-900 rounded-lg p-4 mb-5 shadow-[4px_4px_0px_0px_#10b981]">
          <h2 className="text-xl font-black tracking-wide mb-2 text-emerald-900">SUPER 100 WORLD</h2>
          <div className="flex items-center space-x-4 text-sm font-bold border-t border-zinc-200 pt-2">
            <div className="flex items-center text-amber-600">
              <Trophy className="w-4 h-4 mr-1" />
              <span>LV.{currentLevel}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>COIN EXP: {totalHours}H</span>
                <span>NEXT LV: {currentExp}/50</span>
              </div>
              <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden border border-zinc-900">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${(currentExp / 50) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 首页打卡视图 */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-md border border-zinc-900 font-bold transition-all ${filterStatus === 'all' ? 'bg-emerald-700 text-white shadow-[2px_2px_0px_0px_#065f46]' : 'bg-white'}`}
              >
                全部
              </button>
              <button 
                onClick={() => setFilterStatus('ongoing')}
                className={`px-3 py-1.5 rounded-md border border-zinc-900 font-bold transition-all ${filterStatus === 'ongoing' ? 'bg-emerald-700 text-white shadow-[2px_2px_0px_0px_#065f46]' : 'bg-white'}`}
              >
                进行中
              </button>
              <button 
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-md border border-zinc-900 font-bold transition-all ${filterStatus === 'completed' ? 'bg-emerald-700 text-white shadow-[2px_2px_0px_0px_#065f46]' : 'bg-white'}`}
              >
                已完成
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button 
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded border border-zinc-900 whitespace-nowrap ${filterCategory === 'all' ? 'bg-emerald-800 text-white' : 'bg-white'}`}
              >
                全部类别
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={`px-2.5 py-1 rounded border border-zinc-950 whitespace-nowrap ${filterCategory === key ? 'bg-emerald-800 text-white' : 'bg-white'}`}
                >
                  {val.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 bg-white border-2 border-dashed border-zinc-300 rounded-lg text-xs">
                  暂无打卡记录，点击下方 [+] 添加新目标吧！
                </div>
              ) : (
                filteredTasks.map(task => {
                  const catInfo = CATEGORY_LABELS[task.category] || CATEGORY_LABELS.wisdom;
                  return (
                    <div 
                      key={task.id} 
                      className={`bg-white border-2 border-zinc-900 rounded-lg p-3.5 shadow-[3px_3px_0px_0px_#10b981] flex items-center justify-between transition-all ${task.completed ? 'opacity-60 bg-zinc-50' : ''}`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={`mt-0.5 w-6 h-6 rounded border-2 border-zinc-900 flex items-center justify-center shrink-0 ${task.completed ? 'bg-emerald-600 text-white' : 'bg-white'}`}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-[11px] px-2.5 py-0.5 rounded border ${catInfo.color} font-bold`}>
                              {catInfo.label}
                            </span>
                            <span className="text-[10px] text-zinc-500 truncate">
                              WORLD {task.worldId}: {WORLD_NAMES[task.worldId]}
                            </span>
                          </div>
                          <h3 className={`font-bold text-sm truncate ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                            {task.title}
                          </h3>
                          <div className="text-[11px] text-zinc-500 mt-1 flex items-center space-x-3">
                            <span>已投入: <strong className="text-zinc-900">+{task.hours}H</strong></span>
                            <span>日期: {task.date}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="ml-3 p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 添加打卡视图 */}
        {activeTab === 'add' && (
          <div className="bg-white border-2 border-zinc-900 rounded-lg p-5 shadow-[4px_4px_0px_0px_#10b981]">
            <h2 className="text-base font-black mb-4 flex items-center text-emerald-900">
              <Plus className="w-5 h-5 mr-1" /> 记录新的 100 小时突破
            </h2>
            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">打卡内容/项目名称</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="例如：系统性阅读设计模式..."
                  className="w-full border-2 border-zinc-900 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">所属分类</label>
                  <select 
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full border-2 border-zinc-900 rounded px-2 py-2 text-xs bg-white focus:outline-none"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">目标世界 (World)</label>
                  <select 
                    value={newWorldId}
                    onChange={e => setNewWorldId(Number(e.target.value))}
                    className="w-full border-2 border-zinc-900 rounded px-2 py-2 text-xs bg-white focus:outline-none"
                  >
                    {Object.entries(WORLD_NAMES).map(([id, name]) => (
                      <option key={id} value={id}>World {id}: {name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">本次投入时长 (小时)</label>
                <input 
                  type="number"
                  min="1"
                  max="24"
                  value={newHours}
                  onChange={e => setNewHours(Number(e.target.value))}
                  className="w-full border-2 border-zinc-900 rounded px-3 py-2 text-sm focus:outline-none"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-700 text-white font-bold py-3 rounded border-2 border-zinc-900 shadow-[3px_3px_0px_0px_#065f46] hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-sm"
              >
                确认保存打卡
              </button>
            </form>
          </div>
        )}

        {/* 统计数据视图（带六维进度条） */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-zinc-900 rounded-lg p-5 shadow-[4px_4px_0px_0px_#10b981]">
              <h2 className="text-base font-black mb-3 flex items-center text-emerald-900">
                <BarChart2 className="w-5 h-5 mr-2" /> 总体数据统计
              </h2>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded">
                  <div className="text-[11px] text-zinc-500">累计投入总时间</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{totalHours} <span className="text-xs font-normal">小时</span></div>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded">
                  <div className="text-[11px] text-zinc-500">完成打卡总项数</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{tasks.filter(t => t.completed).length} <span className="text-xs font-normal">项</span></div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-zinc-900 rounded-lg p-5 shadow-[4px_4px_0px_0px_#10b981]">
              <h3 className="font-bold text-xs mb-3 text-emerald-900">六大世界进度概览</h3>
              <div className="space-y-3 text-xs">
                {Object.entries(WORLD_NAMES).map(([id, name]) => {
                  const worldHours = tasks.filter(t => t.worldId === Number(id)).reduce((acc, t) => acc + t.hours, 0);
                  const progress = Math.min((worldHours / 100) * 100, 100);
                  return (
                    <div key={id}>
                      <div className="flex justify-between mb-1 font-bold text-[11px]">
                        <span>W{id}: {name}</span>
                        <span>{worldHours} / 100 H</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded border border-zinc-900 overflow-hidden">
                        <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 底部导航栏 */}
      <nav className="shrink-0 bg-white border-t-2 border-zinc-900 px-6 py-2 pb-6 flex justify-around items-center z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-4 rounded font-bold transition-all ${activeTab === 'home' ? 'text-emerald-700 bg-emerald-50 border border-emerald-300' : 'text-zinc-500'}`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">首页</span>
        </button>

        <button 
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center py-1 px-4 rounded font-bold transition-all ${activeTab === 'add' ? 'text-emerald-700 bg-emerald-50 border border-emerald-300' : 'text-zinc-500'}`}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center mb-0.5 text-xs font-black">+</div>
          <span className="text-[10px]">记录</span>
        </button>

        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center py-1 px-4 rounded font-bold transition-all ${activeTab === 'stats' ? 'text-emerald-700 bg-emerald-50 border border-emerald-300' : 'text-zinc-500'}`}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">统计</span>
        </button>
      </nav>

    </div>
  );
}
