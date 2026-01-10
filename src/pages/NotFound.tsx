import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-700">
            Oops! Página não encontrada
          </h2>
          <p className="text-gray-500">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Voltar para Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
