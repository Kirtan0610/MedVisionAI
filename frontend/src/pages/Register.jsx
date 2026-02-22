import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered Successfully!");
      navigate("/");
    } catch (err) {
      alert("Error registering");
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          name="name"
          type="text"
          placeholder="Name"
          className="w-full p-2 border mb-3 rounded"
          onChange={handleChange}
        />

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
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Register;
