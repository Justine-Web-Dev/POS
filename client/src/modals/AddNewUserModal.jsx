import React, { useEffect, useState } from 'react';
import { api } from '../api/api';

const emptyForm = {
  fullname: "",
  username: "",
  password: "",
  role: ""
};

function AddNewUserModal({ userToEdit, onClose, onSuccess }) {
  const isEditMode = Boolean(userToEdit);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        fullname: userToEdit.fullname || "",
        username: userToEdit.username || "",
        password: "",
        role: userToEdit.role || ""
      });
    } else {
      setFormData(emptyForm);
    }
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        const resp = await api.put(`/api/users/admin/update-user/${userToEdit.id}`, {
          fullname: formData.fullname,
          username: formData.username,
          role: formData.role
        });
        alert(resp.data.message || "User updated successfully");
      } else {
        const resp = await api.post("/api/users/admin/create-user/", formData);
        alert(resp.data.message);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      alert(message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">
            {isEditMode ? "Update User" : "Add New User"}
          </h3>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="space-y-4 overflow-y-auto pr-1" onSubmit={handleForm}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg shadow-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg shadow-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900"
            />
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg shadow-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="role">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              id="role"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg shadow-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-900"
            >
              <option value="" selected>Select Role...</option>
              <option value="Administrator" disabled>Administrator</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Kitchen staff">Kitchen Staff</option>
              <option value="Beer station staff">Beer Station Staff</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors"
            >
              {loading
                ? (isEditMode ? "Updating..." : "Adding...")
                : (isEditMode ? "Update User" : "Add User")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNewUserModal;
