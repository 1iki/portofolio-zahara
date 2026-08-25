import React from 'react';

export default function Contact() {
  return (
    <footer className="py-24 border-t border-divider bg-navy-base px-6 relative overflow-hidden" id="kontak">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(245, 243, 236, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 243, 236, 1) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      ></div>

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-12 relative z-10">
        
        <div className="flex flex-col gap-4 items-center">
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">Siaran Selesai.</h2>
          <p className="text-muted max-w-md">
            Hubungi saya untuk kolaborasi dan mari ciptakan produksi yang lebih berkesan.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a href="#" className="px-6 py-3 rounded-full border border-divider hover:border-ivory text-sm font-mono tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base">
            WHATSAPP
          </a>
          <a href="#" className="px-6 py-3 rounded-full border border-divider hover:border-ivory text-sm font-mono tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base">
            INSTAGRAM
          </a>
          <a href="#" className="px-6 py-3 rounded-full border border-divider hover:border-ivory text-sm font-mono tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-base">
            EMAIL
          </a>
        </div>

        {/* Footer Base */}
        <div className="w-full flex items-center justify-between pt-12 border-t border-divider mt-12">
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
            © {new Date().getFullYear()} Zahara Elhusna Barok
          </span>
          
          {/* Idle ON AIR dot */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-divider bg-navy-deep">
            <div className="w-2 h-2 rounded-full bg-divider"></div>
            <span className="text-[10px] font-mono tracking-widest text-muted">IDLE</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
