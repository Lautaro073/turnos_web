export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900">
          Turnos Web
        </h1>
        
        <p className="text-xl text-gray-600">
          Sistema de agendas - En construccion
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            [OK] Fase 1 completada
          </h2>
          
          <ul className="text-left space-y-2 text-gray-700">
            <li>[OK] Next.js 14 instalado</li>
            <li>[OK] TypeScript configurado</li>
            <li>[OK] Tailwind CSS activo</li>
            <li>[OK] shadcn/ui componentes listos</li>
            <li>[OK] Firebase configurado</li>
            <li>[OK] Estructura de carpetas creada</li>
            <li>[OK] Tipos TypeScript definidos</li>
            <li>[OK] Validaciones Zod listas</li>
          </ul>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Siguiente: Fase 2 - Diseno de interfaces
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Stack: Next.js | TypeScript | Tailwind | Firebase | Resend</p>
          <p className="mt-2">100% gratis | Facil de mantener</p>
        </div>
      </div>
    </main>
  );
}



