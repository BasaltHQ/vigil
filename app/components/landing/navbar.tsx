"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

// Hardcoded theme to match Vigil's Noir aesthetic
const currentTheme = { color: "#b71928", icon: "/Vigil.png", name: "Varuna" };

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('');

  const pathname = usePathname();

  // Time & Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    tick();
    const timeInterval = setInterval(tick, 1000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
    };
  }, []);

  const sections = useMemo(() => [
    { id: "products", label: "FEATURES" },
    { id: "vision", label: "OUR VISION" },
  ], []);

  const pages = useMemo(() => [
    { path: "/about", label: "ABOUT" },
    { path: "/contact", label: "CONTACT" },
  ], []);

  const products = [
    { name: "CONSOLE", url: "/chat" },
  ];

  const isHomepage = pathname === "/";
  const themeColor = currentTheme.color;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled
          ? 'bg-black/80 backdrop-blur-2xl border-b shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-3'
          : 'py-5 bg-transparent'
          }`}
        style={scrolled
          ? { borderBottomColor: `${themeColor}30`, boxShadow: `0 4px 30px ${themeColor}10` }
          : { borderBottomColor: 'transparent' }
        }
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Left Side: Logo & Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 transform group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={currentTheme.icon}
                  alt={currentTheme.name}
                  fill
                  className="object-contain transition-opacity duration-500"
                  priority
                />
                <div className="shield-gleam-container" />
              </div>
              <div className="flex flex-col">
                <span
                  className="hidden md:block text-[10px] font-mono tracking-widest opacity-80 transition-colors duration-500"
                  style={{ color: themeColor }}
                >
                  STATUS.ONLINE
                </span>
                <span className="text-lg text-white tracking-widest group-hover:opacity-80 transition-opacity font-vox">
                  <span className="font-light">BASALT</span><span className="font-bold">VIGIL</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {isHomepage ? (
                <>
                  {sections.map((s) => (
                    <Link
                      key={s.id}
                      href={`#${s.id}`}
                      className="px-4 py-2 text-xs font-mono tracking-wider text-gray-400 hover:text-white hover:bg-white/5 rounded-[10px] transition-all duration-200"
                    >
                      {s.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {pages.map((page) => (
                    <Link
                      key={page.path}
                      href={page.path}
                      className={`px-4 py-2 text-xs font-mono tracking-wider hover:text-white hover:bg-white/5 rounded-[10px] transition-all duration-200 ${pathname === page.path ? 'text-white bg-white/5' : 'text-gray-400'
                        }`}
                    >
                      {page.label}
                    </Link>
                  ))}
                </>
              )}

              {/* Suite Dropdown matched to template style */}
              <div className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-xs font-mono tracking-wider text-gray-400 hover:text-white hover:bg-white/5 rounded-[10px] transition-all duration-200">
                  PLATFORM
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pt-2">
                  <div
                    className="glass-pane rounded-lg shadow-xl ring-1 ring-white/10 p-2 bg-black/80 backdrop-blur-xl"
                    style={{ borderColor: `${themeColor}40` }}
                  >
                    {products.map((product) => (
                      <Link
                        key={product.name}
                        href={product.url}
                        className="block px-4 py-2 text-xs font-mono tracking-wider text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        {product.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Time Display */}
            <div className="hidden md:block text-xs font-mono tracking-wider transition-colors duration-500" style={{ color: themeColor }}>
              {time}
            </div>

            <Link
              href="/login"
              className="hidden md:block text-xs font-mono tracking-wider px-4 py-2 rounded-[10px] text-white hover:bg-white/10 transition-all duration-300"
            >
              LOGIN
            </Link>

            {/* CTA Button */}
            <Link
              href="/chat"
              className="hidden md:block text-xs font-mono tracking-wider px-6 py-3 rounded-[10px] text-black font-bold hover:opacity-90 transition-all duration-500 shadow-lg"
              style={{ backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}40` }}
            >
              START CASE
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 transition-colors duration-500"
              style={{ color: isMenuOpen ? themeColor : 'white' }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="lg:hidden bg-black/90 backdrop-blur-xl mt-2 mx-4 rounded-2xl p-4 animate-fadeInUp border"
            style={{ borderColor: `${themeColor}40` }}
          >
            <nav className="flex flex-col gap-2">
              {isHomepage ? (
                <>
                  {sections.map((s) => (
                    <Link
                      key={s.id}
                      href={`#${s.id}`}
                      className="px-4 py-3 text-sm font-mono tracking-wider text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {pages.map((page) => (
                    <Link
                      key={page.path}
                      href={page.path}
                      className="px-4 py-3 text-sm font-mono tracking-wider text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {page.label}
                    </Link>
                  ))}
                </>
              )}

              <div className="border-t border-white/10 mt-2 pt-2">
                <div className="text-[10px] font-mono text-gray-500 mb-2 px-4">PLATFORM</div>
                {products.map((product) => (
                  <Link
                    key={product.name}
                    href={product.url}
                    className="block px-4 py-2 text-xs font-mono tracking-wider text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ '--hover-color': themeColor } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.color = themeColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  >
                    {product.name}
                  </Link>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="block w-full text-center rounded-lg px-4 py-3 text-sm font-bold text-white border border-white/10 hover:bg-white/5 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOGIN
                </Link>
                <Link
                  href="/chat"
                  className="block w-full text-center rounded-lg px-4 py-3 text-sm font-bold text-black shadow-lg transition-all duration-500"
                  style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}40` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  START CASE
                </Link>
              </div>
            </nav>
          </div>
        )}
      </nav>

      {/* HUD Decorative Lines */}
      <div className="fixed top-20 left-0 right-0 pointer-events-none z-40 opacity-50">
        <div className="absolute h-px bg-gradient-to-r from-transparent via-current to-transparent w-full transition-colors duration-500" style={{ color: themeColor }} />
      </div>
    </>
  );
}
