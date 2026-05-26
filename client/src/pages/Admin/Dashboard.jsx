import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import DashboardOverview from "./DashboardOverview";
import UserManagement from "./UserManagement";
import Table from "./Table";
import POS from "../POS";
import KitchenStation from "../../components/KitchenStation";
import BeerStation from "../../components/BeerStation";
import Inventory from "../../components/Inventory";
import SystemSettings from "./SystemSettings";

function Dashboard() {
  return (
   <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      <aside className="flex-shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/table" element={<Table />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/kitchen" element={<KitchenStation />} />
            <Route path="/beer" element={<BeerStation />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/settings" element={<SystemSettings />} />
          </Routes>
        </div>
      </main>
    </div>

  );
}

export default Dashboard;
