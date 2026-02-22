import { useState, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full p-2 border mb-3 rounded"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-3 rounded"
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
