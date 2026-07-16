import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Send, 
  RefreshCw, 
  ArrowUpRight, 
  Tag, 
  Compass, 
  HelpCircle, 
  Bookmark, 
  Layers, 
  Award,
  BookMarked
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  CartesianGrid
} from 'recharts';

// Define TS Interfaces based on API response
interface Book {
  rank: number;
  title: string;
  subtitle: string;
  link: string;
  author: string;
  publisher: string;
  pubDate: string;
  price: number;
  cost: number;
  salesIndex: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendedBooks?: Book[];
}

export default function App() {
  // Application State
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  
  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'chat'>('dashboard');
  
  // Search & Filter State
  const [globalSearch, setAllSearch] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('전체');

  // Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '안녕하세요! **BiblioInsight AI** 도서 추천 어시스턴트입니다. 📚\n\n대한민국 최신 IT 및 개발, 인공지능 관련 도서 1,000권의 정보가 완벽하게 데이터베이스화되어 있습니다. 관심 있는 분야(예: *초보자 코딩 공부*, *클로드 코드 실무*, *업무자동화 엑셀*)나 특정 도서에 대해 자유롭게 질문해 보세요! 딱 맞는 맞춤 도서를 RAG 기술로 정밀 검색하여 추천해 드립니다.',
      timestamp: '방금 전'
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatCount, setChatCount] = useState<number>(1);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Book Stats and lists from backend API on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch stats from API
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setStats(data);
      setAllBooks(data.allBooks || []);
      setFilteredBooks(data.allBooks || []);
    } catch (err) {
      console.error('Failed to fetch books data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search & filter updates
  useEffect(() => {
    if (!allBooks.length) return;

    let result = [...allBooks];

    // Filter by genre classification
    if (selectedGenre !== '전체') {
      result = result.filter(book => {
        const text = (book.title + ' ' + book.subtitle).toLowerCase();
        if (selectedGenre === 'AI/인공지능') {
          return text.includes('ai') || text.includes('인공지능') || text.includes('제미나이') || text.includes('클로드') || text.includes('gpt') || text.includes('챗gpt') || text.includes('llm') || text.includes('에이전트');
        } else if (selectedGenre === '프로그래밍') {
          return text.includes('코딩') || text.includes('프로그래밍') || text.includes('파이썬') || text.includes('c언어') || text.includes('자바') || text.includes('리액트') || text.includes('개발자') || text.includes('알고리즘') || text.includes('html') || text.includes('css');
        } else if (selectedGenre === '업무자동화') {
          return text.includes('엑셀') || text.includes('스프레드시트') || text.includes('업무') || text.includes('노션') || text.includes('자동화') || text.includes('파워포인트') || text.includes('한글') || text.includes('office') || text.includes('n8n') || text.includes('zapier');
        } else if (selectedGenre === '디자인/미디어') {
          return text.includes('디자인') || text.includes('드로잉') || text.includes('일러스트') || text.includes('포토샵') || text.includes('피그마') || text.includes('캔바') || text.includes('이모티콘') || text.includes('스케치업') || text.includes('블렌더') || text.includes('영상') || text.includes('유튜브') || text.includes('쇼츠') || text.includes('캡컷');
        } else {
          // 기타 IT/교양
          const isAI = text.includes('ai') || text.includes('인공지능') || text.includes('제미나이') || text.includes('클로드') || text.includes('gpt') || text.includes('챗gpt') || text.includes('llm') || text.includes('에이전트');
          const isProg = text.includes('코딩') || text.includes('프로그래밍') || text.includes('파이썬') || text.includes('c언어') || text.includes('자바') || text.includes('리액트') || text.includes('개발자') || text.includes('알고리즘') || text.includes('html') || text.includes('css');
          const isAuto = text.includes('엑셀') || text.includes('스프레드시트') || text.includes('업무') || text.includes('노션') || text.includes('자동화') || text.includes('파워포인트') || text.includes('한글') || text.includes('office') || text.includes('n8n') || text.includes('zapier');
          const isDesign = text.includes('디자인') || text.includes('드로잉') || text.includes('일러스트') || text.includes('포토샵') || text.includes('피그마') || text.includes('캔바') || text.includes('이모티콘') || text.includes('스케치업') || text.includes('블렌더') || text.includes('영상') || text.includes('유튜브') || text.includes('쇼츠') || text.includes('캡컷');
          return !isAI && !isProg && !isAuto && !isDesign;
        }
      });
    }

    // Filter by global search term
    if (globalSearch.trim() !== '') {
      const term = globalSearch.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(term) || 
        book.subtitle.toLowerCase().includes(term) || 
        book.author.toLowerCase().includes(term) || 
        book.publisher.toLowerCase().includes(term)
      );
    }

    setFilteredBooks(result);
  }, [globalSearch, selectedGenre, allBooks]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  // Send message to AI Advisor (RAG chatbot)
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim() || chatLoading) return;

    if (!textToSend) {
      setChatInput('');
    }

    // Create user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatLoading(true);
    setChatCount(prev => prev + 1);

    try {
      // Setup payload matching backend
      const payloadHistory = chatHistory
        .filter(h => h.id !== 'welcome')
        .map(h => ({
          role: h.role,
          content: h.content
        }));

      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: payloadHistory
        })
      });

      const data = await response.json();

      if (response.ok) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedBooks: data.recommendedBooks
        };
        setChatHistory(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Response error');
      }
    } catch (err: any) {
      console.error('Failed to get recommendation:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ **오류가 발생했습니다:**\n\n${err.message || 'Gemini API 호출에 실패했습니다. 비밀 설정에 GEMINI_API_KEY가 등록되어 있는지 다시 확인해 주세요.'}`,
        timestamp: '방금 전'
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Clear Chat history
  const handleClearChat = () => {
    setChatHistory([
      {
        id: 'welcome',
        role: 'assistant',
        content: '대화 기록이 초기화되었습니다. 추천받고 싶으신 도서에 대해 다시 질문해 보세요!',
        timestamp: '방금 전'
      }
    ]);
  };

  // Simple Markdown Parser to render markdown formatted responses from Gemini
  const renderMarkdown = (text: string) => {
    // Escape HTML first
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Handle bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    
    // Handle italic (*text*)
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-indigo-700">$1</em>');

    // Handle bullet points (- item)
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li class="ml-4 list-disc pl-1 py-0.5">$1</li>');

    // Handle markdown links ([label](url))
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline bg-indigo-50 px-1.5 py-0.5 rounded transition-all">$1 <svg class="w-3 h-3 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>');

    // Handle newlines to <br>
    html = html.replace(/\n/g, '<br>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Recharts colors
  const COLORS = ['#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#64748B'];

  return (
    <div id="biblioinsight-app" className="flex flex-col h-[768px] w-[1024px] bg-[#F8FAFC] overflow-hidden select-none font-sans mx-auto shadow-2xl rounded-2xl border border-slate-200">
      
      {/* Header */}
      <header id="app-header" className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">B</div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            BiblioInsight <span className="text-indigo-600 text-xs px-2 py-0.5 bg-indigo-50 rounded-full font-bold">RAG AI 챗봇</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="도서명, 저자, 출판사 실시간 검색..." 
              value={globalSearch}
              onChange={(e) => setAllSearch(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-md py-1.5 pl-8 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <div className="absolute left-2.5 top-2.5 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            {globalSearch && (
              <button 
                onClick={() => setAllSearch('')} 
                className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ×
              </button>
            )}
          </div>
          <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
            AI
          </div>
        </div>
      </header>

      {loading ? (
        <div id="loading-spinner-container" className="flex-1 flex flex-col items-center justify-center bg-white gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">종합 도서 데이터 수집 및 분석 중...</p>
        </div>
      ) : (
        <div id="main-content-layout" className="flex-1 flex flex-col overflow-hidden">
          
          {/* Navigation Tab Bar */}
          <nav id="app-nav-bar" className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10">
            <div className="flex gap-1.5 h-full items-center">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>도서 대시보드</span>
              </button>
              
              <button
                id="nav-tab-catalog"
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>도서 스마트 탐색</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'catalog' ? 'bg-indigo-500 text-indigo-50' : 'bg-slate-100 text-slate-500'
                }`}>
                  {filteredBooks.length}
                </span>
              </button>
              
              <button
                id="nav-tab-chat"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>BiblioInsight AI 챗봇</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>
            </div>
            
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-slate-300 animate-pulse" /> 실시간 분석 상태: <span className="text-emerald-500 font-bold">ON</span>
            </div>
          </nav>

          {/* Main Display Area */}
          <div id="tab-viewport" className="flex-1 overflow-hidden bg-[#F8FAFC]">
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (() => {
              // Dynamic client-side calculations for the 1,000 books
              const priceRanges = [
                { name: '1.5만 미만', value: 0 },
                { name: '1.5만-2만', value: 0 },
                { name: '2만-2.5만', value: 0 },
                { name: '2.5만-3만', value: 0 },
                { name: '3만 이상', value: 0 },
              ];

              const rangeSalesIndex = [
                { name: '1.5만 미만', '평균 판매지수': 0, totalSales: 0, count: 0 },
                { name: '1.5만-2만', '평균 판매지수': 0, totalSales: 0, count: 0 },
                { name: '2만-2.5만', '평균 판매지수': 0, totalSales: 0, count: 0 },
                { name: '2.5만-3만', '평균 판매지수': 0, totalSales: 0, count: 0 },
                { name: '3만 이상', '평균 판매지수': 0, totalSales: 0, count: 0 },
              ];

              allBooks.forEach(b => {
                let idx = 0;
                if (b.price < 15000) idx = 0;
                else if (b.price < 20000) idx = 1;
                else if (b.price < 25000) idx = 2;
                else if (b.price < 30000) idx = 3;
                else idx = 4;

                priceRanges[idx].value++;
                rangeSalesIndex[idx].totalSales += b.salesIndex;
                rangeSalesIndex[idx].count++;
              });

              rangeSalesIndex.forEach(r => {
                r['평균 판매지수'] = r.count > 0 ? Math.round(r.totalSales / r.count) : 0;
              });

              const highestPriceBook = allBooks.length > 0 ? [...allBooks].sort((a, b) => b.price - a.price)[0] : null;
              const highestSalesBook = allBooks.length > 0 ? [...allBooks].sort((a, b) => b.salesIndex - a.salesIndex)[0] : null;

              return (
                <div id="panel-dashboard" className="h-full overflow-y-auto p-4 flex flex-col gap-5 scroll-smooth pr-1.5 pb-8 bg-slate-50/20">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-4 shrink-0">
                    {/* Total Books */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">총 분석 도서</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">{(stats?.totalBooks || 1000).toLocaleString()}권</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold mt-2">
                        <BookOpen className="w-3.5 h-3.5" /> 전체 1,000권 데이터셋 로드 완료
                      </div>
                    </div>

                    {/* Avg Price */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">평균 도서 가격</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">{(stats?.avgPrice || 26400).toLocaleString()}원</p>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> 평균 {stats?.avgDiscountRate || 10}% 특별 할인 적용중
                      </div>
                    </div>

                    {/* Cumulative AI Queries */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">누적 AI 쿼리</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">{chatCount}회</p>
                      </div>
                      <div className="text-[10px] text-indigo-600 font-bold mt-2 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} /> RAG 기반 맞춤 추천 탑재
                      </div>
                    </div>

                    {/* Avg Sales Index */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">평균 판매지수</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">{(stats?.avgSalesIndex || 6380).toLocaleString()}</p>
                      </div>
                      <div className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> 최고 판매지수: 82,788
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Distribution & Best Sellers */}
                  <div className="grid grid-cols-12 gap-4 shrink-0">
                    {/* Left Column: Recharts Pie chart for Genre Distribution */}
                    <div className="col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[260px]">
                      <h3 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <Layers className="w-4 h-4 text-indigo-600" /> 도서 장르별 시장 분포 분석 (Top 5)
                      </h3>
                      <div className="flex-1 flex items-center overflow-hidden">
                        <div className="w-[180px] h-full flex items-center justify-center border-r border-slate-100 pr-3 shrink-0">
                          <div className="w-full h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={stats?.genreDistribution || []}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={35}
                                  outerRadius={60}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {(stats?.genreDistribution || []).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                  formatter={(value: any) => [`${value}권`, '도서 수']}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-2.5 pl-5 overflow-y-auto scroll-hide">
                          {(stats?.genreDistribution || []).map((entry: any, index: number) => {
                            const percentage = ((entry.value / (stats?.totalBooks || 1000)) * 100).toFixed(1);
                            return (
                              <div key={entry.name} className="flex flex-col text-xs">
                                <div className="flex justify-between items-center text-slate-600 font-semibold mb-1">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    {entry.name}
                                  </span>
                                  <span className="text-slate-800">{entry.value}권 <span className="text-[10px] text-slate-400 font-medium">({percentage}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                  <div 
                                    className="h-1.5 rounded-full transition-all duration-500" 
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Best Sellers */}
                    <div className="col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[260px]">
                      <h3 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <Award className="w-4 h-4 text-indigo-600" /> 최고 인기 베스트셀러 순위
                      </h3>
                      <div className="flex-1 space-y-2 overflow-y-auto scroll-hide pr-1">
                        {(stats?.topSellers || []).slice(0, 5).map((book: Book, idx: number) => (
                          <div 
                            key={book.rank} 
                            onClick={() => {
                              setActiveTab('chat');
                              handleSendMessage(`"${book.title}" 도서에 대한 상세 소개와 타겟 독자, 구매 포인트를 알려주세요.`);
                            }}
                            className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all cursor-pointer group"
                            title="클릭하여 이 도서에 대해 AI에게 바로 물어보기"
                          >
                            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-all">
                              {idx + 1}
                            </div>
                            <div className="overflow-hidden flex-1">
                              <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-indigo-800 transition-colors">{book.title}</p>
                              <p className="text-[9px] text-slate-400 flex items-center justify-between mt-0.5">
                                <span className="truncate max-w-[130px]">{book.author} | {book.publisher}</span>
                                <span className="text-indigo-600 font-bold text-[9px] bg-indigo-50 px-1.5 py-0.2 rounded shrink-0">지수 {book.salesIndex.toLocaleString()}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Deeper Analyses (Visible on scroll!) */}
                  <div className="grid grid-cols-12 gap-4 shrink-0">
                    {/* Left: Price Range Distribution Chart */}
                    <div className="col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[260px]">
                      <h3 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <BarChart3 className="w-4 h-4 text-indigo-600" /> 도서 판매가 구간별 분포 (1,000권 기준)
                      </h3>
                      <div className="flex-1 w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={priceRanges} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '9px', fill: '#64748B', fontWeight: 'bold' }} />
                            <YAxis tickLine={false} axisLine={false} style={{ fontSize: '9px', fill: '#64748B' }} />
                            <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                            <Bar dataKey="value" name="도서 수" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right: Top Publishers Share Chart */}
                    <div className="col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[260px]">
                      <h3 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <Layers className="w-4 h-4 text-indigo-600" /> 메이저 IT 출판사 등록 비율 (Top 5)
                      </h3>
                      <div className="flex-1 w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.topPublishers || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '9px', fill: '#64748B', fontWeight: 'bold' }} />
                            <YAxis tickLine={false} axisLine={false} style={{ fontSize: '9px', fill: '#64748B' }} />
                            <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                            <Bar dataKey="count" name="출판 도서 수" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Value Index and Insights (Visible on scroll!) */}
                  <div className="grid grid-cols-12 gap-4 shrink-0">
                    {/* Left: Price vs Sales Index Chart */}
                    <div className="col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[260px]">
                      <h3 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" /> 가격대별 평균 판매지수 (인기도 입체 상관 분석)
                      </h3>
                      <div className="flex-1 w-full h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={rangeSalesIndex} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '9px', fill: '#64748B', fontWeight: 'bold' }} />
                            <YAxis tickLine={false} axisLine={false} style={{ fontSize: '9px', fill: '#64748B' }} />
                            <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                            <Bar dataKey="평균 판매지수" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right: Market Insight Summary Narrative Card */}
                    <div className="col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[260px] justify-between">
                      <h3 className="text-xs font-black text-slate-700 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <Compass className="w-4 h-4 text-indigo-600" /> AI 실시간 마켓 트렌드 리포트
                      </h3>
                      
                      <div className="flex-1 flex flex-col gap-2.5 justify-center">
                        <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50 flex flex-col gap-1">
                          <span className="text-[9px] text-indigo-600 font-extrabold uppercase">시장 주도권 분석</span>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                            현재 IT 실무 및 인공지능 관련 도서 시장은 <span className="text-indigo-700 font-extrabold">"{stats?.topPublishers?.[0]?.name || '한빛미디어'}"</span> 출판사가 총 {stats?.topPublishers?.[0]?.count || 120}권으로 선두를 달리고 있습니다.
                          </p>
                        </div>

                        <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 flex flex-col gap-1">
                          <span className="text-[9px] text-amber-700 font-extrabold uppercase">가격별 선호 패턴</span>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                            소비자의 실질적 구매 및 인기도를 대변하는 평균 판매지수는 <span className="text-amber-700 font-extrabold">"2.0만-2.5만"</span> 구간의 IT 도서에서 압도적인 수치를 기록하고 있습니다.
                          </p>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 font-medium text-center mt-2 bg-slate-50 py-1 rounded">
                        * 1,000권의 인덱스 메타데이터를 매칭한 실시간 추론입니다.
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Comprehensive 3D Analysis Highlight Report (Full Width) */}
                  <div className="bg-indigo-950 text-slate-200 p-5 rounded-xl shadow-md border border-indigo-900 flex flex-col gap-4 shrink-0 hover:border-indigo-800 transition-all">
                    <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center font-bold">📚</div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">BiblioInsight 1,000권 도서 데이터 입체 분석 보고서</h4>
                          <p className="text-[10px] text-indigo-300">국내 최대 IT 전문 서적 1,000권의 요약 통계 및 실시간 트렌드 지표</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        LIVE REPORT
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-5 text-xs">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">🔥 가장 핫한 트렌드 키워드</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['#LLM_에이전트', '#RAG_시스템', '#클로드_바이브', '#n8n_자동화', '#TypeScript', '#피그마_UIUX', '#파이썬_머신러닝'].map((tag) => (
                            <span key={tag} className="text-[9px] bg-indigo-900 text-indigo-200 px-2 py-0.8 rounded-md font-semibold font-mono border border-indigo-800/60">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 bg-indigo-900/30 p-3 rounded-lg border border-indigo-900/50">
                        <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">🏆 최고 인기도 도서 (Rank 1)</span>
                        <p className="text-[11px] font-black text-white truncate">{highestSalesBook?.title || '생성형 AI 시대의 프롬프트 엔지니어링 교과서'}</p>
                        <p className="text-[9px] text-indigo-300 truncate">저자: {highestSalesBook?.author || '김민준'} | 판매지수: {highestSalesBook?.salesIndex.toLocaleString() || '82,788'}</p>
                      </div>

                      <div className="space-y-1 bg-indigo-900/30 p-3 rounded-lg border border-indigo-900/50">
                        <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">💎 최고 프리미엄 도서</span>
                        <p className="text-[11px] font-black text-white truncate">{highestPriceBook?.title || '모던 딥러닝 아키텍처와 강화학습 교과서'}</p>
                        <p className="text-[9px] text-indigo-300 truncate">판매가: {highestPriceBook?.price.toLocaleString() || '45,000'}원 | 출판사: {highestPriceBook?.publisher || '길벗'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-indigo-300 pt-1 mt-1 border-t border-indigo-900/30">
                      <span>* 이 종합 보고서는 국내 주요 IT 도서 1,000권의 실시간 메타데이터를 정합 분석하여 AI 추론 모델과 실시간 데이터 스트림을 결합하여 생성되었습니다.</span>
                      <span className="font-mono text-indigo-400 font-semibold">Updated: Just Now</span>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* TAB 2: CATALOG */}
            {activeTab === 'catalog' && (
              <div id="panel-catalog" className="h-full flex flex-col gap-4 p-4 overflow-hidden">
                {/* Search & Filter Header */}
                <div className="flex items-center justify-between shrink-0 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 shadow-inner">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800">도서 실시간 인덱스 탐색</h3>
                      <p className="text-[10px] text-slate-400">데이터베이스 내 {filteredBooks.length}권의 도서 데이터를 필터링하고 검색합니다.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {['전체', 'AI/인공지능', '프로그래밍', '업무자동화', '디자인/미디어'].map((genre) => {
                      // Calculate counts dynamic
                      const count = genre === '전체' 
                        ? allBooks.length 
                        : allBooks.filter(book => {
                            const text = (book.title + ' ' + book.subtitle).toLowerCase();
                            if (genre === 'AI/인공지능') {
                              return text.includes('ai') || text.includes('인공지능') || text.includes('제미나이') || text.includes('클로드') || text.includes('gpt') || text.includes('챗gpt') || text.includes('llm') || text.includes('에이전트');
                            } else if (genre === '프로그래밍') {
                              return text.includes('코딩') || text.includes('프로그래밍') || text.includes('파이썬') || text.includes('c언어') || text.includes('자바') || text.includes('리액트') || text.includes('개발자') || text.includes('알고리즘') || text.includes('html') || text.includes('css');
                            } else if (genre === '업무자동화') {
                              return text.includes('엑셀') || text.includes('스프레드시트') || text.includes('업무') || text.includes('노션') || text.includes('자동화') || text.includes('파워포인트') || text.includes('한글') || text.includes('office') || text.includes('n8n') || text.includes('zapier');
                            } else if (genre === '디자인/미디어') {
                              return text.includes('디자인') || text.includes('드로잉') || text.includes('일러스트') || text.includes('포토샵') || text.includes('피그마') || text.includes('캔바') || text.includes('이모티콘') || text.includes('스케치업') || text.includes('블렌더') || text.includes('영상') || text.includes('유튜브') || text.includes('쇼츠') || text.includes('캡컷');
                            } else {
                              const isAI = text.includes('ai') || text.includes('인공지능') || text.includes('제미나이') || text.includes('클로드') || text.includes('gpt') || text.includes('챗gpt') || text.includes('llm') || text.includes('에이전트');
                              const isProg = text.includes('코딩') || text.includes('프로그래밍') || text.includes('파이썬') || text.includes('c언어') || text.includes('자바') || text.includes('리액트') || text.includes('개발자') || text.includes('알고리즘') || text.includes('html') || text.includes('css');
                              const isAuto = text.includes('엑셀') || text.includes('스프레드시트') || text.includes('업무') || text.includes('노션') || text.includes('자동화') || text.includes('파워포인트') || text.includes('한글') || text.includes('office') || text.includes('n8n') || text.includes('zapier');
                              const isDesign = text.includes('디자인') || text.includes('드로잉') || text.includes('일러스트') || text.includes('포토샵') || text.includes('피그마') || text.includes('캔바') || text.includes('이모티콘') || text.includes('스케치업') || text.includes('블렌더') || text.includes('영상') || text.includes('유튜브') || text.includes('쇼츠') || text.includes('캡컷');
                              return !isAI && !isProg && !isAuto && !isDesign;
                            }
                          }).length;

                      return (
                        <button
                          key={genre}
                          onClick={() => setSelectedGenre(genre)}
                          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                            selectedGenre === genre 
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span>{genre}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            selectedGenre === genre ? 'bg-indigo-500 text-indigo-50' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Data Table Container */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-auto scroll-hide">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                        <tr className="text-[10px] uppercase text-slate-400 font-black">
                          <th className="py-3 px-4 font-bold w-14 text-center">순위</th>
                          <th className="py-3 px-4 font-bold">도서 정보</th>
                          <th className="py-3 px-4 font-bold">저자 / 출판사</th>
                          <th className="py-3 px-4 font-bold text-right">판매가 (정가)</th>
                          <th className="py-3 px-4 font-bold text-center">판매지수</th>
                          <th className="py-3 px-4 font-bold text-center w-40">액션</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                        {filteredBooks.length > 0 ? (
                          filteredBooks.map((book) => {
                            const discountRate = Math.round(((book.cost - book.price) / book.cost) * 100);
                            return (
                              <tr key={book.rank} className="hover:bg-slate-50 transition-all">
                                <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                                  <span className="inline-block w-6 py-0.5 bg-slate-100 rounded text-slate-700 font-extrabold text-[10px]">
                                    {book.rank}
                                  </span>
                                </td>
                                <td className="py-3 px-4 max-w-[340px]">
                                  <p className="font-bold text-slate-800 truncate" title={book.title}>{book.title}</p>
                                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{book.subtitle || '부제목 없음'}</p>
                                </td>
                                <td className="py-3 px-4">
                                  <p className="font-semibold text-slate-700 truncate max-w-[150px]">{book.author}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{book.publisher}</p>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">{book.price.toLocaleString()}원</span>
                                    <span className="text-[10px] text-slate-400 line-through">
                                      {book.cost.toLocaleString()}원 ({discountRate}%)
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                                  {book.salesIndex.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button 
                                      onClick={() => {
                                        setActiveTab('chat');
                                        handleSendMessage(`"${book.title}" 도서에 대한 상세 소개와 타겟 독자, 구매 포인트를 알려주세요.`);
                                      }}
                                      className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all shadow-sm"
                                    >
                                      AI 질문
                                    </button>
                                    <a
                                      href={book.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-2.5 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-0.5"
                                    >
                                      YES24 <ArrowUpRight className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-bold text-sm">
                              검색 조건이나 검색어에 부합하는 도서가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CHATBOT */}
            {activeTab === 'chat' && (
              <div id="panel-chat" className="h-full flex overflow-hidden">
                {/* Left Sidebar: Info & Match History (310px) */}
                <div className="w-[310px] shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-4 overflow-hidden">
                  
                  {/* RAG Engine Info Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                    <div className="flex items-center gap-2 text-indigo-900 font-black text-xs mb-2">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      <span>BiblioInsight RAG 검색 기술</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      이 챗봇은 단순한 생성형 AI가 아닌, 데이터베이스 내 **1,000권의 도서 데이터**를 직접 대조·분석(RAG)하여 검증된 실시간 정보만을 매칭해 추천합니다.
                    </p>
                  </div>

                  {/* Dynamic Recommended Books Card */}
                  <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 shrink-0">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span>추천 매칭 도서 리스트</span>
                      </div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded-full">
                        실시간
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto scroll-hide space-y-2.5 pr-1">
                      {(() => {
                        // Find the last assistant message with recommendedBooks
                        const lastBotMsg = [...chatHistory]
                          .reverse()
                          .find(msg => msg.role === 'assistant' && msg.recommendedBooks && msg.recommendedBooks.length > 0);

                        if (lastBotMsg && lastBotMsg.recommendedBooks) {
                          return lastBotMsg.recommendedBooks.map((b) => (
                            <a 
                              key={b.rank}
                              href={b.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl text-slate-700 transition-all group"
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1 rounded">Rank {b.rank}</span>
                                <span className="text-[9px] text-slate-400 font-mono">지수 {b.salesIndex.toLocaleString()}</span>
                              </div>
                              <span className="font-extrabold text-[11px] text-slate-800 group-hover:text-indigo-700 truncate line-clamp-1 mb-1">{b.title}</span>
                              <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                                <span className="truncate max-w-[150px]">{b.author} | {b.publisher}</span>
                                <span className="text-indigo-600 font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                  YES24 <ArrowUpRight className="w-2 h-2 text-indigo-500" />
                                </span>
                              </div>
                            </a>
                          ));
                        } else {
                          return (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                              <HelpCircle className="w-8 h-8 text-slate-300 mb-2 animate-bounce" style={{ animationDuration: '3s' }} />
                              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                                질문을 전송하시면 RAG 기술로 파싱된 최적 매칭 도서 목록이 이곳에 실시간 노출됩니다.
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right Column: Chat Dialog System (682px) */}
                <div className="flex-1 flex flex-col bg-[#FBFBFE] overflow-hidden">
                  
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" /> BiblioInsight AI 대화형 어드바이저
                      </h3>
                    </div>
                    <button 
                      onClick={handleClearChat}
                      className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-all flex items-center gap-1 bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-sm"
                    >
                      <RefreshCw className="w-3 h-3" /> 대화 초기화
                    </button>
                  </div>

                  {/* Chat Message Scroll Thread */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scroll-hide bg-[#FBFBFE]">
                    {chatHistory.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-100 font-medium' 
                              : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm'
                          }`}
                        >
                          {renderMarkdown(msg.content)}

                          {/* Inline matches in chat box if any */}
                          {msg.recommendedBooks && msg.recommendedBooks.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">RAG 추천 매칭 도서:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {msg.recommendedBooks.map((b) => (
                                  <a 
                                    key={b.rank}
                                    href={b.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-lg text-slate-700 transition-all group"
                                  >
                                    <span className="font-bold truncate text-[11px] text-slate-800 group-hover:text-indigo-700 w-32">{b.title}</span>
                                    <span className="text-[9px] bg-white border border-slate-200 text-slate-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                      바로가기 <ArrowUpRight className="w-2.5 h-2.5 text-indigo-500" />
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 px-1">{msg.timestamp}</span>
                      </div>
                    ))}

                    {/* Chat Loading State */}
                    {chatLoading && (
                      <div className="flex flex-col gap-1 items-start">
                        <div className="bg-white border border-slate-200 text-slate-600 p-3 rounded-2xl rounded-bl-sm shadow-sm max-w-[85%] flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                          <span className="text-[11px] font-bold text-slate-500">데이터베이스 실시간 분석 중...</span>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input & Hashtag Area */}
                  <div className="p-3.5 bg-white border-t border-slate-200 shrink-0">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition-all"
                    >
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="추천받고 싶은 도서나 IT 분야를 말씀하세요..." 
                        disabled={chatLoading}
                        className="flex-1 bg-transparent border-none outline-none text-xs px-2 py-1.5 text-slate-700 placeholder-slate-400 focus:ring-0"
                      />
                      <button 
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md transition-all ${
                          chatInput.trim() && !chatLoading
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-100'
                            : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Quick Tags */}
                    <div className="mt-2.5 flex gap-1.5 overflow-hidden flex-nowrap pr-1 scroll-hide">
                      {[
                        { tag: '#AI입문추천', q: '인공지능이나 LLM 기초를 쉽게 배울 수 있는 책을 추천해줘.' },
                        { tag: '#클로드코드실무', q: '클로드 코드를 사용한 실전 바이브 코딩 개발법 도서 알려줘.' },
                        { tag: '#업무자동화', q: '회사 업무를 더 빠르게 끝내는 오피스 및 업무 자동화 관련 베스트셀러를 추천해줘.' }
                      ].map((item) => (
                        <button 
                          key={item.tag}
                          onClick={() => handleSendMessage(item.q)}
                          disabled={chatLoading}
                          className="whitespace-nowrap px-2.5 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer animate-fade-in"
                        >
                          {item.tag}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
