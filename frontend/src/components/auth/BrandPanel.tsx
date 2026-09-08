import { ShieldCheck, TrendingUp, Users, Droplets, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Secure Access",
    desc: "Your data is protected with enterprise security",
  },
  {
    icon: TrendingUp,
    title: "Real-time Insights",
    desc: "Make informed decisions with accurate data",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Work together efficiently across all departments",
  },
  {
    icon: Droplets,
    title: "Water Management",
    desc: "Comprehensive water project oversight",
  },
  {
    icon: Zap,
    title: "Smart Operations",
    desc: "Streamlined workflow automation",
  },
];

export default function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-16">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1548618941-5b0e6f9a1d0b?q=80&w=1600&auto=format&fit=crop')",
        }}
      />

      {/* Enhanced blue gradient + glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b2e5c]/90 via-[#1e63b8]/80 to-[#0066ff]/75" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Floating bubbles - enhanced */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[15%] top-[20%] h-4 w-4 rounded-full bg-white/30 blur-[2px] animate-pulse" />
        <span className="absolute left-[75%] top-[35%] h-3 w-3 rounded-full bg-white/25 blur-[1px] animate-pulse" style={{ animationDelay: '1s' }} />
        <span className="absolute left-[85%] top-[55%] h-2 w-2 rounded-full bg-white/35 blur-[1px] animate-pulse" style={{ animationDelay: '2s' }} />
        <span className="absolute left-[25%] top-[65%] h-5 w-5 rounded-full bg-white/20 blur-[2px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <span className="absolute left-[60%] top-[80%] h-3 w-3 rounded-full bg-white/30 blur-[1px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-6">
        <div className="h-40 w-40 bg-white/10 backdrop-blur-md border-2 border-white/40 rounded-2xl flex items-center justify-center shadow-2xl">
          <img
            src="/sws-logo-current.png"
            alt="SWS Logo"
            className="h-36 w-36 object-contain"
          />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-white tracking-tight">SWS</h1>
          <p className="text-base font-bold uppercase tracking-widest text-blue-100/90 mt-1">
            Spencer Water Services Ltd
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-16">
        <div className="mb-8 h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-300 via-blue-200 to-white shadow-lg" />
        <h2 className="mb-6 text-5xl font-bold leading-tight text-white">
          Smart Water Solutions
          <br />
          <span className="text-blue-200">for a Sustainable Future</span>
        </h2>
        <p className="max-w-lg text-blue-100/80 text-lg leading-relaxed">
          Managing water projects, operations and resources efficiently for communities that rely on us. Experience the future of water management today.
        </p>

        <div className="mt-12 space-y-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-5 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30 shadow-lg group-hover:bg-white/25 transition-all duration-300">
                <Icon className="h-6 w-6 text-blue-100" />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">{title}</p>
                <p className="text-sm text-blue-100/80 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 mt-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <p className="text-white/90 text-sm font-medium mb-2">🌊 Leading Water Solutions Provider</p>
          <p className="text-blue-100/70 text-xs">Serving communities across Uganda with excellence</p>
        </div>
      </div>
    </div>
  );
}
