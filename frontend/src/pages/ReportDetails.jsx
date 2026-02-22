import { useParams } from "react-router-dom";

function ReportDetails() {
  const { id } = useParams();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Report Details</h2>
      <p>Report ID: {id}</p>
    </div>
  );
}

export default ReportDetails;
