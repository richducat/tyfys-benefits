import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Briefcase,
  Camera,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileCheck,
  FileText,
  Layout,
  Linkedin,
  Lock,
  MapPin,
  MessageCircle,
  RefreshCw,
  ScanLine,
  Search,
  Send,
  Shield,
  Star,
  TrendingUp,
  User,
  X
} from './demoIcons';

const TRACKER_STAGES = [
  { id: 1, label: 'Intel', full: 'Intel Gathering', icon: FileText, desc: 'Securing Service Treatment Records (STRs) & C-File to identify "Silent Disabilities".' },
  { id: 2, label: 'Strategy', full: 'Strategy Alignment', icon: MapPin, desc: 'Matching diagnosis to 38 CFR Rating Schedule to maximize percentage.' },
  { id: 3, label: 'Evidence', full: 'Evidence Assembly', icon: Activity, desc: 'Executing private DBQs & Nexus Letters to irrefutably link condition to service.' },
  { id: 4, label: 'QA', full: 'Compliance Audit', icon: Shield, desc: 'Internal legal review: Checking "3 Pillars" (Diagnosis, Nexus, Severity).' },
  { id: 5, label: 'File', full: 'Submission Ready', icon: Check, desc: 'Packet finalized for transmission. Priority processing flag attached.' }
];

const READINESS_CHECKLIST = [
  { id: 1, title: 'Service Treatment Records', desc: 'Confirm possession of military medical files.', subtext: 'Critical for direct service connection.', required: true, stage: 1 },
  { id: 2, title: 'Current Diagnosis', desc: 'Documented diagnosis within last 12 months?', subtext: 'Must be "Chronic" and "Current".', required: true, stage: 2 },
  { id: 3, title: 'Nexus Verification', desc: 'Is there a medical link to service?', subtext: 'The #1 reason for denial is missing Nexus.', required: true, stage: 2 },
  { id: 4, title: 'Symptom Statement', desc: 'Personal statement on daily life impact.', subtext: 'Wins "borderline" ratings.', required: false, stage: 2 },
  { id: 5, title: 'DBQ Execution', desc: 'Completed by a specialist?', subtext: 'General practitioners often miss criteria.', required: true, stage: 3 }
];

const JOB_DATABASE = [
  { id: 1, title: 'Logistics Operations Manager', company: 'Defense Global Solutions', loc: 'Arlington, VA', badge: 'TS/SCI', rank: 'Officer', salary: '$120k', branch: 'Army' },
  { id: 2, title: 'Cyber Security Analyst', company: 'Raytheon', loc: 'Remote', badge: 'Secret', rank: 'NCO', salary: '$105k', branch: 'Air Force' },
  { id: 3, title: 'Project Superintendent', company: 'FedConstruct', loc: 'San Diego, CA', badge: 'Public Trust', rank: 'NCO', salary: '$110k', branch: 'Navy' },
  { id: 4, title: 'Intelligence Specialist', company: 'Booz Allen Hamilton', loc: 'DC Metro', badge: 'TS/SCI', rank: 'Officer', salary: '$135k', branch: 'Marine Corps' },
  { id: 5, title: 'Maintenance Supervisor', company: 'Lockheed Martin', loc: 'Fort Worth, TX', badge: 'Secret', rank: 'NCO', salary: '$95k', branch: 'Air Force' },
  { id: 6, title: 'Regional Safety Manager', company: 'General Dynamics', loc: 'Norfolk, VA', badge: 'None', rank: 'NCO', salary: '$90k', branch: 'Navy' },
  { id: 7, title: 'Program Analyst', company: 'Dept of Veterans Affairs', loc: 'Washington, DC', badge: 'Public Trust', rank: 'Officer', salary: '$98k', branch: 'Army' },
  { id: 8, title: 'Field Service Tech', company: 'Northrop Grumman', loc: 'Huntsville, AL', badge: 'Secret', rank: 'Enlisted', salary: '$85k', branch: 'Army' }
];

