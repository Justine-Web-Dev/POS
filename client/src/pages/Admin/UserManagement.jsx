import { LuUserPen, LuUserPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import { api } from "../../api/api";
import { useEffect, useState } from "react";
import AddNewUserModal from "../../modals/AddNewUserModal";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // 1. New state to track the search text
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/users/admin/get-all-users");
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleUpdateUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // 2. Filter the users list in real-time based on the search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.fullname?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 border border-slate-200 rounded-[16px] shadow-xs p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shadow-xs shrink-0 mt-0.5">
            <LuUserPen size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage system users, roles, and permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            {/* 3. Connect the input element to state */}
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 w-full sm:w-56 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-400 text-slate-800 shadow-xs"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 hover:shadow transition-all duration-200 cursor-pointer group active:scale-[0.98]"
            onClick={openAddModal}
          >
            <LuUserPlus
              size={18}
              className="transition-transform group-hover:scale-110"
            />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      <main className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm text-slate-600">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
              <th className="py-3.5 px-4 w-16 text-center">ID</th>
              <th className="py-3.5 px-4">Full Name</th>
              <th className="py-3.5 px-4">Username</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-slate-500 font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? ( // 4. Map over filteredUsers instead of users
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-4 px-4 text-center font-medium text-slate-400">
                    {user.id}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {user.fullname}
                  </td>
                  <td className="py-4 px-4 text-slate-500">{user.username}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.status?.toLowerCase() === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit User"
                        onClick={() => handleUpdateUser(user)}
                      >
                        <LuPencil size={16} />
                      </button>
                      <button
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  {/* 5. Smart fallback text if no search results match */}
                  {searchQuery ? `No users found matching "${searchQuery}"` : "No users registered."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
        
      {showModal && (
        <AddNewUserModal
          userToEdit={editingUser}
          onClose={closeModal}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}

export default UserManagement;