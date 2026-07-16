import { ShieldCheck, TrendingUp, Users } from "lucide-react";

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
];

export default function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1548618941-5b0e6f9a1d0b?q=80&w=1600&auto=format&fit=crop')",
        }}
      />

      {/* Blue gradient + glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1E4D]/95 via-[#123B8C]/85 to-[#1E5FD9]/70" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      {/* Floating bubbles */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[70%] top-[45%] h-3 w-3 rounded-full bg-white/40 blur-[1px]" />
        <span className="absolute left-[85%] top-[58%] h-2 w-2 rounded-full bg-white/30 blur-[1px]" />
        <span className="absolute left-[60%] top-[68%] h-4 w-4 rounded-full bg-white/25 blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="h-32 w-32 bg-white border-2 border-white rounded-lg flex items-center justify-center">
          <img
            src="/sws-logo-current.png"
            alt="SWS Logo"
            className="h-28 w-28 object-contain"
          />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-white">SWS</h1>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Spencer Water
            <br />
            Services Ltd
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-10">
        <div className="mb-6 h-1 w-14 rounded-full bg-blue-300" />
        <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
          Smart Water Solutions
          <br />
          for a Sustainable Future
        </h2>
        <p className="max-w-md text-blue-100">
          Managing water projects, operations and resources efficiently for
          communities that rely on us.
        </p>

        <div className="mt-10 space-y-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Icon className="h-5 w-5 text-blue-100" />
              </div>
              <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-blue-100/90">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacer keeps layout balanced */}
      <div className="relative z-10" />
    </div>
  );
}
