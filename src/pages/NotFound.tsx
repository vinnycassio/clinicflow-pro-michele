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
```

---

## 🔍 DEBUG: Verificar Console do Navegador

Abra o **Console do navegador** (F12) e procure por erros. Você deve ver:
```
🚀 App iniciando...
✅ Configuração do Supabase carregada
📍 URL: https://seu-projeto.supabase.co
🔌 Inicializando cliente Supabase...
```

Se aparecer algum erro em vermelho, me envie a mensagem completa.

---

## 🔍 VERIFICAR ESTRUTURA DE ARQUIVOS

Certifique-se que tem esta estrutura:
```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx     ✅ Deve existir
│   │   └── AppSidebar.tsx    ✅ Deve existir
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── pages/
│   ├── Dashboard.tsx         ✅ Deve existir
│   ├── Patients.tsx          ✅ Deve existir
│   └── NotFound.tsx          ✅ Deve existir
├── lib/
│   ├── supabase.config.ts    ✅ Com suas credenciais
│   ├── supabase.ts           ✅ Cliente configurado
│   └── utils.ts
├── hooks/
│   └── usePatients.ts        ✅ Deve existir
├── types/
│   └── database.ts           ✅ Deve existir
└── App.tsx                   ✅ Deve existir