const Header = ({ user }) => (
  <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
    <div className="flex justify-between items-center max-w-md mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-500/10 p-1.5 rounded-lg border border-yellow-500/20">
          <Shield className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight leading-none block">TYFYS</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">OPS CENTER</span>
        </div>
      </div>
      {user?.rating !== undefined && (
        <div className="flex items-center gap-2 bg-slate-800 rounded-full pl-3 pr-1 py-1 border border-slate-700">
          <span className="text-xs font-bold text-slate-200">{user.rating}% SC</span>
          <div className="bg-green-500 h-6 w-6 rounded-full flex items-center justify-center shadow-lg shadow-green-900/20">
            <TrendingUp className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
    </div>
  </header>
);

const BottomNav = ({ activeTab, setActiveTab }) => (
  <nav className="bg-white border-t border-slate-200 fixed bottom-0 w-full z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <div className="flex justify-around items-center max-w-md mx-auto h-20 pb-2">
      {[{ id: 'ops', icon: Shield, label: 'Ops Center' }, { id: 'angela', icon: MessageCircle, label: 'Ask Angela' }, { id: 'life', icon: Layout, label: 'Life' }, { id: 'exams', icon: Activity, label: 'Exams' }, { id: 'dossier', icon: User, label: 'Dossier' }].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-blue-50' : ''}`}>
            <tab.icon className={`h-6 w-6 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          </div>
          <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
        </button>
      ))}
    </div>
  </nav>
);

const LaunchScreen = ({ onStart }) => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-600 rounded-full blur-[100px] opacity-10 -ml-20 -mb-20" />

    <div className="flex-1 flex flex-col justify-center px-8 animate-in fade-in duration-1000">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
          <Shield className="h-10 w-10 text-slate-900" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter">TYFYS</h1>
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Veteran Companion</p>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 leading-tight">
        Your mission isn't over.
        <br />
        <span className="text-blue-400">Claim what you've earned.</span>
      </h2>

      <div className="space-y-6 mb-12">
        <div className="flex gap-4 items-start">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <Activity className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Medical Evidence</h3>
            <p className="text-slate-400 text-sm">Access our private network of licensed providers for DBQs and Nexus letters.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <MessageCircle className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Strategy</h3>
            <p className="text-slate-400 text-sm">Instant rating analysis based on 38 CFR standards.</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <Briefcase className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Life After Service</h3>
            <p className="text-slate-400 text-sm">Find "Duty-to-Hire" jobs and translate your military skills.</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-lg shadow-xl shadow-white/10 flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        Initialize Setup
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>

    <p className="text-center text-slate-500 text-xs pb-6">Secure • Encrypted • Veteran Owned</p>
  </div>
);

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: '', branch: '', era: '', rating: '0', goal: '' });
  const [loading, setLoading] = useState(false);

  const next = () => setStep((s) => s + 1);

  const finish = () => {
    setLoading(true);
    setTimeout(() => {
      onComplete(data);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-6 text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8" />
        <h2 className="text-2xl font-bold mb-2">Analyzing Service Profile...</h2>
        <div className="space-y-2 text-sm text-slate-400 font-mono">
          <p className="animate-pulse delay-75">&gt; Establishing {data.branch} data link...</p>
          <p className="animate-pulse delay-300">&gt; Checking Presumptive Eligibility...</p>
          <p className="animate-pulse delay-700">&gt; Configuring Ops Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6">
      <div className="w-full bg-slate-200 h-1 rounded-full mb-8 mt-2">
        <div className="bg-blue-600 h-1 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="flex-1 animate-in slide-in-from-right">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Identity Verification</h2>
          <p className="text-slate-500 mb-8">What should we call you?</p>
          <input
            placeholder="Full Name"
            className="w-full p-5 text-lg border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none bg-white"
            value={data.name}
            onChange={(event) => setData({ ...data, name: event.target.value })}
            autoFocus
          />
          <button
            type="button"
            disabled={!data.name}
            onClick={next}
            className="w-full bg-blue-600 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold mt-6 shadow-lg"
          >
            Confirm
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 animate-in slide-in-from-right">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Service Profile</h2>
          <p className="text-slate-500 mb-6">Determines your presumptive conditions.</p>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Branch</label>
            <div className="grid grid-cols-2 gap-3">
              {['Army', 'Navy', 'Marines', 'Air Force', 'Coast Guard', 'Space Force'].map((branch) => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => setData({ ...data, branch })}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${data.branch === branch ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                >
                  {branch}
                </button>
              ))}
            </div>

            <label className="text-xs font-bold text-slate-400 uppercase ml-1 mt-4 block">Service Era</label>
            <select
              className="w-full p-4 border-2 border-slate-200 rounded-2xl bg-white text-slate-700 font-medium outline-none"
              value={data.era}
              onChange={(event) => setData({ ...data, era: event.target.value })}
            >
              <option value="">Select Era...</option>
              {['Post-9/11', 'Gulf War', 'Vietnam', 'Peacetime'].map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={!data.branch || !data.era}
            onClick={next}
            className="w-full bg-blue-600 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg"
          >
            Continue
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 animate-in slide-in-from-right">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Current Status</h2>
          <p className="text-slate-500 mb-8">What is your current combined evaluation?</p>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center">
            <span className="text-7xl font-black text-slate-900 tracking-tighter">{data.rating}%</span>
            <p className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-widest">Service Connected</p>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={data.rating}
              onChange={(event) => setData({ ...data, rating: event.target.value })}
              className="w-full mt-8 h-2 bg-slate-100 rounded-full appearance-none accent-blue-600"
            />
          </div>
          <button type="button" onClick={next} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg">
            Next
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 animate-in slide-in-from-right">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Mission Objective</h2>
          <p className="text-slate-500 mb-8">What is your primary goal today?</p>
          <div className="space-y-4">
            {[
              { id: 'new', label: 'File New Claims', desc: 'I have conditions not yet rated.' },
              { id: 'increase', label: 'Increase Rating', desc: 'My conditions have worsened.' },
              { id: 'denial', label: 'Fight a Denial', desc: 'I need to appeal a VA decision.' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setData({ ...data, goal: option.id })}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${data.goal === option.id ? 'border-green-500 bg-green-50 shadow-md' : 'border-slate-200 bg-white'
                  }`}
              >
                <h3 className="font-bold text-slate-900">{option.label}</h3>
                <p className="text-sm text-slate-500 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!data.goal}
            onClick={finish}
            className="w-full bg-green-600 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold mt-8 shadow-lg"
          >
            Launch Ops Center
          </button>
        </div>
      )}
    </div>
  );
};

