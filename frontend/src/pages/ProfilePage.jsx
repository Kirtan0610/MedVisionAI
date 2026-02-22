import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [reportsCount, setReportsCount] = useState(0);

  useEffect(() => {
    if (!user?.token) return;

    const fetchData = async () => {
      try {
        const userRes = await API.get("/users/me", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const reportsRes = await API.get("/reports", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setProfile(userRes.data);
        setReportsCount(reportsRes.data.length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [user]);

  if (!profile) {
    return <p className="text-gray-500">Loading profile...</p>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and view activity summary
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-2xl shadow border flex flex-col sm:flex-row gap-6 items-center">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-[#FA8072] text-white flex items-center justify-center text-3xl font-bold">
          {profile.name?.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800">
            {profile.name}
          </h2>
          <p className="text-gray-500 mt-1">{profile.email}</p>

          <div className="mt-4 text-sm text-gray-600">
            Member since: {new Date(profile.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border text-center">
          <h3 className="text-3xl font-bold text-[#FA8072]">{reportsCount}</h3>
          <p className="text-gray-600 mt-2">Reports Analyzed</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border text-center">
          <h3 className="text-3xl font-bold text-[#FA8072]">Active</h3>
          <p className="text-gray-600 mt-2">Account Status</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border text-center">
          <h3 className="text-3xl font-bold text-[#FA8072]">AI Enabled</h3>
          <p className="text-gray-600 mt-2">AI Assistance</p>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="bg-[#FA8072] text-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-3">
          Upgrade to Med Vision Pro
        </h2>
        <p className="text-sm opacity-90">
          Unlock advanced diagnostics, long-term health tracking, PDF exports,
          and priority AI processing.
        </p>
        <button className="mt-5 bg-white text-[#FA8072] px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
