"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsSnap = await getDocs(collection(db, "logs"));
        const logsData = logsSnap.docs.map((docSnap) => {
          const log = docSnap.data();
          return {
            id: docSnap.id,
            action: log.action || "Report", // default "Report"
            reason: log.reason || "-",
            userId: log.userId || "-",
            username: log.username || log.userId || "-",
            combinedDate: log.datestamp
              ? new Date(log.datestamp)
              : log.timestamp
              ? new Date(log.timestamp)
              : null,
          };
        }).sort((a, b) => (b.combinedDate || 0) - (a.combinedDate || 0));

        setLogs(logsData);
        setFilteredLogs(logsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search) {
      setFilteredLogs(logs);
    } else {
      const lower = search.toLowerCase();
      setFilteredLogs(
        logs.filter(
          (log) =>
            (log.action && log.action.toLowerCase().includes(lower)) ||
            (log.username && log.username.toLowerCase().includes(lower)) ||
            (log.userId && log.userId.toLowerCase().includes(lower)) ||
            (log.reason && log.reason.toLowerCase().includes(lower)) ||
            (log.combinedDate &&
              log.combinedDate.toLocaleString().toLowerCase().includes(lower))
        )
      );
    }
  }, [search, logs]);

  // Delete log
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      await deleteDoc(doc(db, "logs", id));
      setLogs((prev) => prev.filter((log) => log.id !== id));
      setFilteredLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (error) {
      console.error("Failed to delete log:", error);
    }
  };

  if (loading)
    return <p className="text-center mt-8 text-gray-500">Loading logs...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-700 mb-4 flex justify-center">
  Logs
</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by action, username, user ID, reason, or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div
        className="bg-white shadow rounded-lg overflow-auto"
        style={{ maxHeight: "600px" }}
      >
        <table className="min-w-full table-auto text-sm text-gray-700">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {["Action", "Date", "Username", "User ID", "Reason", ""].map((th) => (
                <th
                  key={th}
                  className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wide"
                >
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr
                key={log.id}
                className={
                  index % 2 === 0
                    ? "bg-white hover:bg-gray-50"
                    : "bg-gray-50 hover:bg-gray-100"
                }
              >
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">
                  {log.combinedDate ? log.combinedDate.toLocaleString() : "-"}
                </td>
                <td className="px-4 py-2">{log.username}</td>
                <td className="px-4 py-2">{log.userId}</td>
                <td className="px-4 py-2">{log.reason}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
