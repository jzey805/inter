import React, { useEffect, useState } from 'react';
import LiveDemo from './components/LiveDemo';
import SafetyShieldDemo from './components/SafetyShieldDemo';
import EmergencyAidDemo from './components/EmergencyAidDemo';
import EcosystemHub from './components/EcosystemHub';
import HistoryView from './components/HistoryView';
import LegalHubDemo from './components/LegalHubDemo';
import { Mail, Shield, AlertTriangle, Compass, LogIn, LogOut, Clock, Scale, ListTodo } from 'lucide-react';

import { initAuth, googleSignIn, logout } from './lib/firebase';
import { sendEmail } from './lib/gmail';
import { User } from 'firebase/auth';

type TabView = 'letter' | 'shield' | 'legalhub' | 'emergency' | 'roadmap' | 'history';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('letter');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthError(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setAuthError('popup-closed');
      } else {
        setAuthError(err?.message || 'unknown');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSendEmail = async (recipient: string, subject: string, body: string) => {
    if (!accessToken) throw new Error("No token");
    await sendEmail(accessToken, recipient, subject, body);
  };

  const tabs: { id: TabView; label: string; icon: React.ReactNode }[] = [
    { id: 'letter', label: '信件官', icon: <Mail size={24} /> },
    { id: 'shield', label: '防坑盾', icon: <Shield size={24} /> },
    { id: 'legalhub', label: '法援站', icon: <Scale size={24} /> },
    { id: 'history', label: '我的案头', icon: <ListTodo size={24} /> },
    { id: 'emergency', label: '急救包', icon: <AlertTriangle size={24} /> },
    { id: 'roadmap', label: '生态', icon: <Compass size={24} /> }
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F8F6F1] font-sans text-gray-900 overflow-hidden pb-16 md:pb-0 md:pl-20 relative">
      
      {/* Top App Bar */}
      <header className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 shadow-sm z-20 sticky top-0 w-full">
        <h1 className="text-xl font-bold tracking-tight text-[#1C362B] flex items-center gap-2">
          <span className="w-8 h-8 bg-[#EAB252] rounded-lg flex items-center justify-center text-white font-display">S</span>
          Serene｜留学生海外避坑安心助手
        </h1>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
               <img src={user.photoURL || ''} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200" />
               <button onClick={handleLogout} className="text-xs font-bold text-gray-500 hover:text-gray-900 transition flex items-center gap-1">
                 <LogOut size={14}/> 退出
               </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="text-sm font-bold bg-[#1C362B] text-white px-4 py-2 rounded-full hover:bg-gray-800 transition flex items-center gap-2">
               <LogIn size={16}/> 登录
            </button>
          )}
        </div>
      </header>

      {/* Auth Error Guidance Alert Banner */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-4 animate-in slide-in-from-top-4 duration-300 relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <span>Google 登录窗口被拦截或未完成签署授权 (Sign-In Blocked/Canceled)</span>
                  {authError === 'popup-closed' && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-medium">auth/popup-closed-by-user</span>
                  )}
                </h3>
                <p className="text-xs text-amber-700/90 leading-relaxed mt-1">
                  由于当前预览应用运行在 <span className="underline font-bold">AI Studio 双层安全内嵌框架 (iframe)</span> 内，部分浏览器的第三方 Cookie 限制或强力广告屏蔽插件可能会强行截断 Google 授权登录弹窗。
                </p>
                <div className="text-xs text-amber-850 font-medium mt-1.5 space-y-1">
                  <p className="flex items-center gap-1.5"><span className="bg-[#1C362B] text-white text-[9px] px-1.5 py-0.2 rounded font-sans shrink-0">规避对策①</span> 推荐点击预览窗体右上角 <span className="font-bold underline">"在新窗口中打开预览 (Open in a new tab)"</span> 后再次尝试快捷登录。</p>
                  <p className="flex items-center gap-1.5"><span className="bg-[#EAB252] text-[#1C362B] text-[9px] px-1.5 py-0.2 rounded font-sans shrink-0 font-bold">规避对策②</span> 仍可不登录，直接享用所有功能（支持以<span className="font-bold underline">「免登录本地访客模式」</span>正常分析账单诉讼并保存数据，不设功能锁）。</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={handleLogin}
                className="text-xs bg-[#1C362B] hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                🔄 重新登录
              </button>
              <button
                onClick={() => setAuthError(null)}
                className="text-xs bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                我知道了，直接使用
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
         <div className="max-w-7xl mx-auto p-4 md:p-8 pb-32">
            {activeTab === 'letter' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LiveDemo 
                   user={user} 
                   accessToken={accessToken} 
                   onLogin={handleLogin} 
                   onLogout={handleLogout} 
                   onSendEmail={handleSendEmail} 
                />
              </div>
            )}
            {activeTab === 'shield' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SafetyShieldDemo />
              </div>
            )}
            {activeTab === 'legalhub' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <LegalHubDemo />
              </div>
            )}
            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <HistoryView />
              </div>
            )}
            {activeTab === 'emergency' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <EmergencyAidDemo />
              </div>
            )}
            {activeTab === 'roadmap' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                <EcosystemHub />
              </div>
            )}
         </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 pt-2 pb-[max(env(safe-area-inset-bottom),1rem)] flex justify-between items-center z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
         {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 transition-colors ${activeTab === tab.id ? 'text-[#1C362B]' : 'text-gray-400 hover:text-gray-600'}`}
            >
               <div className={`mb-1 ${activeTab === tab.id ? 'scale-110 transition-transform' : ''}`}>
                 {tab.icon}
               </div>
               <span className={`text-[10px] ${activeTab === tab.id ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
            </button>
         ))}
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-20 bg-white border-r border-gray-100 flex-col items-center pt-24 pb-8 z-10 shadow-sm">
         <div className="flex-1 flex flex-col gap-8 w-full px-3">
            {tabs.map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 title={tab.label}
                 className={`flex flex-col items-center p-3 rounded-2xl w-full transition-all ${activeTab === tab.id ? 'bg-[#1C362B] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
               >
                  <div className={`${activeTab === tab.id ? 'scale-110 transition-transform' : ''}`}>
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-bold mt-2">{tab.label}</span>
               </button>
            ))}
         </div>
      </nav>

    </div>
  );
}
