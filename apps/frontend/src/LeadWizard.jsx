import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  ClipboardList,
  ChevronRight,
  Users,
  CheckSquare,
  Square,
  Star,
  Activity,
  Lock,
  TrendingUp,
  FileText
} from './demoIcons';

const LEAD_PREFILL_KEY = 'tyfys.leadPrefill';
const APP_REDIRECT_URL = 'https://app.tyfys.net/?autostart=1&source=homepage';

const baseSteps = [
    {
        id: 'status',
        question: "First things first, are you currently a Veteran?",
        subtext: "We specialize in helping those who have served.",
        type: 'choice',
        options: [
            { label: 'Yes, I am a Veteran', value: 'veteran' },
            { label: 'No, I am a Spouse/Family Member', value: 'spouse' },
            { label: 'No, looking for general info', value: 'other' }
        ],
        footerInfo: (
            <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200 mt-6 text-left">
                <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-600"><Users size={16}/></div>
                <p className="text-xs text-slate-600"><strong>Did you know?</strong> We are Veteran Owned & Operated. We understand your journey.</p>
            </div>
        )
    },
    {
        id: 'rating',
        question: "What is your CURRENT VA Disability Rating?",
        subtext: "Use the slider to select your current rating.",
        type: 'slider',
        footerInfo: (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-6 flex gap-3 items-start text-left">
                <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-600 mt-0.5"><FileText size={16}/></div>
                <div className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">What if I don't know my rating?</span>
                    You can validate your rating by getting a copy of your <em>Disability Breakdown Letter</em> from the Veterans Administration.
                </div>
            </div>
        )
    },
    {
        id: 'conditions',
        question: "What conditions are you looking to claim or increase?",
        subtext: "Select all that apply. We find the 'hidden' high-value claims.",
        type: 'multi-select',
        options: [
            { label: 'Mental Health / PTSD', value: 'ptsd' },
            { label: 'Back, Neck & Joints', value: 'musculoskeletal' },
            { label: 'Tinnitus / Hearing', value: 'hearing' },
            { label: 'Sleep Apnea', value: 'sleep' },
            { label: 'PACT Act / Toxic Exposure', value: 'pact' },
            { label: 'Secondary Conditions', value: 'secondary' }
        ],
        footerInfo: (
            <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden text-left">
                <div className="flex gap-3 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex-shrink-0 overflow-hidden border-2 border-white shadow-sm">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Freddy&backgroundColor=b6e3f4" alt="Freddy K" />
                    </div>
                    <div>
                        <div className="flex gap-0.5 text-amber-400 mb-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                        </div>
                        <p className="text-xs text-slate-700 italic mb-2 leading-relaxed">"These guys really care about Veterans. Rich spent 45 mins listening to my story. You don't normally get service like that these days."</p>
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wide">- Freddy K, CA</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'goal',
        question: "What is your primary goal right now?",
        subtext: "We create a custom Game Plan based on this.",
        type: 'choice',
        options: [
            { label: 'Increase my current rating', value: 'increase' },
            { label: 'Appeal a denial', value: 'appeal' },
            { label: 'File a new claim', value: 'new' },
            { label: 'Just curious about options', value: 'info' }
        ]
    },
    {
        id: 'readiness',
        question: "Document Readiness",
        subtext: "Select documents you currently have:",
        type: 'multi-select',
        options: [
            { label: 'DD-214 (Member-4)', value: 'dd214' },
            { label: 'VA.gov Login Access', value: 'login' }
        ],
        footerInfo: (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6 text-xs text-slate-600 flex gap-3 items-start text-left">
                <div className="bg-white p-1.5 rounded-full shadow-sm text-green-600 mt-0.5"><CheckSquare size={16}/></div>
                <div>
                    <p className="font-bold text-slate-900 mb-1">Why we ask:</p>
                    <p>We build "Fully Developed Claims" which require specific evidence. Select what you have now; our <strong>Stage A Onboarding Team</strong> can help you locate the rest.</p>
                </div>
            </div>
        )
    },
    {
        id: 'analyzing',
        type: 'loading',
        duration: 2500,
        text: "Analyzing your profile..."
    },
    {
        id: 'contact',
        type: 'form',
        question: "Great news. We can help.",
        subtext: "Enter your details to book your Free Discovery Call.",
        buttonText: "Get My Free Consultation"
    }
];

export function LeadWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({ conditions: [], documents: [] });
    const [gclid, setGclid] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [dynamicSteps, setDynamicSteps] = useState(baseSteps);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gclidParam = params.get('gclid') || params.get('GCLID');
        const storedGclid = localStorage.getItem('gclid');
        const finalGclid = gclidParam || storedGclid || "";

        if (finalGclid) {
            setGclid(finalGclid);
            if (gclidParam) localStorage.setItem('gclid', gclidParam);
        }
    }, []);

    useEffect(() => {
        if (formData.goal) {
            const newSteps = [...baseSteps];
            const readinessIndex = newSteps.findIndex(s => s.id === 'readiness');

            if (readinessIndex !== -1) {
                let docOptions = [
                    { label: 'DD-214 (Member-4 Copy)', value: 'dd214' },
                    { label: 'Active VA.gov Login', value: 'login' },
                ];

                if (formData.goal === 'new') {
                    docOptions.push({ label: 'Service Treatment Records (STRs)', value: 'strs' });
                    docOptions.push({ label: 'Private Medical Records', value: 'private_meds' });
                } else if (formData.goal === 'increase') {
                    docOptions.push({ label: 'Current Rating Breakdown Letter', value: 'rating_letter' });
                    docOptions.push({ label: 'VA Medical Notes (Last 6mo)', value: 'va_notes' });
                } else if (formData.goal === 'appeal') {
                    docOptions.push({ label: 'Copy of Denial Letter', value: 'denial_letter' });
                    docOptions.push({ label: 'C-File (Claims File)', value: 'cfile' });
                } else if (formData.goal === 'info') {
                    docOptions.push({ label: 'Any Existing Medical Records', value: 'any_records' });
                }

                newSteps[readinessIndex] = {
                    ...newSteps[readinessIndex],
                    options: docOptions
                };
                setDynamicSteps(newSteps);
            }
        }
    }, [formData.goal]);

    useEffect(() => {
        if (dynamicSteps[currentStep].type === 'loading') {
            const timer = setTimeout(() => {
                handleNext();
            }, dynamicSteps[currentStep].duration);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    const handleNext = (data = {}) => {
        setFormData(prev => ({ ...prev, ...data }));
        if (currentStep < dynamicSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const toggleCondition = (value) => {
        const current = formData.conditions || [];
        if (current.includes(value)) {
            setFormData(prev => ({ ...prev, conditions: current.filter(c => c !== value) }));
        } else {
            setFormData(prev => ({ ...prev, conditions: [...current, value] }));
        }
    };

    const toggleDocument = (value) => {
        const current = formData.documents || [];
        if (current.includes(value)) {
            setFormData(prev => ({ ...prev, documents: current.filter(d => d !== value) }));
        } else {
            setFormData(prev => ({ ...prev, documents: [...current, value] }));
        }
    };

    const handleFinalSubmit = async (contactData) => {
        setIsSubmitting(true);
        setSubmitError('');

        const formattedFirstName = (contactData.firstName || "").trim();
        const formattedLastName = (contactData.lastName || "").trim();
        const fullName = [formattedFirstName, formattedLastName].filter(Boolean).join(' ');

        const selectedDocs = formData.documents || [];
        const contactMethods = [];
        if (contactData.consent?.bestContact?.text) contactMethods.push('Text');
        if (contactData.consent?.bestContact?.email) contactMethods.push('Email');
        if (contactData.consent?.bestContact?.phone) contactMethods.push('Phone');

        const now = new Date();
        const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

        const leadPrefill = {
            firstName: formattedFirstName,
            lastName: formattedLastName,
            email: contactData.email || "",
            phone: contactData.phone || "",
            dob: contactData.dob || "",
            zip: contactData.zipCode || "",
            claimReason: contactData.claimReason || "",
            branch: contactData.branch || "",
            bestTime: contactData.bestTime || "",
            bestContact: contactMethods,
            status: formData.status || "",
            rating: Number(formData.rating || 0),
            conditions: formData.conditions || [],
            goal: formData.goal || "",
            documents: selectedDocs,
            privateOrg: Boolean(contactData.consent?.privateOrg),
            terms: Boolean(contactData.consent?.terms),
            gclid: gclid || "",
            submittedAt: now.toISOString()
        };

        const sheetPayload = {
            "Date created": dateString,
            "Full Name": fullName,
            "First Name": formattedFirstName,
            "Last name": formattedLastName,
            "Email": contactData.email || "",
            "Phone": contactData.phone || "",
            "Date of Birth": contactData.dob || "",
            "Zip": contactData.zipCode || "",
            "What is your primary reason for wanting to file a VA claim?": contactData.claimReason || "",
            "Service Branch": contactData.branch || "",
            "Best time to Contact": contactData.bestTime || "",
            "Best Form of Contact": contactMethods.join(', ') || "",
            "GCLID": gclid || "",
            "Are You Currently A Veteran": formData.status === 'veteran' ? 'Yes' : 'No',
            "Rating Percentage": `${formData.rating || 0}%`,
            "Conditions looking to claim for": formData.conditions?.join(', ') || "",
            "Primary Goal": formData.goal || "",
            "Has DD214?": selectedDocs.includes('dd214') ? 'Yes' : 'No',
            "Has VA Login": selectedDocs.includes('login') ? 'Yes' : 'No',
            "Has Rating breakdown letter": selectedDocs.includes('rating_letter') ? 'Yes' : 'No',
            "Has VA Medical Notes": selectedDocs.includes('va_notes') ? 'Yes' : 'No',
            "Has Copy of denial letter": selectedDocs.includes('denial_letter') ? 'Yes' : 'No',
            "Has C-File": selectedDocs.includes('cfile') ? 'Yes' : 'No',
            "Has Service Treatment Records": selectedDocs.includes('strs') ? 'Yes' : 'No'
        };

        const scriptURL = 'https://script.google.com/macros/s/AKfycbxDs-IJaX15SHb9scERfHOSrFn78WIDRPeY4Kf1QbBJXeJuFOPgosAdtbSnoFZNYV1T2Q/exec';

        try {
            const response = await fetch(scriptURL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(sheetPayload)
            });

            if (!response.ok) {
                throw new Error(`Google Sheet script returned ${response.status}`);
            }

            const result = await response.json().catch(() => ({}));
            if (result?.result && result.result !== 'success') {
                throw new Error(`Unexpected Google Sheet response: ${result.result}`);
            }

            try {
                localStorage.setItem(LEAD_PREFILL_KEY, JSON.stringify(leadPrefill));
            } catch (storageError) {
                console.error('Unable to save lead prefill payload', storageError);
            }

            setIsSuccess(true);
            window.location.href = APP_REDIRECT_URL;
        } catch (error) {
            console.error("Error submitting homepage lead", error);
            setSubmitError("We could not submit your request right now. Please try again or call 321-248-2805.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = ((currentStep + 1) / dynamicSteps.length) * 100;
    const stepData = dynamicSteps[currentStep];
    const isFormStep = stepData.type === 'form';

    if (isSuccess) return <SuccessView formData={formData} />;

    return (
        <div className={`flex justify-center p-4 min-h-[550px] ${isFormStep ? 'items-start' : 'items-center'}`}>
            <div className={`w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative transition-[max-width] duration-300 ${isFormStep ? 'max-w-xl' : 'max-w-md'}`}>
                <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white font-bold">TY</div>
                        <span className="font-bold text-slate-900 text-sm">Thank You For Your Service</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Step {currentStep + 1} of {dynamicSteps.length}</div>
                </div>

                <div className="w-full bg-slate-50 h-1.5">
                    <div className="bg-amber-400 h-1.5 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="p-6 md:p-8">
                    {currentStep > 0 && currentStep < dynamicSteps.length - 1 && stepData.type !== 'loading' && (
                        <button onClick={handleBack} className="text-slate-400 hover:text-slate-700 text-xs font-bold mb-4 flex items-center gap-1 transition-colors uppercase tracking-wide">← Back</button>
                    )}

                   <div className={`animate-fade-in w-full form-accessibility-scale ${isFormStep ? '' : 'min-h-[300px] flex flex-col justify-center'}`}>
                        {stepData.type === 'loading' ? (
                            <LoadingStep text={stepData.text} />
                        ) : stepData.type === 'slider' ? (
                            <SliderStep data={stepData} onNext={handleNext} initialValue={formData[stepData.id]} />
                        ) : stepData.type === 'form' ? (
                            <ContactStep data={stepData} onSubmit={handleFinalSubmit} isSubmitting={isSubmitting} submitError={submitError} previousAnswers={formData} />
                        ) : (
                            <QuestionStep data={stepData} onNext={handleNext} formData={formData} toggleCondition={toggleCondition} toggleDocument={toggleDocument} />
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-blue-900 font-black text-lg">98%</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Success Rate</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-amber-500 font-black text-lg">0%</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Fees on Backpay</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-2">
                        <div className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-600"/> HIPAA Aligned</div>
                        <div className="flex items-center gap-1"><Users size={12} className="text-blue-600"/> SDVOSB Certified</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SliderStep({ data, onNext, initialValue }) {
    const [value, setValue] = useState(initialValue || 0);
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{data.question}</h1>
            <p className="text-slate-500 text-sm mb-6">{data.subtext}</p>
            <div className="w-full py-4">
                <div className="text-center mb-6">
                    <span className="text-6xl font-extrabold text-blue-900 tracking-tight">{value}%</span>
                    <span className="text-lg text-slate-400 font-medium ml-2">Rating</span>
                </div>
                <div className="relative h-10 flex items-center mb-6">
                    <input type="range" min="0" max="100" step="10" value={value} onChange={(e) => setValue(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative">
                         <div className="h-full bg-blue-600 transition-all duration-100 ease-out" style={{ width: `${value}%` }}></div>
                    </div>
                    <div className="absolute w-6 h-6 bg-white border-4 border-amber-400 rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-out flex items-center justify-center z-20" style={{ left: `calc(${value}% - 12px)` }}>
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider"><span>0%</span><span>50%</span><span>100%</span></div>
            </div>
            {data.footerInfo}
                <div className="mt-6 pt-4 border-t border-slate-100">
                     <button onClick={() => onNext({ [data.id]: value })} className="primary-action w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-md py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">Confirm Rating <ChevronRight size={18} /></button>
                </div>
        </div>
    );
}

function QuestionStep({ data, onNext, formData, toggleCondition, toggleDocument }) {
    const isMulti = data.id === 'conditions' || data.id === 'readiness';
    const isDocumentStep = data.id === 'readiness';
    const currentArray = isDocumentStep ? (formData.documents || []) : (formData.conditions || []);
    const toggleFunc = isDocumentStep ? toggleDocument : toggleCondition;
    const hasSelection = isDocumentStep ? true : currentArray.length > 0;

    return (
        <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{data.question}</h1>
            <p className="text-slate-500 text-sm mb-6">{data.subtext}</p>
            <div className="space-y-2">
                {data.options.map((option) => {
                    const isSelected = currentArray.includes(option.value);
                    return (
                        <button key={option.value} onClick={() => { if (isMulti) { toggleFunc(option.value); } else { onNext({ [data.id]: option.value }); } }}
                            className={`choice-button w-full relative p-3 rounded-lg border-2 text-left transition-all duration-200 flex items-center justify-between ${isSelected ? 'border-blue-700 bg-blue-50/50 shadow-sm ring-1 ring-blue-700/20' : 'border-slate-200 hover:border-blue-400 hover:shadow-sm bg-white text-slate-600'}`}>
                            <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{option.label}</span>
                            <div className={`choice-indicator w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>{isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>
                        </button>
                    );
                })}
            </div>
            {data.footerInfo}
            {isMulti && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <button onClick={() => onNext()} disabled={!hasSelection} className={`primary-action w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-md transition-all ${hasSelection ? 'bg-amber-400 text-slate-900 hover:bg-amber-500 hover:-translate-y-0.5 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                        {isDocumentStep ? 'Confirm & Continue' : 'Continue'} <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

function LoadingStep({ text }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <Activity className="absolute inset-0 m-auto text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 animate-pulse">{text}</h2>
            <p className="text-slate-500 text-sm font-medium">Checking eligibility requirements...</p>
        </div>
    );
}

function ContactStep({ data, onSubmit, isSubmitting, submitError, previousAnswers }) {
    const [errors, setErrors] = useState({});
    const [consentState, setConsentState] = useState({
        privateOrg: false,
        terms: false,
        sms: false,
        bestContact: { text: false, email: false, phone: false }
    });

    const getDynamicHeader = () => {
        if (previousAnswers?.goal === 'increase') return "Let's Get Your Rating Increased.";
        if (previousAnswers?.goal === 'appeal') return "Let's Fight That Denial.";
        if (previousAnswers?.goal === 'new') return "Start Your New Claim Right.";
        return data.question;
    };
    
    const responsiveFieldGridStyle = { gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))' };
    const hasBestContact = consentState.bestContact.text || consentState.bestContact.email || consentState.bestContact.phone;
    const canSubmit = hasBestContact && consentState.privateOrg && consentState.terms && consentState.sms && !isSubmitting;

    const handleConsentChange = (field) => {
        setConsentState(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleContactMethodChange = (method) => {
        setConsentState(prev => ({
            ...prev,
            bestContact: { ...prev.bestContact, [method]: !prev.bestContact[method] }
        }));
        setErrors(prev => {
            if (!prev.bestContact) return prev;
            const nextErrors = { ...prev };
            delete nextErrors.bestContact;
            return nextErrors;
        });
    };

    const handleLocalSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        const newErrors = {};

        if (!consentState.privateOrg) {
            alert("Please acknowledge that we are a private organization to continue.");
            return;
        }
        if (!consentState.terms || !consentState.sms) {
            alert("Please accept the Terms & SMS Policy to continue.");
            return;
        }

        const nameRegex = /^[a-zA-Z\s'-]+$/;
        const forbiddenNames = ['test', 'fake', 'asdf', 'qwerty', 'admin', 'user', 'none', 'null', 'spam'];
        const isRepeating = (str) => /(.)\1{2,}/.test(str);

        if (!nameRegex.test(values.firstName)) newErrors.firstName = "Valid first name required.";
        else if (forbiddenNames.includes(values.firstName.toLowerCase()) || isRepeating(values.firstName)) newErrors.firstName = "Real first name required.";

        if (!nameRegex.test(values.lastName)) newErrors.lastName = "Valid last name required.";
        else if (forbiddenNames.includes(values.lastName.toLowerCase()) || isRepeating(values.lastName)) newErrors.lastName = "Real last name required.";

        let cleanPhone = values.phone.replace(/\D/g, '');
        if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) cleanPhone = cleanPhone.substring(1);

        if (cleanPhone.length !== 10) newErrors.phone = "10-digit US phone required.";
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(values.email)) newErrors.email = "Valid email required.";

        const claimReason = String(values.claimReason || '').trim();
        if (!claimReason) newErrors.claimReason = "Share your primary reason for filing.";

        if (!values.dob) newErrors.dob = "Date of Birth is required.";

        if (!values.zipCode || values.zipCode.length < 5) newErrors.zipCode = "Valid Zip Code required.";
        if (!values.branch) newErrors.branch = "Select your branch of service.";

        if (!hasBestContact) {
            newErrors.bestContact = "Choose at least one contact method.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSubmit({ ...values, claimReason, consent: consentState });
    };

    return (
        <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{getDynamicHeader()}</h1>
            <p className="text-slate-500 text-lg mb-8">{data.subtext}</p>

            <form onSubmit={handleLocalSubmit} className="space-y-4" noValidate>
                <div className="relative min-w-0 group">
                    <label className="mb-1.5 block text-sm font-bold text-slate-700 leading-snug">What is your primary reason for wanting to file a VA claim?</label>
                    <textarea
                        name="claimReason"
                        required
                        rows={3}
                        className={`w-full min-w-0 rounded-xl border-2 px-4 py-3.5 font-medium text-slate-900 outline-none transition-all ${errors.claimReason ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}
                        placeholder="Example: I want to increase my rating for PTSD and back pain."
                    />
                    {errors.claimReason && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.claimReason}</p>}
                </div>

                <div className="grid gap-4" style={responsiveFieldGridStyle}>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">First Name</label>
                        <div className="relative min-w-0">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input name="firstName" required type="text" className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`} placeholder="John" />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.firstName}</p>}
                    </div>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Last Name</label>
                        <div className="relative min-w-0">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input name="lastName" required type="text" className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`} placeholder="Doe" />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.lastName}</p>}
                    </div>
                </div>

                <div className="grid gap-4" style={responsiveFieldGridStyle}>
                     <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Email Address</label>
                        <div className="relative min-w-0">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input name="email" required type="email" className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`} placeholder="john@example.com" />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.email}</p>}
                    </div>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Phone Number</label>
                        <div className="relative min-w-0">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input name="phone" required type="tel" className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`} placeholder="(555) 123-4567" onInput={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length > 10 && v.startsWith('1')) v = v.substring(1);
                                if (v.length > 10) v = v.slice(0, 10);
                                if (v.length > 6) e.target.value = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
                                else if (v.length > 3) e.target.value = `(${v.slice(0,3)}) ${v.slice(3)}`;
                                else e.target.value = v;
                            }} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.phone}</p>}
                    </div>
                </div>

                <div className="grid gap-4" style={responsiveFieldGridStyle}>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Date Of Birth</label>
                        <div className="relative min-w-0">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input name="dob" required type="date" className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.dob ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`} />
                        </div>
                        {errors.dob && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.dob}</p>}
                    </div>
                </div>

                <div className="grid gap-4" style={responsiveFieldGridStyle}>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Branch Of Service</label>
                        <div className="relative min-w-0">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <select name="branch" required defaultValue="" className={`w-full min-w-0 appearance-none rounded-xl border-2 py-3.5 pl-11 pr-10 font-medium text-slate-900 outline-none transition-all ${errors.branch ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}>
                                <option value="" disabled>Select your branch</option>
                                <option value="Army">Army</option>
                                <option value="Navy">Navy</option>
                                <option value="Marines">Marines</option>
                                <option value="Air Force">Air Force</option>
                                <option value="Coast Guard">Coast Guard</option>
                                <option value="Space Force">Space Force</option>
                            </select>
                        </div>
                        {errors.branch && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.branch}</p>}
                    </div>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Zip Code</label>
                        <div className="relative min-w-0">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input name="zipCode" required type="text" maxLength={5} className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.zipCode ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`} placeholder="12345" />
                        </div>
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.zipCode}</p>}
                    </div>
                </div>

                <div className="py-2">
                    <label className="ml-1 mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Best Form Of Contact</label>
                    <div className="flex flex-wrap gap-3">
                        {[ ['text', 'Text'], ['email', 'Email'], ['phone', 'Phone'] ].map(([method, label]) => {
                            const isSelected = consentState.bestContact[method];
                            return (
                                <button key={method} type="button" onClick={() => handleContactMethodChange(method)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-medium text-sm transition-colors ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                                    <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                    </span>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-xs">
                    <h4 className="font-bold text-slate-900 uppercase mb-2">Before You Submit:</h4>
                    <p className="text-slate-600 mb-3 leading-relaxed">By hitting submit you recognize that we are a <strong className="text-slate-900">private organization</strong> that works with United States Veterans looking to file a Disability claim with the Veterans Administration.</p>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <input type="checkbox" checked={consentState.privateOrg} onChange={() => handleConsentChange('privateOrg')} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${consentState.privateOrg ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                            {consentState.privateOrg && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`font-bold uppercase ${consentState.privateOrg ? 'text-blue-700' : 'text-slate-500'}`}>I understand & wish to continue</span>
                    </label>
                </div>

                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={consentState.terms} onChange={() => handleConsentChange('terms')} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" />
                        <span className="text-xs text-slate-600">Confirm you've read our <a href="sms-terms.html" target="_blank" className="text-blue-600 underline">terms and service</a>.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={consentState.sms} onChange={() => handleConsentChange('sms')} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" />
                        <span className="text-xs text-slate-600">By checking this box, you consent to receive text messages from Thank You For Your Service.</span>
                    </label>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={!canSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-green-700 active:border-b-0 active:mt-1 flex items-center justify-center gap-2">
                        {isSubmitting ? 'Processing...' : <>CONTINUE <ArrowRight /></>}
                    </button>
                    {submitError && <p className="mt-3 text-sm font-semibold text-red-600">{submitError}</p>}
                </div>
            </form>
        </div>
    );
}

function SuccessView({ formData }) {
    const getChecklistItems = () => {
        const items = ["DD-214 (Member-4 Copy)", "Active VA.gov Login"];
        if (formData.goal === 'new') { items.push("Service Treatment Records (STRs)", "Private Medical Records"); }
        else if (formData.goal === 'increase') { items.push("Current Rating Breakdown Letter", "VA Medical Notes"); }
        else if (formData.goal === 'appeal') { items.push("Copy of Denial Letter", "C-File (Claims File)"); }
        return items;
    };
    return (
        <div className="flex items-center justify-center p-4 min-h-[550px] text-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-green-600" /></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h2>
                <p className="text-slate-500 text-sm mb-6">Our Intake Team is reviewing your profile.</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs mb-6">
                    <p className="font-bold text-slate-900 mb-2 flex items-center gap-1.5"><ClipboardList size={14} className="text-green-600"/> Prep for your Call:</p>
                    <ul className="space-y-2">{getChecklistItems().map((item, i) => (<li key={i} className="flex items-start gap-1.5"><span className="text-blue-600 font-bold">•</span><span>Locate your <strong>{item}</strong>.</span></li>))}</ul>
                </div>
                <a href="https://tyfys.net/assessment-thank-you.html" className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all text-sm">Next Steps: Document Prep Page</a>
            </div>
        </div>
    );
}
