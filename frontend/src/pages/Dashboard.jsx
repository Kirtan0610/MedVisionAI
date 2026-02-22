import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to Med Vision AI
        </h1>
        <p className="text-gray-500 mt-2">
          Transforming medical reports into meaningful health insights.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-white p-8 rounded-2xl shadow border">
        <h2 className="text-2xl font-semibold text-[#FA8072] mb-4">
          Our Mission
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Med Vision AI was built to simplify complex medical reports and make
          health insights understandable for everyone. Our goal is to empower
          individuals with early detection insights using artificial
          intelligence, helping communities make informed health decisions.
        </p>
      </div>

      {/* Community Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border text-center">
          <h3 className="text-3xl font-bold text-[#FA8072]">1,200+</h3>
          <p className="text-gray-600 mt-2">Reports Analyzed</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border text-center">
          <h3 className="text-3xl font-bold text-[#FA8072]">850+</h3>
          <p className="text-gray-600 mt-2">Users Empowered</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border text-center">
          <h3 className="text-3xl font-bold text-[#FA8072]">95%</h3>
          <p className="text-gray-600 mt-2">User Satisfaction</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white p-8 rounded-2xl shadow border">
        <h2 className="text-2xl font-semibold text-[#FA8072] mb-6">
          How Med Vision AI Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800">1. Upload Report</h4>
            <p className="text-gray-600 text-sm mt-2">
              Securely upload your medical report in PDF format.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">2. AI Analysis</h4>
            <p className="text-gray-600 text-sm mt-2">
              Our AI analyzes parameters, detects abnormal values, and evaluates
              potential risk levels.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">
              3. Actionable Insights
            </h4>
            <p className="text-gray-600 text-sm mt-2">
              Receive easy-to-understand summaries and lifestyle suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="bg-[#FA8072] text-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Community Success Stories
        </h2>
        <p className="leading-relaxed text-sm">
          "Med Vision AI helped me understand my kidney report without
          confusion. I was able to consult my doctor early and avoid
          complications."
        </p>
        <p className="mt-4 text-xs opacity-80">— Community Member</p>
      </div>

      {/* Awareness Campaign */}
      <div className="bg-white p-8 rounded-2xl shadow border">
        <h2 className="text-2xl font-semibold text-[#FA8072] mb-4">
          Health Awareness Initiative
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Early detection of kidney, liver, and metabolic conditions can
          significantly reduce complications. We aim to promote regular health
          monitoring using accessible AI-driven tools.
        </p>
      </div>

      {/* Call to Action */}
      <div className="bg-white p-8 rounded-2xl shadow border text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Join the Movement
        </h2>
        <p className="text-gray-600 mt-3">
          Be part of a smarter healthcare future powered by AI innovation.
        </p>
        <button className="mt-6 bg-[#FA8072] text-white px-6 py-3 rounded-lg hover:bg-[#E06666] transition">
          Learn More
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
