import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import ReportCard from "../components/ReportCard";

function ReportsPage() {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (user?.token) {
      API.get("/reports", {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then((res) => setReports(res.data));
    }
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Previous Reports
      </h1>

      {reports.map((r) => (
        <ReportCard key={r._id} report={r} />
      ))}
    </div>
  );
}

export default ReportsPage;
