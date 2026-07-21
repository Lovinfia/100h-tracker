import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Zap, Shield, Target, Award, Clock, Play, Pause, 
  RotateCcw, CheckCircle2, Plus, Edit2, Download, Upload, 
  Settings, Flame, Compass, Sparkles, Smartphone, Monitor
} from 'lucide-react';

// 像素风格主题配色与基础常量
const COLS = 10;
const ROWS = 10;
const TOTAL_BLOCKS = COLS * ROWS; // 100网格

export default function PixelRPGTracker() {
  // --- 状态管理 ---
  const [completedBlocks, setCompletedBlocks] = useState(() => {
    const saved = localStorage.getItem('rpg_completed_blocks');
    return saved ? JSON.parse(saved) : Array(TOTAL_BLOCKS).fill(false);
  });

  const [projectTitle, setProjectTitle] = useState(() => {
    return localStorage.getItem('rpg_project_title') || '100小时像素逆袭计划';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);

  // 雷达六维属性
  const [attributes, setAttributes] = useState(() => {
    const saved = localStorage.getItem('rpg_attributes');
    return saved ? JSON.parse(saved) : {
      strength: 12,
      intelligence: 15,
      agility: 10,
      vitality: 14,
      creativity: 13,
      spirit: 11
    };
  });

  // 计时器状态
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('intelligence');
  
  // 导入导出弹窗状态
  const [showDataModal, setShowDataModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const fileInputRef = useRef(null);

  // --- 存储同步 ---
  useEffect(() => {
    localStorage.setItem('rpg_completed_blocks', JSON.stringify(completedBlocks));
  }, [completedBlocks]);

  useEffect(() => {
    localStorage.setItem('rpg_project_title', projectTitle);
  }, [projectTitle]);

  useEffect(() => {
    localStorage.setItem('rpg_attributes', JSON.stringify(attributes));
  }, [attributes]);

  // --- 计时器逻辑 ---
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- 打卡网格交互 ---
  const handleBlockClick = (index) => {
    const updated = [...completedBlocks];
    const isNowCompleted = !updated[index];
    updated[index] = isNowCompleted;
    setCompletedBlocks(updated);

    // 联动增加对应属性
    if (isNowCompleted) {
      setAttributes(prev => ({
        ...prev,
        [selectedCategory]: prev[selectedCategory] + 1
      }));
    } else {
      setAttributes(prev => ({
        ...prev,
        [selectedCategory]: Math.max(0, prev[selectedCategory] - 1)
      }));
    }
  };

  // --- 数据导入导出逻辑 ---
  const handleExportData = () => {
    const exportData = {
      projectTitle,
      completedBlocks,
      attributes,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rpg_tracker_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.completedBlocks && parsed.attributes) {
          setCompletedBlocks(parsed.completedBlocks);
          setAttributes(parsed.attributes);
          if (parsed.projectTitle) setProjectTitle(parsed.projectTitle);
          alert('数据导入成功！');
          setShowDataModal(false);
        } else {
          alert('文件格式错误：缺少必要的数据字段。');
        }
      } catch (err) {
        alert('解析 JSON 文件失败，请检查文件格式。');
      }
    };
    reader.readAsText(file);
  };

  const handleImportJsonText = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (parsed.completedBlocks && parsed.attributes) {
        setCompletedBlocks(parsed.completedBlocks);
        setAttributes(parsed.attributes);
        if (parsed.projectTitle) setProjectTitle(parsed.projectTitle);
        alert('数据导入成功！');
        setShowDataModal(false);
        setImportJsonText('');
      } else {
        alert('JSON 结构不匹配，导入失败。');
      }
    } catch (e) {
      alert('JSON 文本格式有误。');
    }
  };

  const completedCount = completedBlocks.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / TOTAL_BLOCKS) * 100);

  const attributeLabels = {
    strength: '力量 (STR)',
    intelligence: '智力 (INT)',
    agility: '敏捷 (AGI)',
    vitality: '耐力 (VIT)',
    creativity: '创造 (CRE)',
    spirit: '意志 (SPR)'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono flex flex-col items-center p-3 sm:p-6 overflow-y-auto">
      
      {/* 顶栏：项目标题与数据备份入口 */}
      <header className="w-full max-w-4xl bg-slate-900 border-4 border-slate-700 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-amber-500 p-2 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-slate-950">
            <Trophy size={24} />
          </div>
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="bg-slate-950 border-2 border-amber-400 px-2 py-1 text-sm text-white focus:outline-none"
                />
                <button 
                  onClick={() => { setProjectTitle(tempTitle); setIsEditingTitle(false); }}
                  className="bg-emerald-600 px-2 py-1 text-xs border border-white hover:bg-emerald-500"
                >
                  保存
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-wider text-amber-400">{projectTitle}</h1>
                <button 
                  onClick={() => { setTempTitle(projectTitle); setIsEditingTitle(true); }}
                  className="text-slate-400 hover:text-white"
                  title="修改标题"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400">PIXEL RPG HABIT TRACKER V2.0</p>
          </div>
        </div>

        <button 
          onClick={() => setShowDataModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all text-sm font-bold"
        >
          <Settings size={16} /> 数据导入 / 导出
        </button>
      </header>

      {/* 主面板区域 */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 左侧：雷达属性与计时器 */}
        <div className="md:col-span-1 flex flex-col gap-6">
          
          {/* 计时器卡片 */}
          <div className="bg-slate-900 border-4 border-slate-700 p-4 shadow-[4px_4px_0px_0px_rgba(51,65,85,1)]">
            <div className="flex items-center justify-between mb-3 border-b-2 border-slate-800 pb-2">
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Clock size={14} /> 专注训练场
              </span>
              <span className="text-xs text-slate-400">累计时长</span>
            </div>
            
            <div className="text-3xl font-bold text-center tracking-widest my-4 text-emerald-400 font-mono">
              {formatTime(seconds)}
            </div>

            <div className="flex gap-2 justify-center mb-4">
              <button 
                onClick={() => setIsActive(!isActive)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 border-2 border-slate-950 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  isActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isActive ? <><Pause size={14} /> 暂停</> : <><Play size={14} /> 开始</>}
              </button>
              <button 
                onClick={() => { setIsActive(false); setSeconds(0); }}
                className="flex items-center justify-center p-2 bg-rose-600 hover:bg-rose-500 text-white border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                title="重置计时"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {/* 训练归属属性选择 */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block">打卡挂钩属性：</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 p-2 text-xs text-amber-300 focus:outline-none"
              >
                {Object.entries(attributeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 六维属性面板 */}
          <div className="bg-slate-900 border-4 border-slate-700 p-4 shadow-[4px_4px_0px_0px_rgba(51,65,85,1)]">
            <h2 className="text-xs font-bold text-amber-400 mb-3 border-b-2 border-slate-800 pb-2 flex items-center gap-1">
              <Shield size={14} /> 角色六维属性值
            </h2>
            <div className="space-y-2">
              {Object.entries(attributes).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">{attributeLabels[key]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-950 h-3 border border-slate-700 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (val / 50) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-amber-400 w-6 text-right">{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 右侧：100小时像素网格打卡主区 */}
        <div className="md:col-span-2 bg-slate-900 border-4 border-slate-700 p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,1)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b-2 border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1">
                  <Target size={16} /> 100区块网格打卡图 ({completedCount}/{TOTAL_BLOCKS})
                </h2>
                <p className="text-xs text-slate-400">点击格子代表完成1小时投入，同时为当前属性加点</p>
              </div>
              <div className="bg-slate-950 border-2 border-amber-500 px-3 py-1 text-amber-400 font-bold text-xs">
                进度: {progressPercent}%
              </div>
            </div>

            {/* 10x10 像素风格网格 */}
            <div className="grid grid-cols-10 gap-1.5 bg-slate-950 p-3 border-2 border-slate-800 my-4">
              {completedBlocks.map((isCompleted, index) => (
                <button
                  key={index}
                  onClick={() => handleBlockClick(index)}
                  title={`区块 #${index + 1} - ${isCompleted ? '已完成' : '未完成'}`}
                  className={`aspect-square border transition-all flex items-center justify-center text-[10px] font-bold ${
                    isCompleted 
                      ? 'bg-amber-500 border-slate-950 text-slate-950 shadow-[inset_2px_2px_0px_0px_rgba(255,255,255,0.4)]' 
                      : 'bg-slate-900 border-slate-700 text-slate-600 hover:border-amber-400/50 hover:bg-slate-800'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950 p-3 border border-slate-800 flex items-center justify-between">
            <span>当前打卡挂钩属性：<strong className="text-amber-400">{attributeLabels[selectedCategory]}</strong></span>
            <span className="text-emerald-400 font-bold">坚持就是胜利！</span>
          </div>
        </div>

      </main>

      {/* 数据导入 / 导出弹窗 */}
      {showDataModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-4 border-slate-700 w-full max-w-lg p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Settings size={18} /> 数据管理中心
              </h3>
              <button 
                onClick={() => setShowDataModal(false)}
                className="text-slate-400 hover:text-white font-bold px-2 py-1 bg-slate-800 border border-slate-600 text-xs"
              >
                关闭
              </button>
            </div>

            {/* 导出区域 */}
            <div className="space-y-2 bg-slate-950 p-3 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300">1. 导出本地数据备份</h4>
              <p className="text-[11px] text-slate-400">将当前的 100 网格进度、雷达属性及项目名称保存为一个 JSON 备份文件。</p>
              <button 
                onClick={handleExportData}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-xs border-2 border-slate-950 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Download size={14} /> 导出为 JSON 文件
              </button>
            </div>

            {/* 导入本地文件区域 */}
            <div className="space-y-2 bg-slate-950 p-3 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300">2. 从文件导入备份</h4>
              <p className="text-[11px] text-slate-400">选择之前导出的 JSON 备份文件恢复数据。</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:border-2 file:border-slate-950 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
            </div>

            {/* 粘贴文本导入区域 */}
            <div className="space-y-2 bg-slate-950 p-3 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300">3. 粘贴 JSON 文本导入</h4>
              <textarea 
                rows={3}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="在此处粘贴你的 JSON 数据代码..."
                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white focus:outline-none"
              />
              <button 
                onClick={handleImportJsonText}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 text-xs border-2 border-slate-950 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Upload size={14} /> 确认文本导入
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
