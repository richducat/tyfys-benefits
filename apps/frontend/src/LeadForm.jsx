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
  ClipboardList 
} from './demoIcons';

const responsiveFieldGridStyle = {
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
};

export function LeadForm({ data, onSubmit, isSubmitting, submitError }) {
    const [consentState, setConsentState] = useState({
        privateOrg: false,
        terms: false,
        sms: false,
        bestContact: { text: false, email: false, phone: false }
    });
    const [errors, setErrors] = useState({});

    const hasBestContact = Object.values(consentState.bestContact).some(v => v);
    const canSubmit = consentState.privateOrg && consentState.terms && consentState.sms && hasBestContact && !isSubmitting;

    const getDynamicHeader = () => {
        const params = new URLSearchParams(window.location.search);
        const goal = params.get('goal');
        if (goal === 'increase') return "Ready for your VA disability increase?";
        if (goal === 'appeal') return "Need help with a VA claim appeal?";
        if (goal === 'new') return "Filing your first VA disability claim?";
        return data.header || "Get Your Free Benefits Evaluation";
    };

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
        if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
            cleanPhone = cleanPhone.substring(1);
        }

        const uniqueDigits = new Set(cleanPhone.split('')).size;
        const isRepeatingPattern = /(\d\d)\1\1/.test(cleanPhone);
        const sequences = ['1234567890', '0987654321', '0000000000', '1111111111', '1212121212'];

        if (cleanPhone.length !== 10) newErrors.phone = "10-digit US phone required.";
        else if (sequences.includes(cleanPhone) || /^(\d)\1+$/.test(cleanPhone)) newErrors.phone = "Valid phone required.";
        else if (uniqueDigits <= 2) newErrors.phone = "Valid phone required.";
        else if (isRepeatingPattern) newErrors.phone = "Valid phone required.";
        else if (parseInt(cleanPhone[0]) < 2 || parseInt(cleanPhone[3]) < 2) newErrors.phone = "Valid area code required.";

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const profanityList = ['fuck', 'dick', 'shit', 'piss', 'cunt', 'bitch', 'asshole', 'cock', 'sucker', 'whore'];
        const lowerEmail = values.email.toLowerCase();
        const domainPart = lowerEmail.split('@')[1] || '';
        const userPart = lowerEmail.split('@')[0] || '';
        const baseDomain = domainPart.split('.')[0];
        const isUserRepeated = /^([a-z0-9])\1+$/.test(userPart);
        const uniqueCharsUser = new Set(userPart.split('')).size;
        const domainLabels = domainPart.split('.');
        const hasInvalidDomainLabel = domainLabels.some(label => !label || label.startsWith('-') || label.endsWith('-'));

        if (lowerEmail.includes('..') || lowerEmail.startsWith('.') || lowerEmail.endsWith('.')) newErrors.email = "Check for typos.";
        else if (!emailRegex.test(values.email)) newErrors.email = "Valid email required.";
        else if (profanityList.some(word => lowerEmail.includes(word))) newErrors.email = "Professional email required.";
        else if (hasInvalidDomainLabel) newErrors.email = "Valid email required.";
        else if (userPart === baseDomain) newErrors.email = "Valid email required.";
        else if (isUserRepeated) newErrors.email = "Valid email required.";
        else if (userPart.length > 5 && uniqueCharsUser < 3) newErrors.email = "Valid email required.";

        const claimReason = String(values.claimReason || '').trim();
        if (!claimReason) newErrors.claimReason = "Share your primary reason for filing.";

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
        <div>
            <div className="mb-8 flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-blue-800 text-sm font-bold">
                    <div className="relative w-2 h-2">
                        <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    Online Now
                </div>
                <div className="text-[11px] text-blue-600 font-semibold tracking-wide uppercase sm:text-xs">
                    3 Specialists Available
                </div>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {getDynamicHeader()}
            </h1>
            <p className="text-slate-500 text-lg mb-8">
                {data.subtext}
            </p>

            <form onSubmit={handleLocalSubmit} className="space-y-4" noValidate>
                <div className="relative min-w-0 group">
                    <label className="mb-1.5 block text-sm font-bold text-slate-700 leading-snug">
                        What is your primary reason for wanting to file a VA claim?
                    </label>
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
                            <input
                                name="firstName"
                                required
                                type="text"
                                autoComplete="given-name"
                                className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}
                                placeholder="John"
                            />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.firstName}</p>}
                    </div>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Last Name</label>
                        <div className="relative min-w-0">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                name="lastName"
                                required
                                type="text"
                                autoComplete="family-name"
                                className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}
                                placeholder="Doe"
                            />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.lastName}</p>}
                    </div>
                </div>

                <div className="grid gap-4" style={responsiveFieldGridStyle}>
                     <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Email Address</label>
                        <div className="relative min-w-0">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                name="email"
                                required
                                type="email"
                                autoComplete="email"
                                className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}
                                placeholder="john@example.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.email}</p>}
                    </div>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Phone Number</label>
                        <div className="relative min-w-0">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                name="phone"
                                required
                                type="tel"
                                autoComplete="tel"
                                maxLength={14}
                                className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}
                                placeholder="(555) 123-4567"
                                onInput={(e) => {
                                    let v = e.target.value.replace(/\D/g, '');
                                    if (v.length > 10 && v.startsWith('1')) v = v.substring(1);
                                    if (v.length > 10) v = v.slice(0, 10);
                                    if (v.length > 6) e.target.value = `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;
                                    else if (v.length > 3) e.target.value = `(${v.slice(0,3)}) ${v.slice(3)}`;
                                    else e.target.value = v;
                                }}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.phone}</p>}
                    </div>
                </div>

                <div className="grid gap-4" style={responsiveFieldGridStyle}>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Branch Of Service</label>
                        <div className="relative min-w-0">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <select
                                name="branch"
                                required
                                defaultValue=""
                                className={`w-full min-w-0 appearance-none rounded-xl border-2 py-3.5 pl-11 pr-10 font-medium text-slate-900 outline-none transition-all ${errors.branch ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}
                            >
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
                            <input
                                name="zipCode"
                                required
                                type="text"
                                autoComplete="postal-code"
                                maxLength={5}
                                className={`w-full min-w-0 rounded-xl border-2 py-3.5 pl-11 pr-4 font-medium text-slate-900 outline-none transition-all ${errors.zipCode ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} focus:border-blue-600 focus:bg-white`}
                                placeholder="12345"
                            />
                        </div>
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.zipCode}</p>}
                    </div>
                    <div className="relative min-w-0 group">
                        <label className="ml-1 mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Best Time To Contact</label>
                        <div className="relative min-w-0">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <select name="bestTime" className="w-full min-w-0 appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 font-medium text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white">
                                <option>Morning (9AM - 12PM)</option>
                                <option>Afternoon (12PM - 4PM)</option>
                                <option>Evening (4PM - 7PM)</option>
                                <option>Anytime</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="py-2">
                    <label className="ml-1 mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 leading-tight">Best Form Of Contact</label>
                    <div className="flex flex-wrap gap-3" role="group" aria-label="Best form of contact">
                        {[
                            ['text', 'Text'],
                            ['email', 'Email'],
                            ['phone', 'Phone']
                        ].map(([method, label]) => {
                            const isSelected = consentState.bestContact[method];
                            return (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => handleContactMethodChange(method)}
                                    aria-pressed={isSelected}
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-medium text-sm transition-colors ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                                    }`}>
                                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                    </span>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    {errors.bestContact && <p className="text-red-500 text-xs mt-2 ml-1 font-medium flex items-center gap-1"><AlertCircle size={10}/> {errors.bestContact}</p>}
                </div>

                <hr className="border-slate-100 my-6" />

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">Before You Submit:</h4>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        By hitting submit you recognize that we are a <strong className="text-slate-900">private organization</strong> that works with United States Veterans looking to file a Disability claim with the Veterans Administration.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-colors group">
                        <input
                            type="checkbox"
                            checked={consentState.privateOrg}
                            onChange={() => handleConsentChange('privateOrg')}
                            className="sr-only"
                            aria-label="I understand and wish to continue"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${consentState.privateOrg ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                            {consentState.privateOrg && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`text-xs font-bold uppercase ${consentState.privateOrg ? 'text-blue-700' : 'text-slate-500'}`}>I understand & wish to continue</span>
                    </label>
                </div>

                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={consentState.terms} onChange={() => handleConsentChange('terms')} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" />
                        <span className="text-xs text-slate-600">
                            Confirm you've read our <a href="sms-terms.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">terms and service</a>.
                        </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={consentState.sms} onChange={() => handleConsentChange('sms')} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600" />
                        <span className="text-xs text-slate-600">
                            By checking this box, you consent to receive text messages from Thank You For Your Service.
                        </span>
                    </label>
                </div>

                <div className="pt-4">
                    {(!hasBestContact || !consentState.privateOrg || !consentState.terms || !consentState.sms) && (
                        <p className="mb-3 text-xs text-slate-500">Choose a contact method and check all 3 consent boxes to enable Continue.</p>
                    )}
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group border-b-4 border-green-700 active:border-b-0 active:mt-1"
                    >
                        {isSubmitting ? 'Processing...' : (
                            <>
                                CONTINUE <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {submitError && (
                        <p className="mt-3 text-sm font-semibold text-red-600">{submitError}</p>
                    )}
                   
                    <div className="text-center mt-6 space-y-4">
                        <div className="flex gap-3 items-center justify-center text-left max-w-sm mx-auto">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=William&backgroundColor=e6e6e6" alt="William" />
                            </div>
                            <div>
                                <p className="text-[10px] italic text-slate-600">"The free consultation really helped educate me... I was able to take the next steps with confidence."</p>
                                <p className="text-[10px] font-bold text-slate-800">- William R, NC</p>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500">
                            <strong className="text-slate-900 block mb-1">*WE ONLY HIRE AMERICAN.</strong>
                            We are American owned & Operated. Your Free Benefits Evaluation is done over the phone with a <strong className="text-slate-900">live U.S. Representative.</strong>
                        </div>
                       
                        <p className="text-[10px] text-slate-400 leading-tight">
                            <strong>SMS CONSENT POLICY:</strong> By submitting your phone number, you agree to receive texts and calls about your VA benefits evaluation. Message and data rates may apply. Reply STOP to opt-out. Consent is not a condition of service.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}

export function SuccessView({ formData }) {
    const getChecklistItems = () => {
        const items = ["DD-214 (Member-4 Copy)", "Active VA.gov Login"];
        if (formData.goal === 'new') { items.push("Service Treatment Records (STRs)"); items.push("Private Medical Records (Diagnosis)"); }
        else if (formData.goal === 'increase') { items.push("Current Rating Breakdown Letter"); items.push("List of Current Medications"); }
        else if (formData.goal === 'appeal') { items.push("Copy of Denial Letter"); items.push("C-File (Claims File)"); }
        else if (formData.goal === 'info') { items.push("Any existing medical evidence"); }
        return items;
    };
    const checklistItems = getChecklistItems();
    return (
        <div className="flex items-center justify-center p-4 min-h-[550px]">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden p-8 text-center relative">
                {[...Array(15)].map((_, i) => (<div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-bounce" style={{ top: '-10%', left: `${Math.random() * 100}%`, backgroundColor: ['#fbbf24', '#3b82f6', '#22c55e'][Math.floor(Math.random() * 3)], animationDuration: `${2 + Math.random() * 3}s`, animationDelay: `${Math.random()}s`, }} />))}

                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-green-600" /></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h2>
                <p className="text-slate-500 text-sm mb-6">Our Intake Team is reviewing your profile.</p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs text-slate-600 mb-6 shadow-sm">
                    <p className="font-bold text-slate-900 mb-2 flex items-center gap-1.5"><ClipboardList size={14} className="text-green-600"/> Prep for your Call:</p>
                    <ul className="space-y-2 ml-1">{checklistItems.map((item, index) => (<li key={index} className="flex items-start gap-1.5"><span className="text-blue-600 font-bold mt-0.5">•</span><span>Locate your <strong>{item}</strong>.</span></li>))}</ul>
                </div>
                <a href="https://tyfys.net/assessment-thank-you.html" className="block w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg text-sm">Next Steps: Document Prep Page</a>
            </div>
        </div>
    );
}
