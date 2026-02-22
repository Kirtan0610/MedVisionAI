import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">Med Vision AI</h1>
      <div className="space-x-4">
        <Link to="/">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}

export default Navbar;
