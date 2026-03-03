const { useState, useEffect, useRef } = React;
    const {
      Shield,
      Swords,
      Users,
      Award,
      Activity,
      FileCheck,
      Stethoscope,
      Pill,
      Clock,
      CheckCircle2,
      ChevronRight,
      Sparkles,
      Trophy,
      AlertCircle,
      MessageSquare,
      CalendarHeart,
      LogOut,
      HeartPulse,
      Send,
      Bot,
      Watch,
      Map,
      Fingerprint,
      BellRing,
      SmartphoneNfc,
      ClipboardList,
      History,
      FileSignature,
      Lock,
      Eye,
      Package,
      Wallet,
      UserCheck,
      Search,
      TrendingUp,
      Settings,
      MoreVertical
    } = LucideReact;

    const INITIAL_INVENTORY = [
      { id: "KIT-9901", type: "Active Drug", status: "In-Stock", location: "Fridge A (-20C)", expiry: "2027-01-12" },
      { id: "KIT-9902", type: "Active Drug", status: "Dispensed", location: "SUBJ-001", expiry: "2027-01-12" },
      { id: "KIT-4405", type: "Placebo", status: "In-Stock", location: "Cabinet 4", expiry: "2027-05-20" },
      { id: "KIT-4406", type: "Active Drug", status: "In-Stock", location: "Fridge A (-20C)", expiry: "2027-02-15" },
    ];

    const INITIAL_DELEGATION = [
      { name: "Dr. Miller", role: "PI", duties: ["All Oversight", "Inclusion/Exclusion"], status: "Active" },
      { name: "Nurse Sarah", role: "Study Coordinator", duties: ["Vitals", "Dispensing", "ECG"], status: "Active" },
      { name: "James Wu", role: "Lab Tech", duties: ["Phlebotomy", "Processing"], status: "Active" },
    ];

    const INITIAL_QUESTS = [
      { id: 1, title: "Screening: Patient 004", description: "Complete the initial screening CRF for new candidate.", type: "Clinical", xp: 150, urgency: "High", completed: false, signed: false, icon: Users },
      { id: 2, title: "Drug Return: SUBJ-001", description: "Perform pill count on returned bottle from Cycle 1.", type: "Pharmacy", xp: 100, urgency: "Medium", completed: false, signed: false, icon: Package },
      { id: 3, title: "AE Review: SUBJ-002", description: "Sign off on mild headache reported in eDiary.", type: "Safety", xp: 200, urgency: "High", completed: false, signed: false, icon: AlertCircle },
      { id: 4, title: "Update DoA Log", description: "Acknowledge new training for Nurse Sarah.", type: "Admin", xp: 50, urgency: "Low", completed: false, signed: false, icon: UserCheck },
    ];

    const INITIAL_PATIENTS = [
      { id: "SUBJ-001", name: "Sarah Jenkins", status: "Active", phase: "Cycle 2", consent: "Signed", stipend: 150, health: 100, nextVisit: "Oct 12, 2026", missedEntries: 0 },
      { id: "SUBJ-002", name: "Robert Chen", status: "Active", phase: "Cycle 1", consent: "Signed", stipend: 50, health: 85, nextVisit: "Oct 15, 2026", missedEntries: 1 },
      { id: "SUBJ-003", name: "Elena Rodriguez", status: "Screening", phase: "Screening", consent: "Signed", stipend: 0, health: 100, nextVisit: "Oct 10, 2026", missedEntries: 0 },
      { id: "SUBJ-004", name: "David Kim", status: "Pending", phase: "Informed Consent", consent: "Not Signed", stipend: 0, health: 100, nextVisit: "TBD", missedEntries: 0 },
    ];

    const INITIAL_PATIENT_QUESTS = [
      { id: 101, title: "Morning eDiary", description: "Log your heart rate and temp.", xp: 50, completed: false, icon: HeartPulse },
      { id: 102, title: "Dose 2 (PM)", description: "Take medication with water.", xp: 100, completed: false, icon: Pill },
    ];

    const PATIENT_JOURNEY = [
      { id: 1, phase: "Screening", date: "Sep 15", status: "completed" },
      { id: 2, phase: "Cycle 1", date: "Oct 01", status: "completed" },
      { id: 3, phase: "Cycle 2", date: "Oct 15", status: "current" },
      { id: 4, phase: "Cycle 3", date: "Oct 29", status: "upcoming" },
    ];

    const INITIAL_AUDIT = [
      { id: 1, user: "Dr. Miller", action: "Authorized Delegation Log", timestamp: "2026-10-09 09:00:00", trace: "E-SIG-772" },
      { id: 2, user: "System", action: "Inventory kit KIT-9902 auto-logged as dispensed", timestamp: "2026-10-09 10:45:00", trace: "SYS-AUTO" },
    ];

    const LOGIN_USERNAME = "admin";
    const LOGIN_PASSWORD = "password";

    function App() {
      const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('clinic_auth') === '1');
      const [loginUsername, setLoginUsername] = useState('');
      const [loginPassword, setLoginPassword] = useState('');
      const [loginError, setLoginError] = useState('');

      const [activeTab, setActiveTab] = useState('dashboard');
      const [role, setRole] = useState('clinic');
      const [monitorMode, setMonitorMode] = useState(false);
      const [xp, setXp] = useState(2450);
      const [quests, setQuests] = useState(INITIAL_QUESTS);
      const [patients, setPatients] = useState(INITIAL_PATIENTS);
      const [patientQuests, setPatientQuests] = useState(INITIAL_PATIENT_QUESTS);
      const [inventory, setInventory] = useState(INITIAL_INVENTORY);
      const [delegation, setDelegation] = useState(INITIAL_DELEGATION);
      const [auditLog, setAuditLog] = useState(INITIAL_AUDIT);
      const [messages, setMessages] = useState([
        { id: 1, sender: "Patient 001", text: "I have a mild headache today after taking the medication.", time: "09:30 AM", isClinic: false },
        { id: 2, sender: "Dr. Miller", text: "Thank you for reporting this. Please log it in your daily eDiary quest. I will review it shortly.", time: "09:45 AM", isClinic: true }
      ]);
      const [oracleMessages, setOracleMessages] = useState([
        { id: 1, sender: 'ai', text: 'Oracle Online. Protocol ONC-2026-X loaded. Ready for medical oversight.' }
      ]);
      const [newMessage, setNewMessage] = useState("");
      const [oracleInput, setOracleInput] = useState("");
      const [notifications, setNotifications] = useState([]);
      const [signingItem, setSigningItem] = useState(null);
      const scrollRef = useRef(null);

      const level = Math.floor(xp / 1000) + 1;
      const progressPercent = ((xp % 1000) / 1000) * 100;

      const logAudit = (action) => {
        const entry = {
          id: Date.now(),
          user: role === 'clinic' ? 'Dr. Miller' : 'Patient 001',
          action,
          timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
          trace: Math.random().toString(36).substring(7).toUpperCase()
        };
        setAuditLog(prev => [entry, ...prev]);
      };

      const notify = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
      };

      const handleQuestComplete = (id) => {
        setQuests(quests.map(q => {
          if (q.id === id) {
            logAudit(`21CFR-SIGN: Digitally locked record for ${q.title}`);
            notify(`+${q.xp} XP Gained!`, 'xp');
            setXp(x => x + q.xp);
            return { ...q, completed: true, signed: true };
          }
          return q;
        }));
        setSigningItem(null);
      };

      const handleDispense = (kitId) => {
        setInventory(inventory.map(k => k.id === kitId ? { ...k, status: 'Dispensed' } : k));
        logAudit(`INVENTORY: Kit ${kitId} dispensed`);
        notify(`Kit ${kitId} Dispensed`, 'achievement');
        setXp(x => x + 50);
      };

      const handleStipend = (id) => {
        setPatients(patients.map(p => p.id === id ? { ...p, stipend: p.stipend + 50 } : p));
        logAudit(`STIPEND: $50 released to subject ${id}`);
        notify(`Stipend Released`, 'achievement');
      };

      const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setMessages([...messages, {
          id: Date.now(),
          sender: role === 'clinic' ? 'Dr. Miller' : 'Sarah Jenkins',
          text: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isClinic: role === 'clinic'
        }]);
        setNewMessage("");
        logAudit(`COMMS: Secure message sent`);
      };

      const handleOracleAsk = (e) => {
        e.preventDefault();
        if (!oracleInput.trim()) return;
        setOracleMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: oracleInput }]);
        const input = oracleInput;
        setOracleInput("");

        setTimeout(() => {
          let response = "I am processing your request against Protocol v2.1...";
          if (input.toLowerCase().includes("dose")) response = "Section 4.2 states: In case of Grade 2 fatigue, dose should be held for 7 days. Patient 002 matches this criteria.";
          if (input.toLowerCase().includes("inclusion")) response = "Section 3.1: Patients must have a hemoglobin level > 9.0 g/dL at screening.";

          setOracleMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: response }]);
        }, 1000);
      };

      const handleLogin = (e) => {
        e.preventDefault();
        if (loginUsername === LOGIN_USERNAME && loginPassword === LOGIN_PASSWORD) {
          sessionStorage.setItem('clinic_auth', '1');
          setIsAuthenticated(true);
          setLoginError('');
          setLoginPassword('');
        } else {
          setLoginError('Invalid credentials.');
        }
      };

      const handleLogoutSession = () => {
        sessionStorage.removeItem('clinic_auth');
        setIsAuthenticated(false);
        setLoginPassword('');
        setLoginUsername('');
      };

      const NavItem = ({ id, label, icon: Icon }) => (
        <button
          onClick={() => setActiveTab(id)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
            activeTab === id
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
              : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <Icon size={18} />
          <span className="font-bold text-sm tracking-tight">{label}</span>
        </button>
      );

      if (!isAuthenticated) {
        return (
          <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white text-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-indigo-700 p-8 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-white/15">
                    <Lock size={22} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Secure Access</p>
                </div>
                <h1 className="text-2xl font-black tracking-tight">TYFYS Clinic Portal</h1>
                <p className="text-indigo-100 mt-2 text-sm">Authorized clinic and patient operations only.</p>
              </div>

              <form onSubmit={handleLogin} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Username</label>
                  <input
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    autoComplete="current-password"
                  />
                </div>

                {loginError && (
                  <p className="text-red-600 text-sm font-semibold">{loginError}</p>
                )}

                <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all">
                  Unlock Clinic
                </button>
              </form>
            </div>
          </div>
        );
      }

      return (
        <div className={`min-h-screen flex flex-col md:flex-row font-sans text-slate-800 transition-colors duration-500 ${monitorMode ? 'bg-slate-200' : 'bg-slate-50'}`}>

          {signingItem && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
                <div className="bg-slate-900 p-8 text-white relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/30"><FileSignature size={24}/></div>
                    <div>
                      <h3 className="text-xl font-black">Electronic Signature</h3>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Authorized PI Sign-off</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm italic leading-relaxed border-l-2 border-indigo-500 pl-4 py-2 bg-white/5 rounded-r-xl">
                    "I confirm that this clinical record is accurate and reflects source documentation observed at the site."
                  </p>
                </div>
                <div className="p-10">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Clinical PIN Verification</label>
                  <div className="flex gap-2 justify-center mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300">●</div>)}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setSigningItem(null)} className="py-4 font-black text-slate-400 hover:text-slate-600 uppercase text-xs tracking-widest transition-colors">Cancel</button>
                    <button onClick={() => handleQuestComplete(signingItem.id)} className="py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1">Verify Sign</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm z-10">
            <div className="flex items-center gap-4 mb-10 px-2">
              <div className="bg-indigo-600 p-3 rounded-[1.25rem] text-white shadow-xl shadow-indigo-200"><Activity size={24} /></div>
              <div>
                <h1 className="font-black text-2xl text-slate-900 tracking-tighter leading-none">MedQuest</h1>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Enterprise CTMS</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2 flex-grow">
              {role === 'clinic' ? (
                <>
                  <NavItem id="dashboard" label="Flight Deck" icon={Shield} />
                  <NavItem id="inventory" label="IP Inventory" icon={Package} />
                  <NavItem id="delegation" label="Delegation Log" icon={UserCheck} />
                  <NavItem id="patients" label="Subject Roster" icon={Users} />
                  <NavItem id="stipends" label="Stipend Wallet" icon={Wallet} />
                  <NavItem id="oracle" label="Protocol Oracle" icon={Bot} />
                  <NavItem id="messages" label="Secure Comms" icon={MessageSquare} />
                  <NavItem id="audit" label="Audit Vault" icon={History} />
                </>
              ) : (
                <>
                  <NavItem id="dashboard" label="Home Base" icon={CalendarHeart} />
                  <NavItem id="journey" label="My Journey" icon={Map} />
                  <NavItem id="patient_quests" label="Daily eDiary" icon={HeartPulse} />
                  <NavItem id="messages" label="Care Team" icon={MessageSquare} />
                </>
              )}
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <div className="bg-slate-50 rounded-3xl p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</span>
                  <button
                    onClick={() => {setRole(role === 'clinic' ? 'patient' : 'clinic'); setActiveTab('dashboard');}}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    title="Switch clinic/patient view"
                  >
                    <Users size={16}/>
                  </button>
                </div>
                {role === 'clinic' && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitor</span>
                    <button onClick={() => setMonitorMode(!monitorMode)} className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${monitorMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all shadow-sm ${monitorMode ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 px-2">
                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white font-black text-sm shadow-xl ${role === 'clinic' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-emerald-500 shadow-emerald-100'}`}>
                  {role === 'clinic' ? 'PI' : 'P1'}
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-sm text-slate-900 truncate">{role === 'clinic' ? 'Dr. Miller' : 'Sarah Jenkins'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role === 'clinic' ? 'Investigator' : 'Subject 001'}</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className={`px-10 py-6 border-b flex items-center justify-between shadow-sm transition-all duration-500 z-0 ${monitorMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-100'}`}>
              <div className="flex items-center gap-5">
                <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3 capitalize">
                  {monitorMode && <Eye size={22} className="text-amber-400 animate-pulse" />}
                  {activeTab.replace('_', ' ')}
                </h2>
                <div className="h-8 w-[2px] bg-slate-200/50 hidden md:block" />
                <div className="hidden md:block">
                  <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.25em]">Protocol ID</p>
                  <p className="text-xs font-black tracking-widest">ONC-2026-X</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block mr-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Site Performance</p>
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000" style={{width: `${progressPercent}%`}} />
                    </div>
                    <span className="text-sm font-black text-indigo-600">Lvl {level}</span>
                  </div>
                </div>
                <button onClick={handleLogoutSession} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all" title="Log out">
                  <LogOut size={20} />
                </button>
                <button className="p-3 bg-slate-100 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-slate-400">
                  <Settings size={20} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 bg-transparent">
              <div className="max-w-6xl mx-auto pb-24">

                {role === 'clinic' && activeTab === 'dashboard' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-3 h-full bg-red-500" />
                        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                          <AlertCircle className="text-red-500" /> High-Urgency Quests
                        </h3>
                        <div className="space-y-5">
                          {quests.filter(q => !q.completed).map(q => (
                            <div key={q.id} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-indigo-300 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                              <div className="flex items-center gap-5">
                                <div className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                  <q.icon size={22} />
                                </div>
                                <div>
                                  <p className="font-black text-sm text-slate-800 tracking-tight">{monitorMode ? 'ANONYMIZED TASK' : q.title}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{q.type} Protocol</p>
                                </div>
                              </div>
                              <button onClick={() => setSigningItem(q)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">SIGN-OFF</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <Bot className="absolute -right-16 -top-16 w-80 h-80 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-indigo-300 tracking-tight">
                          <Sparkles size={22} /> Intelligence Feed
                        </h3>
                        <div className="space-y-5 relative z-10">
                          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex justify-between mb-3 items-center">
                              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Oracle Insight</span>
                              <TrendingUp size={16} className="text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium leading-relaxed">System scan indicates <span className="text-white font-bold underline decoration-indigo-400 underline-offset-4 tracking-tight">SUBJ-002</span> has reported potential AE symptoms. Protocol Oracle suggests immediate review.</p>
                          </div>
                          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/5 flex justify-between items-center group/btn cursor-default">
                            <div>
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Wallet Action</p>
                              <p className="text-sm font-medium opacity-80">Subject Finished Visit 4.</p>
                            </div>
                            <button onClick={() => handleStipend("SUBJ-002")} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black hover:bg-emerald-400 shadow-lg shadow-emerald-900/40 transition-all">Release $50</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-8 opacity-10"><CalendarHeart size={120}/></div>
                      <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-4">
                        <CalendarHeart className="text-indigo-600" /> Clinic Flight Plan (Today)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"].map((time, i) => (
                          <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] relative group hover:border-indigo-400 hover:bg-white hover:shadow-xl transition-all duration-500">
                            <span className="absolute -top-4 -right-4 w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-indigo-600 group-hover:rotate-12 transition-all">{i+1}</span>
                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{time}</p>
                            <p className="text-xl font-black text-slate-800 tracking-tighter">{monitorMode ? "SUBJ-XXXX" : i === 0 ? "Sarah J." : `SUBJ-00${i+1}`}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 bg-white px-2 py-1 rounded-lg inline-block shadow-sm">Cycle 2 Day 1</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    {inventory.map(kit => (
                      <div key={kit.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative group hover:shadow-2xl hover:border-indigo-300 transition-all overflow-hidden border-b-8 border-b-slate-100">
                        <Package className="absolute -right-8 -bottom-8 w-40 h-40 opacity-5 text-slate-900 transition-transform duration-700 group-hover:scale-125" />
                        <div className="flex justify-between items-start mb-8">
                          <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${kit.status === 'In-Stock' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{kit.status}</span>
                          <button className="text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={20}/></button>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{kit.id}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">{kit.type}</p>
                        <div className="pt-8 border-t border-slate-100 space-y-4 mb-10">
                          <div className="flex justify-between text-xs font-medium"><span className="text-slate-400 uppercase tracking-widest">Location</span><span className="font-black text-slate-700">{kit.location}</span></div>
                          <div className="flex justify-between text-xs font-medium"><span className="text-slate-400 uppercase tracking-widest">Expiry Date</span><span className="font-black text-red-500">{kit.expiry}</span></div>
                        </div>
                        {kit.status === 'In-Stock' && (
                          <button onClick={() => handleDispense(kit.id)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-[0.1em]">Dispense Kit</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'delegation' && (
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                    <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row justify-between items-center gap-10">
                      <div>
                        <h3 className="text-4xl font-black tracking-tighter mb-3">Delegation of Authority</h3>
                        <p className="text-slate-400 font-medium tracking-wide">FDA Verified Log • Site US-044-GA</p>
                      </div>
                      <button className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl shadow-indigo-900/50 flex items-center gap-3 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
                        <FileSignature size={22}/> Certify Team
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Study Assignment</th>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Scope</th>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PI Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {delegation.map((person, i) => (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-12 py-8 font-black text-slate-900 text-lg">{person.name}</td>
                              <td className="px-12 py-8 text-sm font-bold text-slate-500 uppercase tracking-wider">{person.role}</td>
                              <td className="px-12 py-8">
                                <div className="flex flex-wrap gap-2">
                                  {person.duties.map((d, di) => (
                                    <span key={di} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-tight">{d}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-12 py-8">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full inline-flex">
                                  <CheckCircle2 size={16}/> Authorized
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'patients' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    {patients.map(p => (
                      <div key={p.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative group hover:border-indigo-300 hover:shadow-2xl transition-all duration-500">
                        <div className={`absolute top-0 right-0 p-5 rounded-bl-[2rem] border-l border-b transition-colors ${p.consent === 'Signed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                          <FileSignature size={24} />
                        </div>
                        <div className="mb-8">
                          <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{monitorMode ? "SUBJ-XXXX" : p.name}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{p.id} • {p.phase}</p>
                        </div>
                        <div className="space-y-5 mb-10 pt-2">
                          <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Consent Status</span><span className={`${p.consent === 'Signed' ? 'text-emerald-500 font-black' : 'text-red-500'}`}>{p.consent}</span></div>
                          <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Med Adherence</span><span className="font-black text-slate-800 tracking-tight">{p.health}%</span></div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className={`h-full transition-all duration-[1.5s] ease-out ${p.health > 90 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} style={{width: `${p.health}%`}} />
                          </div>
                        </div>
                        <button className="w-full py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">Subject Dossier</button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'stipends' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="bg-emerald-600 p-14 rounded-[3rem] text-white shadow-[0_20px_50px_rgba(16,185,129,0.3)] relative overflow-hidden group">
                      <Wallet className="absolute -right-12 -bottom-12 w-80 h-80 opacity-10 transition-transform duration-[2s] group-hover:scale-110 group-hover:-rotate-12" />
                      <div className="relative z-10">
                        <p className="text-emerald-100 font-black uppercase tracking-[0.3em] text-[11px] mb-3">Total Site Allocation</p>
                        <h2 className="text-6xl font-black tracking-tighter mb-10">$12,450.00</h2>
                        <button className="bg-white text-emerald-700 px-10 py-5 rounded-[1.5rem] font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all">Top-up Funds</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {patients.filter(p => p.status === 'Active').map(p => (
                        <div key={p.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group">
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <h4 className="font-black text-2xl text-slate-900 tracking-tighter">{monitorMode ? "SUBJ-XXXX" : p.name}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Deposit Active</p>
                            </div>
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] transition-colors group-hover:bg-emerald-600 group-hover:text-white"><Wallet size={24}/></div>
                          </div>
                          <div className="bg-slate-50 p-8 rounded-[1.5rem] mb-8 flex justify-between items-center border border-slate-100">
                            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payouts</p><p className="text-3xl font-black text-emerald-700 tracking-tighter">${p.stipend}</p></div>
                            <TrendingUp className="text-emerald-300" size={32} />
                          </div>
                          <button onClick={() => handleStipend(p.id)} className="w-full py-5 bg-emerald-600 text-white rounded-[1.25rem] font-black text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1">Release $50 Payment</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                    <div className="bg-slate-900 p-12 text-white flex justify-between items-center">
                      <div><h3 className="text-3xl font-black tracking-tighter">Audit Ledger</h3><p className="text-slate-400 text-sm font-medium tracking-wide">Immutable Event History • GCP/HIPAA Compliant</p></div>
                      <button className="bg-white/10 px-8 py-4 rounded-2xl font-black text-xs hover:bg-white/20 transition-all flex items-center gap-3 border border-white/10 tracking-widest"><History size={20}/> EXPORT PDF</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time (UTC)</th>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized User</th>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Details</th>
                            <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validation Trace</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auditLog.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-12 py-6 text-xs font-bold text-slate-400">{log.timestamp}</td>
                              <td className="px-12 py-6 text-xs font-black text-slate-800">{log.user}</td>
                              <td className="px-12 py-6 text-xs font-semibold text-slate-600 italic">"{log.action}"</td>
                              <td className="px-12 py-6 text-[10px] font-mono text-indigo-400 uppercase tracking-tighter bg-indigo-50/30 group-hover:bg-indigo-100 transition-colors">{log.trace}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {role === 'patient' && activeTab === 'dashboard' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[3rem] p-16 text-white shadow-2xl relative overflow-hidden group">
                      <Sparkles className="absolute -right-12 -bottom-12 w-80 h-80 opacity-10 transition-transform duration-[3s] group-hover:rotate-12 group-hover:scale-110" />
                      <h2 className="text-5xl font-black mb-6 tracking-tighter">Stay on course, Sarah!</h2>
                      <p className="text-emerald-50 text-xl font-medium opacity-90 max-w-2xl leading-relaxed">Your data entry streak is at 14 days. Completing your morning check-in now will earn you 50 XP and 25 Study Points!</p>
                      <button onClick={() => setActiveTab('patient_quests')} className="mt-10 bg-white text-emerald-700 px-10 py-5 rounded-[1.5rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all">Start Daily Entry</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
                        <div className="p-5 bg-blue-50 text-blue-500 rounded-[2rem] shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all"><CalendarHeart size={40} /></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Next Visit</p><p className="text-2xl font-black text-slate-900 tracking-tighter">Oct 12th</p></div>
                      </div>
                      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
                        <div className="p-5 bg-amber-50 text-amber-500 rounded-[2rem] shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all"><Award size={40} /></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">XP Level</p><p className="text-2xl font-black text-slate-900 tracking-tighter">Lvl {level}</p></div>
                      </div>
                      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all group">
                        <div className="p-5 bg-indigo-50 text-indigo-500 rounded-[2rem] shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all"><Watch size={40} /></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Sync Stats</p><p className="text-2xl font-black text-slate-900 tracking-tighter">Healthy</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {role === 'patient' && activeTab === 'journey' && (
                  <div className="bg-white rounded-[3rem] p-16 border border-slate-200 shadow-sm relative overflow-hidden animate-in fade-in duration-700">
                    <div className="text-center mb-24 relative z-10">
                      <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Study Progression</h2>
                      <p className="text-slate-400 font-semibold tracking-wide text-lg">Your road to medical discovery: Stage 3 of 5</p>
                    </div>
                    <div className="relative max-w-5xl mx-auto pb-16">
                      <div className="absolute top-[3.75rem] left-0 w-full h-4 bg-slate-50 rounded-full z-0 shadow-inner" />
                      <div className="absolute top-[3.75rem] left-0 h-4 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600 rounded-full z-0 transition-all duration-[2s] shadow-[0_10px_30px_rgba(16,185,129,0.4)]" style={{width: '60%'}} />

                      <div className="flex justify-between relative z-10">
                        {PATIENT_JOURNEY.map((step, i) => (
                          <div key={step.id} className="flex flex-col items-center w-40 group">
                            <div className={`w-28 h-28 rounded-[2rem] border-8 bg-white flex items-center justify-center transition-all duration-700 shadow-2xl ${
                              step.status === 'completed' ? 'border-emerald-500 text-emerald-500 rotate-12' :
                              step.status === 'current' ? 'border-teal-500 text-teal-600 scale-125 ring-[12px] ring-teal-50 shadow-teal-200' : 'border-slate-50 text-slate-200 group-hover:border-slate-200 group-hover:text-slate-400'
                            }`}>
                              {step.status === 'completed' ? <CheckCircle2 size={40}/> : step.status === 'current' ? <Fingerprint size={48} className="animate-pulse" /> : <span className="text-2xl font-black opacity-30">{i+1}</span>}
                            </div>
                            <p className={`mt-8 font-black text-lg text-center tracking-tighter ${step.status === 'current' ? 'text-teal-700' : 'text-slate-800'}`}>{step.phase}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 bg-slate-50 px-3 py-1 rounded-full">{step.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(activeTab === 'messages' || activeTab === 'oracle') && (
                  <div className="flex flex-col h-[78vh] bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in duration-500 border-b-[12px] border-b-slate-100">
                    <div className={`px-12 py-8 text-white flex justify-between items-center ${activeTab === 'oracle' ? 'bg-indigo-950 shadow-lg' : role === 'clinic' ? 'bg-slate-900 shadow-lg' : 'bg-emerald-800 shadow-lg'}`}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                          {activeTab === 'oracle' ? <Bot size={24}/> : <MessageSquare size={24}/>}
                        </div>
                        <div>
                          <h3 className="font-black text-xl tracking-tighter">{activeTab === 'oracle' ? 'Protocol Oracle AI' : role === 'clinic' ? 'Subject #001 Connect' : 'MedQuest Care Team'}</h3>
                          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em] mt-1">{activeTab === 'oracle' ? 'Clinical Reasoning Engine' : 'Encrypted Messaging Active'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-slate-50/40">
                      {(activeTab === 'oracle' ? oracleMessages : messages).map(msg => {
                        const isMe = (activeTab === 'oracle' ? msg.sender === 'user' : (role === 'clinic' ? msg.isClinic : !msg.isClinic));
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                            <div className={`px-8 py-5 rounded-[2rem] max-w-[70%] shadow-md border ${
                              isMe ? (role === 'clinic' || activeTab === 'oracle' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-indigo-100' : 'bg-emerald-600 text-white border-emerald-500 rounded-tr-none shadow-emerald-100')
                              : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
                            }`}>
                              <p className="text-base font-medium leading-relaxed tracking-tight">{msg.text}</p>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest pl-2">{msg.sender} {msg.time && `• ${msg.time}`}</span>
                          </div>
                        );
                      })}
                    </div>
                    <form onSubmit={activeTab === 'oracle' ? handleOracleAsk : handleSendMessage} className="p-8 bg-white border-t border-slate-100 flex gap-5">
                      <input
                        type="text"
                        value={activeTab === 'oracle' ? oracleInput : newMessage}
                        onChange={(e) => activeTab === 'oracle' ? setOracleInput(e.target.value) : setNewMessage(e.target.value)}
                        placeholder={activeTab === 'oracle' ? "Inquire about trial protocol..." : "Communicate securely..."}
                        className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-5 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-lg font-medium"
                      />
                      <button type="submit" className={`px-10 rounded-2xl font-black text-white flex items-center gap-3 shadow-2xl transition-all active:scale-95 ${activeTab === 'oracle' ? 'bg-indigo-900 hover:bg-indigo-950' : role === 'clinic' ? 'bg-slate-900 hover:bg-black' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
                        {activeTab === 'oracle' ? <Sparkles size={20}/> : <Send size={20}/>}
                        {activeTab === 'oracle' ? 'ASK' : 'SEND'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === 'patient_quests' && role === 'patient' && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {patientQuests.map(q => (
                      <div key={q.id} className={`p-10 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between group ${q.completed ? 'bg-slate-50 border-slate-100 opacity-50 grayscale' : 'bg-white border-emerald-100 shadow-lg hover:shadow-2xl hover:border-emerald-300'}`}>
                        <div className="flex items-center gap-8">
                          <div className={`p-5 rounded-[2rem] transition-all shadow-inner ${q.completed ? 'bg-slate-200 text-slate-400' : 'bg-emerald-50 text-emerald-600 group-hover:scale-110 group-hover:rotate-6'}`}>
                            <q.icon size={40} />
                          </div>
                          <div>
                            <p className={`text-2xl font-black tracking-tighter ${q.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{q.title}</p>
                            <p className="text-base font-medium text-slate-500 mt-1.5 opacity-80">{q.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incentive</p>
                            <p className="font-black text-emerald-600 flex items-center gap-1.5 justify-end text-lg">+{q.xp} <Sparkles size={18}/></p>
                          </div>
                          <button
                            disabled={q.completed}
                            onClick={() => {
                              setXp(x => x + q.xp);
                              notify(`+${q.xp} XP Gained!`, 'xp');
                              setPatientQuests(patientQuests.map(pq => pq.id === q.id ? {...pq, completed: true} : pq));
                              logAudit(`ePRO: Completed daily ${q.title}`);
                            }}
                            className={`px-10 py-5 rounded-[1.25rem] font-black text-sm transition-all tracking-widest uppercase ${q.completed ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xl shadow-emerald-100 active:scale-95'}`}
                          >
                            {q.completed ? 'LOGGED' : 'SUBMIT'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </main>

          <div className="fixed bottom-8 right-8 z-[120] flex flex-col gap-4">
            {notifications.map(note => (
              <div key={note.id} className="bg-slate-900 text-white px-8 py-5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex items-center gap-4 animate-in slide-in-from-right-full duration-500 border border-white/10 backdrop-blur-2xl">
                <div className={`w-4 h-4 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.3)] ${note.type === 'achievement' ? 'bg-amber-400' : 'bg-indigo-500'}`} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('clinic-root')).render(<App />);
