 import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react';
import { 
  CheckCircle2, 
  Shield, 
  ShieldCheck,
  Fingerprint,
  Smartphone, 
  ArrowRight,
  Lock,
  Download,
  HelpCircle,
  Heart,
  ChevronDown,
  Share2,
  Globe,
  Users,
  Bell,
  User,
} from 'lucide-react';
import secondaryLogo from "/assets/SecondMiwillLogo.png";
import homeScreenImg from "/assets/HomeScreen.jpeg";
import guidedQuestion1Img from "/assets/GuidedQuestion1.jpeg";
import guidedQuestion2Img from "/assets/GuidedQuestion2.jpeg";
import willCreationVideo from "/assets/Willcreationoptions.mov";
import heroPhoto from "/assets/HeroPhoto.png";
import lindiwePhoto from "/assets/Lindiwe.jpg";
import happyFamilyPhoto from "/assets/happyfamily.jpg";
import { ParallaxBackground } from './components/layout/ParallaxBackground';
import { CustomCursor } from './components/layout/CustomCursor';
import { Reveal } from './components/layout/Reveal';
import { Magnetic } from './components/layout/Magnetic';
import { Navbar } from './components/layout/Navbar';
import {
  FEATURES,
  SECURITY_ITEMS,
  SCREENS,
  WHY_POINTS,
  TESTIMONIALS,
  FAQS,
  FAQ_ICON_POSITIONS,
  INTERACTIVE_STEPS,
  INTERACTIVE_DEFAULT_DATA,
  PRICING_FREE_FEATURES,
  PRICING_PAID_FEATURES,
} from './config/content';

// --- Components ---

