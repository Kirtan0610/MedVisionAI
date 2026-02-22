import { useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function UploadForm({ refreshReports }) {
  const { user } = useContext(AuthContext);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("file", file);

      await API.post("/reports/upload", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setSuccess("Report analyzed successfully!");
      setFile(null);
      refreshReports();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing the report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Upload Medical Report
      </h3>

      {/* File Input */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-100 file:text-blue-700
            hover:file:bg-blue-200"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-5 py-2 rounded-lg text-white font-medium transition duration-200
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>

      {/* File Name Preview */}
      {file && (
        <p className="mt-3 text-sm text-gray-600">
          Selected File: <span className="font-medium">{file.name}</span>
        </p>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">AI is analyzing your report...</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

export default UploadForm;
