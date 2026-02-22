import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

      await API.post("/auth/register", form);
      navigate("/");
    } catch (err) {
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5F4] px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md border animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-[#FA8072] mb-2">
          Create Account
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Join Med Vision AI today
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <input
          name="name"
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-[#FA8072]"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-[#FA8072]"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-[#FA8072]"
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full p-3 rounded-lg text-white font-medium transition ${
            loading ? "bg-gray-400" : "bg-[#FA8072] hover:bg-[#E06666]"
          }`}
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-[#FA8072] font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
