import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  // A helper function to keep the code clean and dry
  const getLinkClass = ({ isActive }) => {
    const baseClass = "flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors duration-200";
    const activeClass = "bg-blue-600 text-white";
    const inactiveClass = "text-gray-400 hover:bg-gray-800 hover:text-white";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-gray-100 flex flex-col justify-between border-r border-gray-800 p-4">
      {/* Top Section: Brand/Logo & Navigation */}
      <div>
        {/* Logo/Brand Heading */}
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold tracking-wider text-white">
            NPA Pub & Restaurant
          </h2>
        </div>

        <nav>
          <ul className="space-y-1">
            <li>
              {/* Added "end" so it only matches exactly "/" and doesn't stay active on sub-routes */}
              <NavLink end to="/dashboard" className={getLinkClass}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/user-management" className={getLinkClass}>
                User Management
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/table" className={getLinkClass}>
                Table
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/pos" className={getLinkClass}>
                POS
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/kitchen" className={getLinkClass}>
                Kitchen KDS
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/beer" className={getLinkClass}>
                Beer Station
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/inventory" className={getLinkClass}>
                Inventory
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/settings" className={getLinkClass}>
                System Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bottom Section: User Profile */}
      <div className="border-t border-gray-800 pt-4 flex items-center gap-3 px-2">
        {/* Placeholder Avatar */}
        <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center font-bold text-sm text-blue-400">
          U
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white leading-none">
            Username
          </h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">Admin Role</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;