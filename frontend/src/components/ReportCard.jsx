import React from "react";

function ReportCard({ report }) {
  const rawText = report.aiResult || "";

  // Remove markdown stars for cleaner parsing
  const aiText = rawText.replace(/\*\*/g, "");

  const extractSection = (start, endKeywords = []) => {
    const startIndex = aiText.toLowerCase().indexOf(start.toLowerCase());
    if (startIndex === -1) return "";

    let endIndex = aiText.length;

    endKeywords.forEach((keyword) => {
      const idx = aiText
        .toLowerCase()
        .indexOf(keyword.toLowerCase(), startIndex + 1);
      if (idx !== -1 && idx < endIndex) {
        endIndex = idx;
      }
    });

    return aiText.substring(startIndex, endIndex).replace(start, "").trim();
  };

  const summary = extractSection("summary", [
    "abnormal",
    "risk",
    "lifestyle",
    "disclaimer",
  ]);

  const abnormal = extractSection("abnormal", [
    "risk",
    "lifestyle",
    "disclaimer",
  ]);

  const lifestyle = extractSection("lifestyle", ["disclaimer"]);

  const disclaimer = extractSection("disclaimer");

  const riskMatch = aiText.match(/Risk Level[:\s]*?(Low|Medium|High)/i);
  const risk = riskMatch ? riskMatch[1] : "Unknown";

  const riskColor =
    risk === "High"
      ? "bg-red-500"
      : risk === "Medium"
        ? "bg-yellow-500"
        : risk === "Low"
          ? "bg-green-500"
          : "bg-gray-400";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {report.originalFileName}
        </h3>
        <span
          className={`${riskColor} text-white px-3 py-1 rounded-full text-sm font-medium`}
        >
          {risk} Risk
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        {new Date(report.createdAt).toLocaleString()}
      </p>

      {/* Summary */}
      {summary && (
        <div className="mb-4">
          <h4 className="font-semibold text-blue-600 mb-1">Summary</h4>
          <p className="text-gray-700 text-sm whitespace-pre-line">{summary}</p>
        </div>
      )}

      {/* Abnormal Values */}
      {abnormal && (
        <div className="mb-4">
          <h4 className="font-semibold text-red-600 mb-1">Abnormal Findings</h4>
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {abnormal}
          </p>
        </div>
      )}

      {/* Lifestyle Suggestions */}
      {lifestyle && (
        <div className="mb-4">
          <h4 className="font-semibold text-green-600 mb-1">
            Lifestyle Suggestions
          </h4>
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {lifestyle}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <div className="mt-4 bg-yellow-100 text-yellow-800 p-3 rounded-lg text-xs">
          ⚠ {disclaimer}
        </div>
      )}

      {/* Fallback if nothing parsed */}
      {!summary && !abnormal && !lifestyle && (
        <div className="text-gray-700 text-sm whitespace-pre-line">
          {aiText}
        </div>
      )}
    </div>
  );
}

export default ReportCard;
