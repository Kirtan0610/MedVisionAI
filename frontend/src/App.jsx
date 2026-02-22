import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import ReportDetails from "./pages/ReportDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />{" "}
        <Route path="/register" element={<Register />} />
        {/* Protected Layout Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/report/:id" element={<ReportDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
