import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Dashboard    from "./pages/Dashboard";
import UploadPage   from "./pages/UploadPage";
import ReportsPage  from "./pages/ReportsPage";
import ProfilePage  from "./pages/ProfilePage";
import ReportDetails from "./pages/ReportDetails";
import ChatPage     from "./pages/ChatPage";
import ToolsPage    from "./pages/ToolsPage";
import SharedReport from "./pages/SharedReport";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout   from "./layout/MainLayout";
import Landing      from "./pages/Landing";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/"               element={<Landing />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/shared/:token"  element={<SharedReport />} />

        {/* Protected Layout Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/upload"       element={<UploadPage />} />
          <Route path="/reports"      element={<ReportsPage />} />
          <Route path="/report/:id"   element={<ReportDetails />} />
          <Route path="/chat"         element={<ChatPage />} />
          <Route path="/tools"        element={<ToolsPage />} />
          <Route path="/profile"      element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
