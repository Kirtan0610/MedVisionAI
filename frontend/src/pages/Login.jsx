import { useState, useContext } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", form);

      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F4] px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md border">
        {/* Brand */}
        <h2 className="text-3xl font-bold text-center text-[#FA8072] mb-2">
          Med Vision AI
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          AI-powered medical insights platform
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email */}
        <input
          name="email"
          type="email"
          placeholder="Email address"
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#FA8072]"
          onChange={handleChange}
        />

        {/* Password */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-[#FA8072]"
          onChange={handleChange}
        />

        {/* Login Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#FA8072] hover:bg-[#E06666]"
          }`}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* Register Link */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[#FA8072] font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
