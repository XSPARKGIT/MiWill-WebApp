export const HERO_BADGE_TEXT = "Now Available on iOS & Android";

export const FEATURES = [
  {
    title: "Guided Will Builder",
    desc: "Simple questions that feel like a conversation, not a legal exam.",
    icon: "users",
    color: "bg-blue-500",
    size: "col-span-2",
  },
  {
    title: "Secure Cloud Storage",
    desc: "Encrypted storage; only you and chosen contacts can access.",
    icon: "lock",
    color: "bg-emerald-500",
    size: "col-span-1",
  },
  {
    title: "Life‑Event Reminders",
    desc: "Smart reminders when it’s time to review your will.",
    icon: "bell",
    color: "bg-amber-500",
    size: "col-span-1",
  },
  {
    title: "Trusted Contacts",
    desc: "Add the people who should know where to find your wishes.",
    icon: "smartphone",
    color: "bg-purple-500",
    size: "col-span-2",
  },
] as const;

export const SECURITY_ITEMS = [
  {
    title: "Bank-Grade Encryption",
    desc: "AES-256 encryption ensures your data is unreadable to anyone but you.",
    icon: "shield-check",
  },
  {
    title: "Biometric Access",
    desc: "FaceID and Fingerprint support for instant, secure access on your device.",
    icon: "lock",
  },
  {
    title: "Zero-Knowledge Architecture",
    desc: "We don't store your master password. Your data is yours alone.",
    icon: "lock",
  },
] as const;

export const SCREENS = [
  {
    title: "Home",
    desc: "See your will status at a glance.",
    img: "https://picsum.photos/seed/miwill-screen-1/600/1200",
  },
  {
    title: "Beneficiaries",
    desc: "See exactly who is included and how.",
    img: "https://picsum.photos/seed/miwill-screen-2/600/1200",
  },
  {
    title: "Sign & Share",
    desc: "Sign, store, and share with trusted contacts.",
    img: "https://picsum.photos/seed/miwill-screen-3/600/1200",
  },
] as const;

export const WHY_POINTS = [
  { title: "Clarity", desc: "No more guessing games for your loved ones." },
  {
    title: "Security",
    desc: "Bank-grade encryption for your most private data.",
  },
  {
    title: "Ease",
    desc: "Finish your will in under 30 minutes, not weeks.",
  },
] as const;

export const TESTIMONIALS = [
  {
    text: "I'd been putting this off for years because I thought I needed a lawyer. MiWill made it so simple I finished it on my lunch break.",
    author: "Thabo M.",
    role: "Father of two, Johannesburg",
  },
  {
    text: "The reminders are what sold me. Life changes, and MiWill actually helps me keep my will updated without having to start over.",
    author: "Ayanda N.",
    role: "Homeowner, Durban",
  },
  {
    text: "Finally, an app that treats estate planning like a modern service. Secure, intuitive, and actually helpful.",
    author: "Gugu R.",
    role: "Retiree, Cape Town",
  },
] as const;

export const PRICING_FREE_FEATURES = [
  "Guided Will Builder",
  "Basic Cloud Storage",
  "Trusted Contacts",
] as const;

export const PRICING_PAID_FEATURES = [
  "Unlimited Updates",
  "Premium Security",
  "Priority Support",
  "Legal Review Ready",
] as const;

export const INTERACTIVE_STEPS = [
  { label: "Identity", icon: "users" },
  { label: "Assets", icon: "home" },
  { label: "Guardians", icon: "baby" },
  { label: "Review", icon: "eye" },
] as const;

export const FAQS = [
  {
    q: "Is my data secure on the app?",
    a: "Yes. We use AES-256 bank-grade encryption and multi-factor authentication. Your data is encrypted on your device before it ever reaches our secure cloud storage.",
  },
  {
    q: "Do I need a lawyer as well?",
    a: "MiWill is designed to handle standard estate planning needs. While we provide legally structured documents, we always recommend consulting a professional for complex legal or tax situations.",
  },
  {
    q: "What devices does MiWill support?",
    a: "MiWill is available on iOS (iPhone & iPad) and Android devices. You can also access your account via any modern web browser on your laptop or tablet.",
  },
  {
    q: "How much does MiWill cost?",
    a: "We offer a simple, transparent pricing model. You can start your will for free, and we have premium plans for advanced features like legacy sharing and smart reminders.",
  },
] as const;

export const FAQ_ICON_POSITIONS = [
  { top: "5%", left: "10%" },
  { top: "20%", left: "75%" },
  { top: "45%", left: "15%" },
  { top: "60%", left: "80%" },
  { top: "75%", left: "35%" },
  { top: "85%", left: "65%" },
] as const;

export const INTERACTIVE_DEFAULT_DATA = {
  name: "Sarah Jenkins",
  beneficiary: "Family Trust",
  assets: ["Primary Residence", "Savings Account"],
  guardian: "Michael Jenkins",
};

