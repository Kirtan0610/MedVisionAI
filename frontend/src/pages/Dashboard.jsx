import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FileUp,
  Cpu,
  Activity,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-16 bg-slate-50/50 min-h-screen">
      {/* 1. Hero Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Welcome back,{" "}
            <span className="text-[#FA8072]">{user?.name || "Member"}</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-500 mt-3 font-medium">
            Your personal health AI is ready to analyze.
          </p>
        </div>
      </header>

      {/* 2. Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            label: "Reports Analyzed",
            value: "1,200+",
            icon: <FileUp className="text-[#FA8072]" />,
          },
          {
            label: "Users Empowered",
            value: "850+",
            icon: <Activity className="text-[#FA8072]" />,
          },
          {
            label: "AI Accuracy",
            value: "99.2%",
            icon: <ShieldCheck className="text-[#FA8072]" />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="p-3 bg-orange-50 rounded-lg shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                {stat.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Mission & Testimonial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mission */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="w-8 h-1 bg-[#FA8072] rounded-full"></span>
            Our Mission
          </h2>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
            Med Vision AI simplifies complex medical jargon. We bridge the gap
            between clinical data and human understanding, empowering you with
            early detection insights powered by advanced AI.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-600"
                ></div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
              Joined by 850+ health-conscious members
            </p>
          </div>

          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#FA8072] opacity-10 rounded-full blur-3xl"></div>
        </div>

        {/* Testimonial */}
        <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-sm relative italic">
          <span className="text-5xl text-slate-100 absolute top-4 left-4 font-serif">
            “
          </span>

          <p className="relative z-10 text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            Med Vision AI helped me understand my kidney report clearly. I was
            able to consult my doctor early and avoid complications.
          </p>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div>
              <p className="text-sm font-bold text-slate-900 not-italic">
                Sarah J.
              </p>
              <p className="text-xs text-slate-400 not-italic">
                Community Member
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. How It Works */}
      <section className="py-6 md:py-10">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-10 text-center">
          How It Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-16 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

          {[
            {
              step: "01",
              title: "Upload Report",
              desc: "Securely upload your PDF or image files.",
              icon: <FileUp />,
            },
            {
              step: "02",
              title: "AI Analysis",
              desc: "AI scans for abnormal values and risks.",
              icon: <Cpu />,
            },
            {
              step: "03",
              title: "Actionable Insights",
              desc: "Clear summaries and lifestyle tips.",
              icon: <CheckCircle />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-[#FA8072] mb-4 shadow-sm">
                {item.icon}
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-[#FA8072] mb-2">
                {item.step}
              </span>

              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                {item.title}
              </h4>

              <p className="text-slate-500 text-sm mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA */}
      <footer className="bg-[#FA8072] rounded-3xl md:rounded-[2.5rem] p-8 sm:p-10 text-center text-white shadow-xl relative">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
          Start your journey to better health
        </h2>

        <p className="opacity-90 mb-8 max-w-xl mx-auto text-sm sm:text-base">
          Be part of a smarter healthcare future. Join thousands of users making
          informed decisions.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-[#FA8072] px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
            Get Started Now <ArrowRight size={18} />
          </button>

          <button className="border border-white/40 px-6 sm:px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition">
            Contact Support
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
