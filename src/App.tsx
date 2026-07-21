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

// 你的彩色标签定义，已复原
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
    // 演示数据
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

  // 计算六维数据
  const worldStats = Object.keys(WORLD_NAMES).map(id => {
    const worldIdNum = Number(id);
    const hours = tasks.filter(t => t.worldId === worldIdNum).reduce((acc, t) => acc + t.hours, 0);
    return { id: id, name: WORLD_NAMES[worldIdNum], hours: hours, percentage: Math.min((hours / 100) * 100, 100) };
  });

  return (
    /* 完美适配 iPhone 底部安全区 */
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#f4f4f0] text-zinc-900 flex flex-col font-mono select-none">
      
      {/* 顶部标题栏 */}
      <header className="bg-white border-b-2 border-zinc-900 px-4 py-3 shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🍄</span>
          <h1 className="font-bold tracking-wider text-xs sm:text-base">100 CHANGE EVERYTHING</h1>
        </div>
        <div className="text-[10px] bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded">
          v2.3
        </div>
      </header>

      {/* 中间主容器：内部可滚动 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full pb-28">
        
        {/* 状态面板 */}
        <div className="bg-white border-2 border-zinc-900 rounded-lg p-4 mb-5 shadow-[4px_4px_0px_0px_#18181b]">
          <h2 className="text-xl font-black tracking-wide mb-2">SUPER 100 WORLD</h2>
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
                className={`px-3 py-1.5 rounded-md border border-zinc-900 font-bold transition-all ${filterStatus === 'all' ? 'bg-zinc-900 text-white shadow-[2px_2px_0px_0px_#71717a]' : 'bg-white'}`}
              >
                全部
              </button>
              <button 
                onClick={() => setFilterStatus('ongoing')}
                className={`px-3 py-1.5 rounded-md border border-zinc-900 font-bold transition-all ${filterStatus === 'ongoing' ? 'bg-zinc-900 text-white shadow-[2px_2px_0px_0px_#71717a]' : 'bg-white'}`}
              >
                进行中
              </button>
              <button 
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-md border border-zinc-900 font-bold transition-all ${filterStatus === 'completed' ? 'bg-zinc-900 text-white shadow-[2px_2px_0px_0px_#71717a]' : 'bg-white'}`}
              >
                已完成
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button 
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded border border-zinc-900 whitespace-nowrap ${filterCategory === 'all' ? 'bg-zinc-800 text-white' : 'bg-white'}`}
              >
                全部类别
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={`px-2.5 py-1 rounded border border-zinc-950 whitespace-nowrap ${filterCategory === key ? 'bg-zinc-800 text-white' : 'bg-white'}`}
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
                      className={`bg-white border-2 border-zinc-900 rounded-lg p-3.5 shadow-[3px_3px_0px_0px_#18181b] flex items-center justify-between transition-all ${task.completed ? 'opacity-60 bg-zinc-50' : ''}`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={`mt-0.5 w-6 h-6 rounded border-2 border-zinc-900 flex items-center justify-center shrink-0 ${task.completed ? 'bg-emerald-500 text-white' : 'bg-white'}`}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {/* 恢复彩色标签 */}
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
          <div className="bg-white border-2 border-zinc-900 rounded-lg p-5 shadow-[4px_4px_0px_0px_#18181b]">
            <h2 className="text-base font-black mb-4 flex items-center">
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
                  className="w-full border-2 border-zinc-900 rounded px-3 py-2 text-sm focus:outline-none"
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
                  onChange={e => setNewHours(Number(
