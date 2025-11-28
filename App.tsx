import React, { useState, useMemo } from 'react';
import { Settings, Play, BarChart2, CheckSquare, RefreshCw, FileText, Key } from 'lucide-react';
import { SECTION_CONFIGS } from './constants';
import { generateSectionContent } from './services/apiService';
import SectionRow from './components/SectionRow';
import { GeneratedContent, KeywordDensity } from './types';

function App() {
  // --- State ---
  const [userApiKey, setUserApiKey] = useState('');
  const [mandatoryKeywords, setMandatoryKeywords] = useState('');
  const [optionalKeywords, setOptionalKeywords] = useState('');
  
  // Separate density targets
  const [mandatoryTargetDensity, setMandatoryTargetDensity] = useState<number>(2);
  const [optionalTargetDensity, setOptionalTargetDensity] = useState<number>(1);
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>(SECTION_CONFIGS.map(s => s.id));
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    SECTION_CONFIGS.forEach(s => {
      if (s.hasCount && s.defaultCount) defaults[s.id] = s.defaultCount;
    });
    return defaults;
  });

  const [generatedResults, setGeneratedResults] = useState<Record<string, GeneratedContent>>({});
  const [isGlobalGenerating, setIsGlobalGenerating] = useState(false);
  const [generatingSectionId, setGeneratingSectionId] = useState<string | null>(null);
  const [showDensityModal, setShowDensityModal] = useState(false);

  // --- Helpers ---
  const countWords = (str: string) => {
    return str.trim().split(/\s+/).length;
  };

  const getRandomOptionalKeywords = (keywordsStr: string): string[] => {
    const list = keywordsStr.split(/[,，\n]/).map(s => s.trim()).filter(Boolean);
    if (list.length === 0) return [];
    if (list.length <= 2) return list;
    // Fisher-Yates shuffle
    const shuffled = [...list];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 2);
  };

  const buildPromptForSection = (sectionId: string, isRewrite: boolean = false, rewriteCustom?: string, rewriteWordCount?: string) => {
    const config = SECTION_CONFIGS.find(s => s.id === sectionId);
    if (!config) return '';

    let prompt = config.basePrompt;

    // Inject Count
    if (config.hasCount) {
      const count = sectionCounts[sectionId] || config.defaultCount || 3;
      prompt = prompt.replace(/{{COUNT}}/g, count.toString());
    }

    // Inject Keywords
    const mandatory = mandatoryKeywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean);
    const optional = getRandomOptionalKeywords(optionalKeywords); // Randomly pick for this generation

    const keywordInstruction = `
    [SEO Instructions]
    - Mandatory Keywords (MUST include these words): ${mandatory.join(', ')}
    - Selected Optional Keywords (Try to include): ${optional.join(', ')}
    - Target Mandatory Keyword Density for the entire page is approx ${mandatoryTargetDensity}%.
    - Target Optional Keyword Density for the entire page is approx ${optionalTargetDensity}%.
    `;
    
    prompt += keywordInstruction;

    // Inject Custom Prompt (Global)
    if (customPrompt) {
      prompt += `\n\n[Additional User Instructions]: ${customPrompt}`;
    }

    // Inject Rewrite Instructions
    if (isRewrite) {
        prompt += `\n\n[REWRITE INSTRUCTION]
        This is a specific rewrite request for this section ONLY.
        Focus on these specific changes: ${rewriteCustom || 'Improve quality'}.
        ${rewriteWordCount ? `Target word count for this section: ${rewriteWordCount}` : ''}
        `;
    }

    return prompt;
  };

  // --- Actions ---

  const handleGenerateAll = async () => {
    setIsGlobalGenerating(true);
    setGeneratedResults({}); // Clear previous results

    // Process sequentially
    for (let i = 0; i < selectedSections.length; i++) {
        const sectionId = selectedSections[i];
        setGeneratingSectionId(sectionId);
        
        try {
            // Add a polite delay between requests to avoid hitting rate limits (throttle)
            // Skip delay for the very first request
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            const prompt = buildPromptForSection(sectionId);
            const result = await generateSectionContent({ prompt, apiKey: userApiKey });
            
            setGeneratedResults(prev => ({
                ...prev,
                [sectionId]: {
                    sectionId,
                    english: result.english,
                    chinese: result.chinese,
                    wordCount: countWords(result.english),
                    charCount: result.english.length,
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.error(`Error generating ${sectionId}:`, error);
            // Optionally add an error state marker to the result here
        }
    }
    setGeneratingSectionId(null);
    setIsGlobalGenerating(false);
  };

  const handleRewriteSection = async (sectionId: string, customInstruction: string, wordCount: string) => {
    setGeneratingSectionId(sectionId);
    try {
        const prompt = buildPromptForSection(sectionId, true, customInstruction, wordCount);
        const result = await generateSectionContent({ prompt, apiKey: userApiKey });

        setGeneratedResults(prev => ({
            ...prev,
            [sectionId]: {
                sectionId,
                english: result.english,
                chinese: result.chinese,
                wordCount: countWords(result.english),
                charCount: result.english.length,
                timestamp: Date.now()
            }
        }));
    } catch (e) {
        console.error(e);
        alert("重写失败，请稍后重试 (可能触发了频率限制)");
    } finally {
        setGeneratingSectionId(null);
    }
  };

  const toggleSection = (id: string) => {
    setSelectedSections(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // --- Density Calculation ---
  const calculatedDensity: KeywordDensity[] = useMemo(() => {
    const allText = Object.values(generatedResults).map((r: GeneratedContent) => r.english).join(' ').toLowerCase();
    const totalWords = countWords(allText);
    
    if (totalWords === 0) return [];

    const mandatory = mandatoryKeywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean);
    const optional = optionalKeywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean);

    const calc = (keywords: string[], isMandatory: boolean) => {
        return keywords.map(kw => {
            // Simple regex for exact word match, handling punctuation boundaries
            const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'g');
            const match = allText.match(regex);
            const count = match ? match.length : 0;
            return {
                keyword: kw,
                count,
                density: ((count / totalWords) * 100).toFixed(2) + '%',
                isMandatory
            };
        });
    };

    return [...calc(mandatory, true), ...calc(optional, false)];
  }, [generatedResults, mandatoryKeywords, optionalKeywords]);

  const mandatoryDensitySum = useMemo(() => {
    return calculatedDensity
        .filter(d => d.isMandatory)
        .reduce((acc, curr) => acc + parseFloat(curr.density), 0)
        .toFixed(2) + '%';
  }, [calculatedDensity]);

  const optionalDensitySum = useMemo(() => {
    return calculatedDensity
        .filter(d => !d.isMandatory)
        .reduce((acc, curr) => acc + parseFloat(curr.density), 0)
        .toFixed(2) + '%';
  }, [calculatedDensity]);


  // --- Render ---

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">AI SEO 文案助手 <span className="text-indigo-600 text-sm font-normal bg-indigo-50 px-2 py-0.5 rounded-full ml-2">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="输入自定义 API Key (可选)"
                  className="pl-10 pr-3 py-1.5 border border-gray-300 rounded-md text-sm w-48 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <div className="absolute right-0 top-10 w-64 bg-gray-800 text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    如不填入，将使用系统默认 Key。
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Configuration */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Keywords Panel */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> 关键词配置 (SEO Configuration)
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">必须埋入词 (Mandatory)</label>
                        <textarea 
                            className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="例如: seo tool, ai writing..."
                            value={mandatoryKeywords}
                            onChange={e => setMandatoryKeywords(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">可选埋入词池 (Optional Pool)</label>
                        <textarea 
                            className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="例如: efficiency, fast, rank..."
                            value={optionalKeywords}
                            onChange={e => setOptionalKeywords(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">AI 将从池中随机抽取 1-2 个词埋入每个 Section。</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">必须词目标密度 (%)</label>
                             <input 
                                type="number" 
                                step="0.1"
                                value={mandatoryTargetDensity}
                                onChange={e => setMandatoryTargetDensity(parseFloat(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">可选词目标密度 (%)</label>
                             <input 
                                type="number" 
                                step="0.1"
                                value={optionalTargetDensity}
                                onChange={e => setOptionalTargetDensity(parseFloat(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                             />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections Panel */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                 <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" /> 区域选择 (Sections)
                </h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {SECTION_CONFIGS.map(section => (
                        <div key={section.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id={section.id}
                                    checked={selectedSections.includes(section.id)}
                                    onChange={() => toggleSection(section.id)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor={section.id} className="text-sm text-gray-700 cursor-pointer select-none font-medium">
                                    {section.label}
                                </label>
                            </div>
                            {section.hasCount && selectedSections.includes(section.id) && (
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-gray-400">{section.countLabel}:</span>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="20"
                                        className="w-12 text-xs border border-gray-300 rounded px-1 py-0.5 text-center"
                                        value={sectionCounts[section.id] || section.defaultCount || 0}
                                        onChange={(e) => setSectionCounts(prev => ({ ...prev, [section.id]: parseInt(e.target.value) }))}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Prompt */}
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                    自定义额外提示词 (Custom Instructions)
                </h2>
                <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md text-sm h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder="例如：保持非常专业的语气，避免使用过于夸张的形容词..."
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                />
            </div>

            {/* Main Action */}
            <button
                onClick={handleGenerateAll}
                disabled={isGlobalGenerating}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isGlobalGenerating ? (
                    <>
                        <RefreshCw className="animate-spin w-5 h-5" /> 生成中 (Generating)...
                    </>
                ) : (
                    <>
                        <Play className="w-5 h-5" /> 一键生成文案
                    </>
                )}
            </button>
        </div>

        {/* Right Content: Results */}
        <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">生成结果 (Results)</h2>
                <button 
                    onClick={() => setShowDensityModal(true)}
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition shadow-sm font-medium text-sm"
                >
                    <BarChart2 className="w-4 h-4" /> 密度自检 (Check Density)
                </button>
            </div>

            {selectedSections.length === 0 && (
                <div className="bg-gray-100 rounded-xl p-12 text-center text-gray-500 border-2 border-dashed border-gray-300">
                    <p>请在左侧选择需要生成的 Section，并点击生成按钮。</p>
                </div>
            )}

            <div className="space-y-8">
                {selectedSections.map(sectionId => {
                    const config = SECTION_CONFIGS.find(s => s.id === sectionId);
                    const content = generatedResults[sectionId];
                    const isProcessing = generatingSectionId === sectionId;

                    if (!content && !isProcessing) return null;

                    if (isProcessing) {
                        return (
                            <div key={sectionId} className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
                                <RefreshCw className="animate-spin text-indigo-500 w-8 h-8 mb-4" />
                                <h3 className="text-gray-600 font-medium">正在生成 {config?.label}...</h3>
                                <p className="text-xs text-gray-400 mt-2">AI 正在撰写 SEO 优化文案</p>
                            </div>
                        );
                    }

                    return (
                        <SectionRow 
                            key={sectionId}
                            label={config?.label || sectionId}
                            content={content}
                            onRewrite={(instruction, count) => handleRewriteSection(sectionId, instruction, count)}
                            isRewriting={generatingSectionId === sectionId}
                            sectionId={sectionId}
                        />
                    );
                })}
            </div>
        </div>
      </main>

      {/* Density Modal */}
      {showDensityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-emerald-600" />
                        关键词密度报告 (Keyword Density)
                    </h3>
                    <button onClick={() => setShowDensityModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                            <h4 className="text-xs font-semibold text-red-800 uppercase mb-1">必须词总密度</h4>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-red-900">{mandatoryDensitySum}</span>
                                <span className="text-xs text-red-600 mb-1">目标: {mandatoryTargetDensity}%</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h4 className="text-xs font-semibold text-blue-800 uppercase mb-1">可选词总密度</h4>
                             <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-blue-900">{optionalDensitySum}</span>
                                <span className="text-xs text-blue-600 mb-1">目标: {optionalTargetDensity}%</span>
                            </div>
                        </div>
                    </div>

                    {calculatedDensity.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">暂无生成内容可供分析。</p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-md">类型</th>
                                    <th className="px-4 py-3">关键词</th>
                                    <th className="px-4 py-3">出现次数</th>
                                    <th className="px-4 py-3 rounded-tr-md">密度</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {calculatedDensity.map((k, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {k.isMandatory ? (
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">必须 (Mandatory)</span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">可选 (Optional)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{k.keyword}</td>
                                        <td className="px-4 py-3 text-gray-600">{k.count}</td>
                                        <td className={`px-4 py-3 font-mono font-bold ${parseFloat(k.density) > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {k.density}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    
                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg text-xs text-yellow-800 border border-yellow-100">
                        <strong>注意:</strong> 密度计算基于当前所有生成内容的英文单词总数。建议生成完所有 Section 后再查看。
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => setShowDensityModal(false)}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition"
                    >
                        关闭 (Close)
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;