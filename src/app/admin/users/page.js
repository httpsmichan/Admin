"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔹 Load users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Start editing user
  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  // 🔹 Cancel editing
  const handleCancel = () => {
    setEditingUser(null);
  };

  // 🔹 Save updated user
  const handleUpdate = async () => {
    if (!editingUser.username || !editingUser.email) return;
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        username: editingUser.username,
        email: editingUser.email,
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // 🔹 Delete user
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // 🔹 Filter users based on search input
  const filteredUsers = users.filter((u) =>
    Object.values(u).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <p className="text-sm text-gray-500">Loading users...</p>;

  return (
    <div className="p-4">
      <h2 className="text-lg text-center font-bold text-gray-700 mb-4">
        Manage Users
      </h2>

      {/* Search Input */}
      <div className="mb-4 text-sm">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>

      {/* Scrollable User Table */}
      <div className="overflow-x-auto border border-gray-300 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-2 text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-1">
                  {editingUser?.id === u.id ? (
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, username: e.target.value })
                      }
                      className="px-1 py-1 border rounded w-full text-sm"
                    />
                  ) : (
                    u.username
                  )}
                </td>
                <td className="px-3 py-1">
                  {editingUser?.id === u.id ? (
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                      className="px-1 py-1 border rounded w-full text-sm"
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="px-3 py-1 text-center space-x-1">
                  {editingUser?.id === u.id ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(u)}
                        className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