const OpsCenter = ({ onNavigate, user }) => {
  const [checklist, setChecklist] = useState(READINESS_CHECKLIST);
  const [currentStage, setCurrentStage] = useState(2);
  const [activeStageInfo, setActiveStageInfo] = useState(null);
  const [focusMode, setFocusMode] = useState(false);

  const toggleItem = (id) => setChecklist((items) => items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  const progress = Math.round((checklist.filter((item) => item.checked).length / checklist.length) * 100);
  const nextTask = checklist.find((item) => !item.checked);

  useEffect(() => {
    if (progress > 40) setCurrentStage(3);
    if (progress > 80) setCurrentStage(4);
  }, [progress]);

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claim Lifecycle Status</h2>
          <button
            type="button"
            onClick={() => setFocusMode(!focusMode)}
            className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${focusMode ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200'
              }`}
          >
            {focusMode ? 'FOCUS ON' : 'FOCUS OFF'}
          </button>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex justify-between relative overflow-hidden">
          <div className="absolute top-1/2 left-0 h-0.5 bg-slate-100 w-full -z-10 mt-[-1px]" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-green-500 -z-10 mt-[-1px] transition-all duration-1000"
            style={{ width: `${(currentStage / 5) * 100}%` }}
          />
          {TRACKER_STAGES.map((stage) => (
            <div key={stage.id} onClick={() => setActiveStageInfo(stage)} className="flex flex-col items-center gap-1 w-1/5 cursor-pointer z-10 group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${stage.id === currentStage
                  ? 'bg-blue-600 border-blue-600 shadow-lg scale-110'
                  : stage.id < currentStage
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-slate-200 group-hover:border-blue-300'
                  }`}
              >
                {stage.id < currentStage ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : (
                  <stage.icon className={`h-3.5 w-3.5 ${stage.id === currentStage ? 'text-white' : 'text-slate-300'}`} />
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase ${stage.id === currentStage ? 'text-blue-600' : 'text-slate-300'}`}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        {activeStageInfo && (
          <div className="mt-4 bg-slate-800 text-white p-4 rounded-xl animate-in slide-in-from-top-2 border-l-4 border-yellow-500 relative">
            <button type="button" onClick={() => setActiveStageInfo(null)} className="absolute top-2 right-2 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-sm text-yellow-400 uppercase tracking-wide mb-1">{activeStageInfo.full}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{activeStageInfo.desc}</p>
          </div>
        )}
      </div>

      {focusMode && nextTask ? (
        <div className="bg-slate-900 rounded-2xl p-6 text-white text-center shadow-xl animate-in zoom-in-95">
          <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto text-slate-900 shadow-lg">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Priority Objective</h3>
          <p className="text-slate-300 text-sm mb-6 max-w-xs mx-auto">
            {nextTask.desc}
            <span className="block mt-2 text-xs text-yellow-500 opacity-80">{nextTask.subtext}</span>
          </p>

          <button
            type="button"
            onClick={() => toggleItem(nextTask.id)}
            className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl active:scale-95 transition-transform"
          >
            Mark Complete
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-lg font-bold text-slate-800">Packet Audit</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{progress}% Ready</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-4 border-b border-slate-100 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${item.checked ? 'bg-green-50/40' : ''
                  }`}
              >
                <div
                  className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${item.checked ? 'bg-green-500 border-green-500' : 'border-slate-300'
                    }`}
                >
                  {item.checked && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  {!item.checked && <p className="text-[10px] text-orange-600 font-medium mt-1">Why: {item.subtext}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('angela')}
          className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl text-white shadow-lg cursor-pointer active:scale-95 transition-transform relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
          <MessageCircle className="h-6 w-6 text-white/90 mb-2" />
          <h3 className="font-bold text-sm">Ask Angela</h3>
          <p className="text-[10px] text-blue-100 opacity-80">AI Strategy Review</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('exams')}
          className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm cursor-pointer active:scale-95 transition-transform hover:border-blue-300"
        >
          <Activity className="h-6 w-6 text-slate-700 mb-2" />
          <h3 className="font-bold text-sm text-slate-900">Book Exam</h3>
          <p className="text-[10px] text-slate-500">Private DBQ Network</p>
        </button>
      </div>

      <button
        type="button"
        className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between shadow-xl cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => window.open('https://tyfys.net', '_blank')}
      >
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-2 rounded-lg text-slate-900">
            <Star className="h-5 w-5 fill-slate-900 stroke-slate-900" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Full Representation</h3>
            <p className="text-slate-400 text-xs">Deploy a dedicated Case Manager.</p>
          </div>
        </div>
        <ChevronRight className="text-slate-500 h-5 w-5" />
      </button>
    </div>
  );
};

const AngelaAI = ({ user }) => {
  const [locked, setLocked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && user) {
      setTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            sender: 'bot',
            text: `Analyzing profile for ${user.name} (${user.branch}, ${user.era})... \n\nI've identified 3 potential high-value claims. \n\nDo you experience issues with your joints, hearing, or respiratory system?`
          }
        ]);
        setTyping(false);
        setInitialized(true);
      }, 1500);
    }
  }, [initialized, user]);

  const send = () => {
    if (!input) return;
    setMessages((current) => [...current, { id: Date.now(), sender: 'user', text: input }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setLocked(true);
    }, 1200);
  };

  if (locked) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-in fade-in bg-slate-50">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-slate-900 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600 opacity-20" />
            <Lock className="h-12 w-12 text-white mx-auto mb-2 relative z-10" />
            <h2 className="text-xl font-black text-white relative z-10">STRATEGY CLASSIFIED</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-600 text-sm font-medium mb-6">
              Angela has identified <span className="text-blue-600 font-bold">3 High-Value Claims</span>. Unlock full report.
            </p>
            <div className="space-y-3 mb-6 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex gap-3 text-sm items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold text-slate-700">Era-Specific Presumptives</span>
              </div>
              <div className="flex gap-3 text-sm items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold text-slate-700">Nexus Letter Templates</span>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform">Unlock - $9.99/mo</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${message.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 rounded-tl-none text-slate-700'
                }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {typing && <div className="text-xs text-slate-400 ml-4 animate-pulse">Angela is typing...</div>}
      </div>
      <div className="p-4 bg-white border-t border-slate-200 flex gap-2 items-center">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Reply to Angela..."
          className="flex-1 bg-slate-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="button"
          onClick={send}
          className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const LifeHub = ({ user, onScanComplete }) => {
  const [tool, setTool] = useState(null);
  const [scanState, setScanState] = useState('camera');
  const [scanImage, setScanImage] = useState(null);

  const [filterClearance, setFilterClearance] = useState('All');
  const [filterRank, setFilterRank] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');

  if (tool === 'calculator') return (
    <div className="animate-in slide-in-from-right">
      <button onClick={() => setTool(null)} className="m-4 text-slate-500 flex gap-1 text-sm font-bold items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <VARatingCalculator />
    </div>
  );

  if (tool === 'pact') return (
    <div className="animate-in slide-in-from-right">
      <button onClick={() => setTool(null)} className="m-4 text-slate-500 flex gap-1 text-sm font-bold items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <PACTExplorer user={user} />
    </div>
  );


  const handleFileChange = (event) => {
    const [file] = event.target.files || [];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanImage(reader.result);
        setScanState('processing');
        setTimeout(() => setScanState('done'), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredJobs = JOB_DATABASE.filter((job) => {
    const matchClearance = filterClearance === 'All' || job.badge === filterClearance;
    const matchRank = filterRank === 'All' || job.rank === filterRank;
    const matchBranch = filterBranch === 'All' || job.branch === filterBranch;
    return matchClearance && matchRank && matchBranch;
  });

  if (tool === 'scanner') {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col">
        <div className="absolute top-4 left-4 z-20">
          <button type="button" onClick={() => setTool(null)}>
            <X className="text-white h-8 w-8" />
          </button>
        </div>
        {scanState === 'camera' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative">
            <div className="absolute inset-0 border-2 border-green-500 m-8 rounded-lg opacity-50" />
            <p className="text-white mb-8 font-mono">ALIGN DOCUMENT</p>
            <label className="w-20 h-20 bg-white rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
              <div className="w-16 h-16 border-2 border-slate-900 rounded-full" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        )}
        {scanState === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 px-8 text-center">
            {scanImage && <img src={scanImage} alt="Scan" className="w-64 h-80 object-cover border-2 border-green-500 opacity-50 mb-4 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)]" />}
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-[width_2s_ease-in-out]" />
            </div>
            <p className="text-green-400 mt-6 font-mono text-xs tracking-tighter h-4">{ocrText}</p>
          </div>
        )}
        {scanState === 'done' && (
          <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center text-white animate-in zoom-in">
            <FileCheck className="h-20 w-20 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold">Secure Upload</h2>
            <p className="text-slate-400 mb-8">Added to Digital Vault.</p>
            <button
              type="button"
              onClick={() => {
                const newDoc = {
                  id: Date.now(),
                  name: `Scan_${new Date().toLocaleDateString()}`,
                  image: scanImage,
                  date: new Date().toLocaleDateString()
                };
                onScanComplete(newDoc);
                setTool(null);
              }}
              className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold active:scale-95 transition-transform"
            >
              Save to Dossier
            </button>
          </div>
        )}
      </div>
    );
  }

  if (tool === 'jobs') {
    return (
      <div className="p-4 space-y-4 animate-in slide-in-from-right">
        <button
          type="button"
          onClick={() => setTool(null)}
          className="text-slate-500 flex gap-1 text-sm font-bold items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-slate-900">Duty-to-Hire Finder</h2>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select
              onChange={(event) => setFilterClearance(event.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
            >
              <option value="All">All Clearances</option>
              <option value="TS/SCI">Top Secret/SCI</option>
              <option value="Secret">Secret</option>
              <option value="Public Trust">Public Trust</option>
            </select>
            <select
              onChange={(event) => setFilterRank(event.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
            >
              <option value="All">All Ranks</option>
              <option value="Officer">Officer</option>
              <option value="NCO">NCO</option>
            </select>
          </div>
          <select
            onChange={(event) => setFilterBranch(event.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
          >
            <option value="All">All Branches</option>
            {['Army', 'Navy', 'Air Force', 'Marine Corps'].map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 pb-24">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium mb-4">No jobs found matching criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setFilterClearance('All');
                  setFilterRank('All');
                  setFilterBranch('All');
                }}
                className="text-blue-600 font-bold text-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900">{job.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded ${job.badge === 'TS/SCI'
                      ? 'bg-red-100 text-red-700'
                      : job.badge === 'Secret'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {job.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  {job.company} • {job.loc}
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <p className="text-sm font-bold text-green-600">{job.salary}</p>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">{job.branch} Preference</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const [building, setBuilding] = useState(false);
  const startBuild = () => {
    setBuilding(true);
    setTimeout(() => setBuilding(false), 2500);
  };

  if (tool === 'resume' || tool === 'linkedin') {
    return (
      <div className="p-4 space-y-6 pb-24 animate-in slide-in-from-right">
        <button type="button" onClick={() => setTool(null)} className="text-slate-500 flex gap-1 text-sm font-bold items-center">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-2xl font-black text-slate-900">{tool === 'resume' ? 'Resume Architect' : 'LinkedIn Optimizer'}</h2>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
          {building ? (
            <div className="text-center py-8">
              <RefreshCw className="h-10 w-10 mx-auto text-blue-500 animate-spin mb-4" />
              <p className="font-bold">Analyzing {user?.branch || 'Service'} MOS codes...</p>
              <p className="text-xs text-slate-400 mt-2">Translating to civilian terminology...</p>
            </div>
          ) : (
            <>
              <Briefcase className="h-10 w-10 text-yellow-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">{tool === 'resume' ? 'Military to Civilian' : 'Profile Optimization'}</h3>
              <p className="text-sm text-slate-400 mb-6">
                We'll use your {user?.branch || 'Service'} service history to generate a compliant {tool === 'resume' ? 'resume' : 'headline'}.
              </p>
              <button
                type="button"
                onClick={startBuild}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" /> Generate Draft
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in">
      <h1 className="text-2xl font-black text-slate-900">Life After Service</h1>

      <button
        type="button"
        onClick={() => setTool('scanner')}
        className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl active:scale-95 transition-transform cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">Digital Vault</h3>
            <p className="text-slate-400 text-xs">Secure Doc Scanner</p>
          </div>
          <ScanLine className="h-6 w-6 text-green-400" />
        </div>
        <div className="bg-white/10 p-3 rounded-xl flex items-center gap-2 backdrop-blur-sm">
          <Camera className="h-4 w-4" />
          <span className="text-xs font-bold">Tap to Capture</span>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setTool('jobs')}
          className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          <Search className="h-6 w-6 mb-2 text-blue-200" />
          <h3 className="font-bold text-sm">Job Finder</h3>
          <p className="text-[10px] opacity-80">Duty-to-Hire Roles</p>
        </button>
        <button
          type="button"
          onClick={() => setTool('resume')}
          className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm active:scale-95 transition-transform cursor-pointer"
        >
          <Briefcase className="h-6 w-6 text-orange-500 mb-2" />
          <h3 className="font-bold text-sm text-slate-900">Resume</h3>
          <p className="text-[10px] text-slate-500">MOS Translator</p>
        </button>
        <button
          type="button"
          onClick={() => setTool('linkedin')}
          className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm active:scale-95 transition-transform cursor-pointer"
        >
          <Linkedin className="h-6 w-6 text-[#0077b5] mb-2" />
          <h3 className="font-bold text-sm text-slate-900">LinkedIn</h3>
          <p className="text-[10px] text-slate-500">Profile Architect</p>
        </button>
      </div>

      <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Veteran Utilities</h3>
        <div className="space-y-2">
          <button
            onClick={() => setTool('calculator')}
            className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Layout className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-900">VA Rating Calculator</h4>
                <p className="text-[10px] text-slate-500">Calculate "VA Math" combined ratings</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>

          <button
            onClick={() => setTool('pact')}
            className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-50 p-2 rounded-xl group-hover:bg-yellow-100 transition-colors">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-900">PACT Act Explorer</h4>
                <p className="text-[10px] text-slate-500">Check presumptive eligibility</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>

          <button
            onClick={() => setTool('nexus')}
            className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-900">Nexus Template Gen</h4>
                <p className="text-[10px] text-slate-500">Draft medical evidence links</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
        </div>
      </div>

    </div>
  );
};

const PACT_ACT_DATA = [
  { era: 'Post-9/11', locations: ['Afghanistan', 'Iraq', 'Syria'], conditions: ['Burn Pit exposure', 'Asthma', 'Rhinitis', 'Sinusitis', 'Various Cancers'] },
  { era: 'Gulf War', locations: ['Kuwait', 'Saudi Arabia', 'Iraq'], conditions: ['Chronic Fatigue Syndrome', 'Fibromyalgia', 'IBS', 'Respiratory issues'] },
  { era: 'Vietnam', locations: ['Vietnam', 'Thailand', 'Blue Water'], conditions: ['Agent Orange exposure', 'Type 2 Diabetes', 'Ischemic Heart Disease', 'Parkinson\'s'] }
];

const NexusTemplateGenerator = ({ user }) => {
  const [condition, setCondition] = useState('');
  const [generated, setGenerated] = useState(false);

  const generate = () => setGenerated(true);

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-bottom-4">
      <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-black mb-2">Nexus Architect</h2>
        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-4">Evidence Support Tool</p>
        {!generated ? (
          <div className="space-y-4">
            <p className="text-xs text-indigo-100 leading-relaxed">
              Enter the condition you are claiming. We'll generate a medical-grade Nexus statement template for your doctor to review.
            </p>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Sleep Apnea"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-400 text-sm font-medium"
            />
            <button
              onClick={generate}
              disabled={!condition}
              className="w-full bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Generate Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/5 border border-indigo-400/30 rounded-2xl p-4 relative">
              <p className="text-[11px] text-slate-100 leading-relaxed font-serif italic">
                "It is my professional opinion that it is 'at least as likely as not' (50% probability or greater) that the veteran's diagnosis of {condition} was incurred in or aggravated by their active duty service, specifically relating to {user?.branch || 'military service'} exposure..."
              </p>
            </div>
            <button
              onClick={() => {
                setGenerated(false);
                setCondition('');
              }}
              className="w-full bg-white/10 text-white text-xs font-bold py-3 rounded-xl border border-white/20"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
          <p className="text-[10px] text-slate-600 leading-relaxed">
            <span className="font-bold text-indigo-700">Important:</span> This is a template only. A licensed medical provider must review your history and sign their own version to be valid for VA claims.
          </p>
        </div>
      </div>
    </div>
  );
};

const PACTExplorer = ({ user }) => {
  const eraData = PACT_ACT_DATA.find(d => d.era === user?.era) || PACT_ACT_DATA[0];

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden underline-offset-4">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500 rounded-full blur-[60px] opacity-10 -mr-8 -mt-8" />
        <h2 className="text-2xl font-black mb-1">PACT Act Explorer</h2>
        <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-4">Presumptive Eligibility Check</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Based on your <span className="text-white font-bold">{user?.era || 'Service'}</span> era, the following conditions are presumed service-connected under current law.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Presumed Conditions</h3>
        <div className="grid gap-3">
          {eraData.conditions.map((condition, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-bold text-slate-900">{condition}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
        <h4 className="font-black text-blue-900 mb-2">Did you know?</h4>
        <p className="text-xs text-blue-700 leading-relaxed mb-4">
          If you have any of these conditions, you don't need to prove they were caused by service—only that you served in the required locations.
        </p>
        <button className="text-sm font-bold text-blue-600 flex items-center gap-2">
          Read location requirements <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const VARatingCalculator = () => {
  const [ratings, setRatings] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addRating = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setRatings([...ratings, val].sort((a, b) => b - a));
      setInputValue('');
    }
  };

  const calculateCombined = (currentRatings) => {
    if (currentRatings.length === 0) return 0;

    let remaining = 100;
    let combined = 0;

    // VA Math: Sort highest to lowest
    const sorted = [...currentRatings].sort((a, b) => b - a);

    sorted.forEach(rating => {
      const effect = (remaining * (rating / 100));
      combined += effect;
      remaining -= effect;
    });

    // Round to nearest 10
    return Math.round(combined / 10) * 10;
  };

  const combinedRating = calculateCombined(ratings);

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-bottom-4">
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10" />
        <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Vault Calculator</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tighter">{combinedRating}%</span>
          <span className="text-sm font-bold text-slate-400 uppercase">Combined</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium">
          Note: This is an estimation based on standard VA Combined Rating Tables ("VA Math").
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Add Individual Ratings</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 50"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm font-medium"
          />
          <button
            onClick={addRating}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Current Evaluation</h3>
        {ratings.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">No ratings added yet.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {ratings.map((r, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center animate-in slide-in-from-left-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  <span className="font-bold text-slate-900">{r}% Evaluation</span>
                </div>
                <button
                  onClick={() => setRatings(ratings.filter((_, index) => index !== i))}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {combinedRating < 100 && ratings.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-green-900 text-left">Path to 100%</h4>
            <p className="text-[11px] text-green-700 leading-relaxed text-left">
              To reach 100%, you need additional evaluations totaling approximately {100 - combinedRating}% more in "actual" disability weight.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ExamsStore = () => {
  const [selected, setSelected] = useState(null);
  const [checkoutState, setCheckoutState] = useState('form');

  const processPayment = (event) => {
    event.preventDefault();
    setCheckoutState('processing');
    setTimeout(() => setCheckoutState('success'), 2000);
  };

  if (selected) {
    return (
      <div className="p-4 pb-24 animate-in slide-in-from-right">
        <button
          type="button"
          onClick={() => {
            setSelected(null);
            setCheckoutState('form');
          }}
          className="text-slate-500 flex items-center gap-1 text-sm font-bold mb-4 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          {checkoutState === 'form' && (
            <>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black text-slate-900">{selected} Exam</h2>
                <div className="bg-slate-100 p-2 rounded-xl">
                  <Activity className="h-6 w-6 text-slate-900" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-6">$997</div>
              <form onSubmit={processPayment} className="space-y-4">
                <input required placeholder="Card Number" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="MM/YY" className="p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none" />
                  <input required placeholder="CVC" className="p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" /> Secure Checkout
                </button>
              </form>
            </>
          )}

          {checkoutState === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-bold text-slate-900">Processing Payment...</p>
            </div>
          )}

          {checkoutState === 'success' && (
            <div className="text-center py-8 animate-in zoom-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Booking Confirmed</h2>
              <p className="text-slate-500 mb-6">Order #TY-88392. A coordinator will contact you shortly.</p>
              <button type="button" onClick={() => setSelected(null)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in">
      <h1 className="text-2xl font-black text-slate-900">Medical Evidence</h1>
      <div className="grid gap-4">
        {['Physical Exam', 'Mental Health Review', 'Specialist Exam (TBI)'].map((title) => (
          <button
            key={title}
            type="button"
            onClick={() => setSelected(title)}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between active:scale-95 transition-transform cursor-pointer hover:border-blue-400"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500">$997 • Private Network</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
};

const Dossier = ({ user, docs = [] }) => (
  <div className="p-6 pt-12 text-center animate-in zoom-in-95">
    <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-lg">
      <User className="h-10 w-10 text-slate-400" />
    </div>
    <h2 className="text-2xl font-black text-slate-900">{user?.name || 'Veteran'}</h2>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8">{user?.branch || 'Branch'} • {user?.era || 'Era'}</p>

    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <span className="block text-4xl font-black text-blue-600">{user?.rating || '0'}%</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Service Connected</span>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <span className="block text-4xl font-black text-green-600">Active</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
      </div>
    </div>

    <div className="text-left mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Digital Vault</h3>
        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{docs.length} Items</span>
      </div>

      {docs.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
          <ScanLine className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">No documents scanned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in fade-in zoom-in">
              <div className="aspect-[3/4] bg-slate-100 rounded-lg mb-2 overflow-hidden border border-slate-200">
                {doc.image ? (
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-700 truncate">{doc.name}</p>
              <p className="text-[8px] text-slate-400 font-medium">{doc.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    <button type="button" className="text-red-500 text-sm font-bold bg-red-50 px-6 py-3 rounded-xl w-full active:scale-95 transition-transform">
      Sign Out
    </button>
  </div>
);

const DemoApp = () => {
  const [view, setView] = useState('launch');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('ops');
  const [scannedDocs, setScannedDocs] = useState([]);

  const handleLaunchStart = () => setView('onboarding');

  const handleOnboardComplete = (data) => {
    setUser(data);
    setView('app');
  };

  if (view === 'launch') return <LaunchScreen onStart={handleLaunchStart} />;
  if (view === 'onboarding') return <Onboarding onComplete={handleOnboardComplete} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200">
      <Header user={user} />
      <main className="h-full overflow-y-auto custom-scrollbar">
        {activeTab === 'ops' && <OpsCenter onNavigate={setActiveTab} user={user} />}
        {activeTab === 'angela' && <AngelaAI user={user} />}
        {activeTab === 'life' && <LifeHub user={user} onScanComplete={(doc) => setScannedDocs([...scannedDocs, doc])} />}
        {activeTab === 'exams' && <ExamsStore />}
        {activeTab === 'dossier' && <Dossier user={user} docs={scannedDocs} />}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DemoApp;