const InteractiveWillPreview = () => {
  const [step, setStep] = useState(0);
  const [data] = useState(INTERACTIVE_DEFAULT_DATA);

  return (
    <div className="glass-card p-10 w-full max-w-md relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/5">
        <motion.div 
          className="h-full bg-accent"
          animate={{ width: `${(step + 1) * 25}%` }}
        />
      </div>

      <div className="flex justify-between mb-10">
        {INTERACTIVE_STEPS.map((s, i) => (
          <div key={i} className={`flex flex-col items-center gap-2 ${step === i ? 'text-accent' : 'text-slate-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === i ? 'border-accent bg-accent/5' : 'border-slate-600'}`}>
              {s.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="min-h-[200px]"
        >
          {step === 0 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold">Who are you?</h4>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="text-[10px] font-black uppercase text-primary/40 mb-1">Full Name</div>
                <div className="font-bold">{data.name}</div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold">Your Assets</h4>
              {data.assets.map((asset, i) => (
                <div key={i} className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex justify-between items-center">
                  <span className="font-bold">{asset}</span>
                  <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold">Guardianship</h4>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="text-[10px] font-black uppercase text-primary/40 mb-1">Appointed Guardian</div>
                <div className="font-bold">{data.guardian}</div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold">Ready to Secure</h4>
              <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                <Lock className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                <p className="text-sm font-bold text-emerald-700">Your will is legally structured and ready for storage.</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4 mt-10">
        <button 
          onClick={() => setStep(Math.max(0, step - 1))}
          className="flex-1 py-3 rounded-xl border border-primary/10 font-bold text-sm hover:bg-primary/5 transition-colors"
        >
          Back
        </button>
        <button 
          onClick={() => setStep(Math.min(3, step + 1))}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          {step === 3 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 120]);
  const rotate = useTransform(scrollY, [0, 500], [0, 10]);
  const opacity = useTransform(scrollY, [0, 260], [1, 0.2]);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-36 pb-20 overflow-hidden bg-accent">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#5C9AAB] via-[#5C9AAB] to-[#417585]" />

      <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/60 border border-white/10 shadow-sm text-slate-100 text-[10px] font-black uppercase tracking-[0.22em] mb-10"
          >
            <Smartphone className="w-3 h-3 text-accent" /> Secure Digital Will Planning
          </motion.div>
          
          <h1 className="text-5xl md:text-[4.75rem] lg:text-[5.5rem] font-black tracking-tight leading-[0.95] font-display mb-8 text-white">
            MiWill is the{" "}
            <span className="text-primary italic serif-font">
              easiest way
            </span>{" "}
            to keep your will up to date.
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed font-medium"
          >
            A guided, secure app that helps you create, store, and update your will so your wishes are always clear.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Magnetic strength={0.2}>
              <a 
                href="#download" 
                data-cursor="DOWNLOAD"
                className="inline-flex items-center justify-center gap-2.5 px-10 md:px-12 py-4 rounded-full text-sm md:text-base font-black uppercase tracking-[0.2em] bg-[#368396] text-white shadow-[0_18px_46px_rgba(54,131,150,0.5)] border border-white/30 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Download the App
                  <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </span>
                <motion.div 
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </a>
            </Magnetic>
            
            <a 
              href="#features" 
              className="text-xs md:text-sm font-black uppercase tracking-[0.28em] text-slate-300/70 hover:text-slate-50 transition-colors flex items-center gap-2 group"
            >
              See how it works
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

          {/* As Seen In Logos */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 pt-10 border-t border-slate-700/60"
          >
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400/70 mb-6">
              Trusted by
            </p>
            <div className="flex flex-wrap gap-10 md:gap-12 grayscale opacity-70">
              {[
                'Estate planners',
                'Financial advisors',
                'Family offices',
                'Everyday families',
              ].map(label => (
                <span key={label} className="text-xl font-black tracking-tighter">
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          style={{ y: y1, rotate, opacity }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative">
            {/* App Mockup Container */}
            <div className="relative w-[320px] h-[640px] bg-slate-950 rounded-[3rem] border-[10px] border-slate-400/20 shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />
              <div className="h-full bg-white flex items-center justify-center">
                <img
                  src={heroPhoto}
                  alt="MiWill hero screen"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Sophisticated Floating Elements */}
            <motion.div 
              animate={{ y: [0, -22, 0], rotate: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
              className="absolute -left-20 top-16 glass-card p-7 hidden xl:block border-accent/25 shadow-2xl backdrop-blur-2xl bg-slate-900/80"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="text-accent w-6 h-6" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">
                Always updated
              </div>
              <div className="font-bold text-lg">Living will</div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 26, 0], rotate: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="absolute -right-10 bottom-12 glass-card p-7 hidden xl:block border-highlight/20 shadow-2xl backdrop-blur-2xl bg-slate-900/80"
            >
              <div className="w-12 h-12 bg-highlight/10 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="text-highlight w-6 h-6" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Status</div>
              <div className="font-bold text-lg">Protected</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40"
      >
        <div className="w-px h-16 bg-gradient-to-b from-slate-200 to-transparent" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em] vertical-text text-slate-300/80">
          Scroll
        </span>
      </motion.div>
    </section>
  );
};

const WhatIsMiWill = () => {
  return (
    <section id="about" className="section-padding bg-accent relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_55%)]" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="inline-block p-4 bg-accent/20 rounded-2xl mb-10 border border-white/40">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 leading-tight text-white">
              What is{" "}
              <span className="text-primary italic serif-font">MiWill</span>?
            </h2>
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed mb-10">
              MiWill is a mobile app that walks you through every step of creating a will. Answer simple questions, review everything in plain language, and keep it securely stored and accessible.
            </p>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
                <Smartphone className="w-7 h-7 text-accent" />
              </div>
              <p className="text-base md:text-lg font-semibold text-white">
                Designed for your pocket, built for your life.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative group border border-slate-700/70">
              <img 
                src={lindiwePhoto}
                alt="Lindiwe using MiWill"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10">
                  <p className="text-slate-50 font-semibold text-base md:text-lg">
                    "The easiest legal app I've ever used."
                  </p>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-3">
                    — Lindiwe M., Early Beta User
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const KeyAppFeatures = () => {
  return (
    <section id="features" className="section-padding bg-accent relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.25),_transparent_60%)]" />
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="mb-32 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white mb-4">
              WHY MIWILL FEELS DIFFERENT
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3 text-slate-50">
              Key app{" "}
              <span className="text-primary italic serif-font">features</span>
            </h2>
            <p className="text-sm md:text-base text-white max-w-xl">
              The core experiences that remove friction from keeping your will
              accurate, secure, and shareable with the people who matter.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-white">
            <div className="flex -space-x-2">
              <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600" />
              <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600" />
              <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600" />
            </div>
            <span className="font-medium">
              Built with legal, design, and estate experts
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((f, i) => {
            const Icon =
              f.icon === "users"
                ? Users
                : f.icon === "lock"
                ? Lock
                : f.icon === "bell"
                ? Bell
                : Smartphone;

          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -10, scale: 1.01 }}
              className={`glass-card p-7 md:p-9 group cursor-pointer bg-slate-900/80 border-slate-700/70 flex flex-col justify-between ${
                f.size === "col-span-2" ? "md:col-span-2" : "md:col-span-1"
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div
                  className={`w-11 h-11 rounded-2xl ${f.color} text-white flex items-center justify-center group-hover:rotate-3 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                  FEATURE 0{i + 1}
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-semibold text-slate-50">
                  {f.title}
                </h3>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  {f.desc}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-500">
                <span>Included in every plan</span>
                <span className="flex items-center gap-1 text-accent">
                  <span className="h-[1px] w-6 bg-accent" />
                  Detail
                </span>
              </div>
            </motion.div>
          );
        })}
        </div>
      </div>
    </section>
  );
};

const ScreensWalkthrough = () => {
  const [guidedIndex, setGuidedIndex] = useState(0);
  const guidedImages = [guidedQuestion1Img, guidedQuestion2Img];

  useEffect(() => {
    const interval = setInterval(() => {
      setGuidedIndex((prev) => (prev + 1) % guidedImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const screens = [
    {
      title: "Home screen",
      desc: "See your will status and next steps at a glance.",
      type: "static",
      img: homeScreenImg,
    },
    {
      title: "Guided questions",
      desc: "Move smoothly through simple prompts that feel like a conversation.",
      type: "guided",
    },
    {
      title: "Ways to create your will",
      desc: "Choose to type, record your voice, or capture a short video – whatever feels most natural.",
      type: "video",
    },
  ] as const;

  return (
    <section id="screens" className="section-padding bg-accent overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-6">
            App{" "}
            <span className="text-white italic serif-font">walkthrough</span>
          </h2>
          <p className="text-sm md:text-base text-white/70 font-medium uppercase tracking-[0.28em]">
            Experience the simplicity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-16 lg:gap-20">
          {screens.map((s) => (
            <div
              key={s.title}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-[300px] aspect-[9/18] bg-white rounded-[3rem] border-[10px] border-slate-300 overflow-hidden mb-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)] relative">
                {s.type === "guided" && (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={guidedIndex}
                      src={guidedImages[guidedIndex]}
                      alt="Guided questions"
                      className="w-full h-full object-contain bg-white"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>
                )}
                {s.type === "static" && s.img && (
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-contain bg-white"
                  />
                )}
                {s.type === "video" && (
                  <video
                    src={willCreationVideo}
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-contain bg-white"
                  />
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-teal-900/40 border border-white/60 text-[11px] font-black uppercase tracking-[0.26em] text-white">
                  {s.title}
                </div>
                <p className="text-sm md:text-base text-white/90 font-medium text-center">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyMiWill = () => {
  return (
    <section className="section-padding bg-accent relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(92,154,171,0.8),_transparent_60%)]" />
      <div className="max-w-[1400px] mx-auto px-6 grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-20 lg:gap-28 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/80">
            WHY DECIDING LATER IS RISKY
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Why use MiWill instead of{" "}
            <span className="text-primary italic serif-font">
              doing nothing
            </span>
            ?
          </h2>
          <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed max-w-xl">
            Leaving things to chance creates avoidable stress, confusion, and
            conflict for the people you care about. MiWill turns a
            “someday task” into a clear, finished plan you can update in
            minutes.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {WHY_POINTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white/10 border border-white/40 p-5 flex flex-col gap-2"
              >
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.26em] text-white/85">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {item.title}
                </div>
                <p className="text-sm text-white leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-white/85 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="uppercase tracking-[0.25em] font-black">
                PEACE OF MIND
              </span>
            </div>
            <span>One clear plan, updated as life changes.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-10 -right-4 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative bg-slate-900/80 border border-slate-700 rounded-[2.5rem] p-6 md:p-7 shadow-[0_30px_120px_rgba(15,23,42,0.9)]">
            <div className="grid grid-cols-2 gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
              <span>Doing nothing</span>
              <span className="text-emerald-400">Using MiWill</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
              <div className="space-y-3 text-slate-400">
                <p>Family guessing at your wishes.</p>
                <p>Important assets missed or disputed.</p>
                <p>Harder conversations at the worst time.</p>
              </div>
              <div className="space-y-3">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[3px]" />
                  <span>Clear instructions, written in your own words.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[3px]" />
                  <span>Secure, encrypted record of what you own and who it’s for.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[3px]" />
                  <span>Easy to revisit in under 30 minutes when life changes.</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className="section-padding bg-accent">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6 text-white">
            What our{" "}
            <span className="text-primary italic serif-font">users say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {TESTIMONIALS.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card p-12 md:p-14 relative bg-slate-900/80 border-slate-700/70"
            >
              <div className="text-5xl md:text-6xl text-accent/20 absolute top-8 left-8 font-serif">
                “
              </div>
              <p className="text-base md:text-lg font-medium text-slate-100 mb-10 relative z-10 leading-relaxed italic">
                {q.text}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-200" />
                </div>
                <div>
                  <div className="font-semibold text-base md:text-lg text-slate-50">
                    {q.author}
                  </div>
                  <div className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em]">
                    {q.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BackgroundReveal = () => {
  return (
    <section className="relative h-[110vh] flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 z-0 opacity-45">
        <img 
          src={happyFamilyPhoto} 
          alt="Legacy Background"
          className="w-full h-full object-cover grayscale contrast-125 brightness-50"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="container mx-auto px-6 relative z-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            Your Legacy <br />
            <span className="serif-font italic text-accent">Preserved</span>
          </h2>
          <div className="mt-10 flex flex-col items-center">
            <div className="h-16 w-px bg-gradient-to-b from-accent to-transparent" />
            <p className="mt-6 text-white text-base md:text-lg font-black uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed drop-shadow-lg">
              Secure. Private. <br />
              <span className="text-accent">Always Accessible.</span>
            </p>
            <a
              href="#download"
              className="mt-8 inline-flex items-center gap-3 px-8 py-3 rounded-full bg-accent text-slate-950 font-black uppercase tracking-[0.22em] text-[11px] shadow-[0_18px_40px_rgba(15,23,42,0.8)] border border-white/40"
            >
              Start protecting my legacy
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary opacity-80 pointer-events-none z-10" />
      
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent z-20" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent z-20" />
    </section>
  );
};

const Pricing = ({ onWaitlist }: { onWaitlist?: (email: string) => void }) => {
  const [email, setEmail] = useState("");

  const handleJoin = () => {
    if (!email.trim()) return;
    onWaitlist?.(email.trim());
  };

  return (
    <section id="pricing" className="section-padding bg-accent relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6 text-white">
            Simple,{" "}
            <span className="text-primary italic serif-font">transparent</span>{" "}
            pricing
          </h2>
          <p className="text-sm md:text-base text-white/80 font-medium uppercase tracking-[0.3em]">
            No hidden fees. No subscriptions.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-slate-900/80 p-12 rounded-[2.5rem] text-left border border-slate-700/70"
            >
              <h3 className="text-2xl md:text-3xl font-black mb-4 text-slate-50">
                Free to start
              </h3>
              <p className="text-sm md:text-base text-slate-300 mb-8 leading-relaxed">
                Download the app, create your profile, and start building your will today. No credit card required.
              </p>
              <ul className="space-y-4 mb-8">
                {PRICING_FREE_FEATURES.map(item => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm md:text-base font-semibold text-slate-100"
                  >
                    <CheckCircle2 className="w-6 h-6 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <div className="text-sm md:text-base font-semibold text-slate-200 mt-2 uppercase tracking-[0.25em]">
                R (to be determined)
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-slate-900 text-white p-12 rounded-[2.5rem] text-left relative overflow-hidden shadow-2xl border border-accent/40"
            >
              <div className="absolute top-8 right-8 bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                Most popular
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4">
                Finalize & store
              </h3>
              <p className="text-sm md:text-base text-white/70 mb-8 leading-relaxed">
                A one-time fee to generate your legal documents and unlock lifetime secure storage.
              </p>
              <ul className="space-y-4 mb-8">
                {PRICING_PAID_FEATURES.map(item => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm md:text-base font-semibold"
                  >
                    <CheckCircle2 className="w-6 h-6 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-sm md:text-base font-semibold text-white/80 uppercase tracking-[0.25em]">
                R (pricing to be determined)
              </div>
            </motion.div>
          </div>
          
          <div className="mt-20 p-10 bg-slate-900/80 rounded-[2rem] border border-slate-700/70">
            <h4 className="text-xl md:text-2xl font-black mb-4 text-slate-50">
              Join the waitlist for early access
            </h4>
            <div className="flex flex-col sm:flex-row gap-6">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-slate-950 border border-slate-700 px-6 py-4 rounded-2xl text-sm md:text-base focus:outline-none focus:border-accent transition-colors text-slate-50 placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="button"
                onClick={handleJoin}
                className="btn-primary !px-10 !py-4"
              >
                Join waitlist
              </button>
            </div>
            <p className="mt-5 text-slate-400 text-xs md:text-sm font-medium">
              We'll notify you as soon as we launch in your region.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="section-padding bg-accent relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        {FAQ_ICON_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -90, 0],
              rotate: [0, 320, 0],
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.2,
            }}
            className="absolute text-slate-600"
            style={pos}
          >
            <HelpCircle size={90 + i * 18} />
          </motion.div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="heading-xl font-display !text-4xl md:!text-5xl mb-4 text-white">
              Curious?
            </h2>
            <div className="flex items-center justify-center gap-4">
              <motion.div 
                animate={{ width: [0, 48, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-px bg-accent" 
              />
              <p className="text-xs md:text-sm text-white/80 font-bold uppercase tracking-[0.3em]">
                We have answers.
              </p>
              <motion.div 
                animate={{ width: [0, 48, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-px bg-accent" 
              />
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          ref={containerRef}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="space-y-7"
        >
          {FAQS.map((faq, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
              }}
              className={`glass-card !rounded-[2.25rem] overflow-hidden transition-all duration-500 ${
                openIndex === i
                  ? '!bg-slate-900/90 shadow-2xl shadow-slate-900/60 border-accent/30'
                  : '!bg-slate-900/60 border-slate-700/70'
              }`}
            >
              <button 
                className="w-full p-8 md:p-9 text-left flex items-center justify-between font-semibold text-lg md:text-xl hover:bg-slate-900/80 transition-colors group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span
                  className={`max-w-[80%] transition-colors duration-500 ${
                    openIndex === i ? 'text-slate-50' : 'text-slate-200'
                  }`}
                >
                  {faq.q}
                </span>
                <motion.div 
                  animate={{ 
                    rotate: openIndex === i ? 180 : 0,
                    backgroundColor: openIndex === i ? "rgb(15,23,42)" : "transparent",
                    color: openIndex === i ? "white" : "inherit"
                  }}
                  className={`w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center transition-all duration-500 group-hover:border-accent/40`}
                >
                  <ChevronDown className="w-7 h-7" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="p-8 pt-0 text-slate-300 text-sm md:text-base leading-relaxed font-medium"
                    >
                      <div className="h-px w-10 bg-accent/40 mb-5" />
                      {faq.a}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

type ToastFn = (message: string) => void;

const FinalCTA = ({ onToast }: { onToast?: ToastFn }) => {
  return (
    <section id="download" className="section-padding bg-accent relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:40px_40px]" />
        <motion.div
          animate={{ 
            opacity: [0.12, 0.22, 0.12],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full bg-white/15 blur-3xl"
        />
        <motion.div
          animate={{ 
            opacity: [0.18, 0.28, 0.18],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full bg-sky-200/25 blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-tight mb-6"
          >
            Download MiWill and finish your will in{" "}
            <span className="italic serif-font">under 30 minutes</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-sm md:text-base text-white/80 max-w-xl mx-auto mb-10"
          >
            Start on your phone, pause when you need to, and come back to a
            guided checklist that remembers exactly where you left off.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex flex-wrap justify-center gap-8"
          >
            <motion.button 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-10 py-5 rounded-2xl flex items-center gap-4 shadow-2xl"
              type="button"
              onClick={() => onToast?.("Coming soon")}
            >
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Download on the</div>
                <div className="text-lg font-bold">App Store</div>
              </div>
            </motion.button>
            
            <motion.button 
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-10 py-5 rounded-2xl flex items-center gap-4 shadow-2xl"
              type="button"
              onClick={() => onToast?.("Coming soon")}
            >
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Get it on</div>
                <div className="text-lg font-bold">Google Play</div>
              </div>
            </motion.button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-10"
          >
            <a href="#" className="text-white/70 font-black uppercase tracking-[0.35em] text-[10px] hover:text-white transition-colors">
              Or join the early access list
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const SignaturePad = () => {
  const [enabled, setEnabled] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const clearRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#020617"; // slate-900 ink
    }
  }, [enabled]);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const updatePointerMode = () => setIsCoarsePointer(media.matches);

    updatePointerMode();
    media.addEventListener("change", updatePointerMode);

    return () => media.removeEventListener("change", updatePointerMode);
  }, []);

  const startLongPress = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setEnabled(true), 500) as unknown as number;
  };

  const cancelLongPress = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!enabled || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!enabled || !isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      if (clearRef.current) {
        window.clearTimeout(clearRef.current);
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      clearRef.current = window.setTimeout(() => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setEnabled(false);
      }, 3000) as unknown as number;
    }
  };

  const handleActivationPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (enabled) return;

    if (isCoarsePointer || e.pointerType === "touch") {
      setEnabled(true);
      return;
    }

    startLongPress();
  };

  return (
    <div
      className="absolute inset-0 z-30"
      onPointerDown={handleActivationPointerDown}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
    >
      {!enabled && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-[11px] text-slate-700">
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-6 bg-slate-500/70" />
            <span className="font-semibold uppercase tracking-[0.25em] bg-white px-3 py-1 rounded-full shadow-sm border border-slate-300">
              {isCoarsePointer ? "Tap to sign anywhere" : "Press & sign anywhere"}
            </span>
            <span className="h-[1px] w-6 bg-slate-500/70" />
          </div>
          <span className="text-[9px] text-slate-500">
            Demo only – this signature is not legally binding.
          </span>
        </div>
      )}
      {enabled && (
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      )}
    </div>
  );
};

const Footer = ({ onToast }: { onToast?: ToastFn }) => {
  return (
    <footer className="bg-white text-slate-900 pt-32 pb-16 px-6 relative overflow-hidden">
      {/* Paper / will background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(148,163,184,0.18),rgba(148,163,184,0.18)_1px,transparent_1px,transparent_32px)]" />
        <div className="absolute inset-x-6 bottom-24 h-px bg-gradient-to-r from-transparent via-slate-400/60 to-transparent" />
      </div>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.12, 0.18, 0.12],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-25%] right-[-15%] w-[520px] h-[520px] bg-accent/40 rounded-full blur-[140px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1.1, 0.95, 1.1],
          opacity: [0.06, 0.12, 0.06],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-25%] left-[-15%] w-[460px] h-[460px] bg-accent/30 rounded-full blur-[140px] pointer-events-none" 
      />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col items-center mb-16">
          <motion.img
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            src={secondaryLogo}
            alt="MiWill – Preserving my legacy"
            className="h-28 md:h-36 w-auto object-contain rounded-[2.5rem] bg-white shadow-xl shadow-slate-300/70 border border-slate-200 px-10 py-6"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-6 text-sm md:text-base text-slate-500 max-w-xl text-center"
          >
            Preserving your wishes today, so the people you love have clarity tomorrow.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-24 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center lg:items-start gap-8"
          >
            <motion.a 
              href="#download" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary !bg-accent !text-white hover:!bg-accent/90 !px-10 !py-4 text-base md:text-lg shadow-2xl shadow-slate-300/70"
            >
              Get Started Now
            </motion.a>
            <div className="flex items-center gap-5">
              {[Share2, Globe].map((Icon, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5, backgroundColor: "rgba(15,23,42,0.04)" }}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center transition-colors cursor-pointer bg-white"
                >
                  <Icon className="w-5 h-5 text-slate-600" />
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-accent font-black uppercase tracking-[0.3em] text-[11px] mb-8">
                Product
              </h4>
              <ul className="space-y-5 font-semibold text-sm md:text-base">
                {['Process', 'Security', 'Timeline', 'Support'].map((item, i) => (
                  <motion.li key={i} whileHover={{ x: 10 }}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-accent transition-colors">
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="text-accent font-black uppercase tracking-[0.3em] text-[11px] mb-8">
                Legal
              </h4>
              <ul className="space-y-5 font-semibold text-sm md:text-base text-slate-500">
                {['Privacy', 'Terms', 'Security', 'Compliance'].map((item, i) => (
                  <motion.li key={i} whileHover={{ x: 10, color: "#020617" }}>
                    <a href="#" className="hover:text-slate-900 transition-colors">
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <SignaturePad />

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="pt-12 border-top border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs font-black uppercase tracking-[0.35em] text-slate-400"
        >
          <p>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://www.xspark.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Developed By X Spark
            </a>
            . Built for peace of mind.
          </p>
          <div className="flex gap-12">
            {['Twitter', 'LinkedIn', 'Instagram'].map((social, i) => (
              <motion.button
                key={i}
                type="button"
                whileHover={{ y: -2, color: "#020617" }}
                className="hover:text-slate-900 transition-colors"
                onClick={() => onToast?.("Coming soon")}
              >
                {social}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function MiWillLanding() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast: ToastFn = (message) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setToastVisible(true);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2400) as unknown as number;
  };

  const handleWaitlistEmail = (email: string) => {
    const subject = encodeURIComponent("MiWill waitlist – I am interested");
    const body = encodeURIComponent(
      `Hi MiWill team,

I am interested in joining the MiWill early access waitlist when the app is launched.

Email: ${email}

Thank you.`
    );
    window.location.href = `mailto:studio@xspark.co.za?subject=${subject}&body=${body}`;
    showToast("We’ve opened your email app to join the waitlist");
  };

  return (
    <div className="min-h-screen selection:bg-accent selection:text-white relative bg-slate-950 text-slate-50">
      <CustomCursor />
      <ParallaxBackground />
      <div className="noise" />
      <Navbar />
      <main>
        <Hero />
        <Reveal><WhatIsMiWill /></Reveal>
        <Reveal><KeyAppFeatures /></Reveal>
        <BackgroundReveal />
        <Reveal><ScreensWalkthrough /></Reveal>
        <Reveal><WhyMiWill /></Reveal>
        <Reveal><Testimonials /></Reveal>
        <Reveal><Pricing onWaitlist={handleWaitlistEmail} /></Reveal>
        <Reveal><FAQ /></Reveal>
        <FinalCTA onToast={showToast} />
      </main>
      <Footer onToast={showToast} />
      
      <AnimatePresence>
        {toastVisible && toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="px-6 py-3.5 rounded-2xl bg-accent text-slate-950 shadow-2xl shadow-slate-900/70 flex items-center gap-3 text-xs md:text-sm font-black uppercase tracking-[0.16em]">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
        
        html {
          scroll-behavior: smooth;
        }

        .serif-font {
          font-family: 'Playfair Display', serif;
        }

        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
