import { Outlet } from "react-router-dom";

export const AppLayout = () => {
  console.log("✅ AppLayout renderizando...");
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 bg-blue-500 text-white">
        <h1>TESTE - AppLayout funcionando</h1>
      </div>
      <div className="p-8">
        <Outlet />
      </div>
    </div>
  );
};
