import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import mainLogo from "/assets/MainMiwillLogo.png";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Features", href: "#features" },
  { name: "Screens", href: "#screens" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQs", href: "#faq" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
        scrolled ? "py-4" : "py-8"
      }`}
    >
      <div
        className={`max-w-[1400px] mx-auto px-6 flex items-center justify-between transition-all duration-700 ${
          scrolled ? "glass-card !rounded-full py-3 px-8 mx-4" : ""
        }`}
      >
        <a href="#home" className="flex items-center gap-4 group cursor-pointer">
          <img
            src={mainLogo}
            alt="MiWill logo"
            className="h-10 md:h-11 w-auto object-contain group-hover:opacity-90 transition-opacity"
          />
        </a>

        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[11px] font-black text-slate-300/60 hover:text-slate-50 transition-colors uppercase tracking-[0.22em]"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#cta"
            className="btn-primary !py-3 !px-7 text-[11px] uppercase tracking-[0.22em]"
          >
            Get Started
          </a>
        </div>

        <button
          className="md:hidden p-2 text-slate-100"
          onClick={() => setIsOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 bg-slate-950/95 backdrop-blur-2xl p-10 flex flex-col justify-center gap-10 z-[101]"
          >
            <button
              className="absolute top-10 right-10 p-2"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation"
            >
              <X className="w-9 h-9" />
            </button>
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-4xl font-black text-slate-50 font-display tracking-tighter"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#cta"
              className="btn-primary text-xl py-5 mt-8"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

