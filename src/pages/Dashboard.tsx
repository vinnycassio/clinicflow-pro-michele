import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { count } = await supabase
        .from("vl_clinic_core_patients")
        .select("*", { count: "exact", head: true });
      
      setCount(count || 0);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-sm text-gray-500">Total de Pacientes</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
