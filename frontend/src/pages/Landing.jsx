import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-[#FFF5F4] flex flex-col justify-center items-center px-6 text-center animate-fadeIn">
      <h1 className="text-4xl font-bold text-[#FA8072] mb-4">Med Vision AI</h1>

      <p className="text-gray-600 max-w-xl mb-8">
        Transform complex medical reports into simple, AI-powered health
        insights. Early detection. Smarter decisions. Better health outcomes.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-[#FA8072] text-white px-6 py-3 rounded-lg hover:bg-[#E06666]"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="border border-[#FA8072] text-[#FA8072] px-6 py-3 rounded-lg hover:bg-[#FA8072] hover:text-white transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default Landing;
