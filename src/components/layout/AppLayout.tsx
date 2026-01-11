import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};
