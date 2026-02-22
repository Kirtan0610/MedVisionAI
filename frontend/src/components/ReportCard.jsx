import React from "react";

function ReportCard({ report }) {
  const rawText = report.aiResult || "";
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

  const riskStyles =
    risk === "High"
      ? "bg-red-50 text-red-600 border-red-200"
      : risk === "Medium"
        ? "bg-yellow-50 text-yellow-600 border-yellow-200"
        : risk === "Low"
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-gray-50 text-gray-500 border-gray-200";

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition border border-slate-100 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
            {report.originalFileName}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${riskStyles} self-start sm:self-auto`}
        >
          {risk} Risk
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Content Sections */}
      <div className="space-y-4 text-sm sm:text-base">
        {summary && (
          <div>
            <h4 className="text-sm font-semibold text-[#FA8072] mb-1">
              Summary
            </h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </div>
        )}

        {abnormal && (
          <div>
            <h4 className="text-sm font-semibold text-red-600 mb-1">
              Abnormal Findings
            </h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {abnormal}
            </p>
          </div>
        )}

        {lifestyle && (
          <div>
            <h4 className="text-sm font-semibold text-green-600 mb-1">
              Lifestyle Suggestions
            </h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {lifestyle}
            </p>
          </div>
        )}

        {disclaimer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs sm:text-sm text-amber-700">
            ⚠ {disclaimer}
          </div>
        )}

        {!summary && !abnormal && !lifestyle && (
          <div className="text-slate-600 whitespace-pre-line">{aiText}</div>
        )}
      </div>
    </div>
  );
}

export default ReportCard;
