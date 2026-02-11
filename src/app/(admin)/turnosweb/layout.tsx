export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // TODO: Verificar autenticacion
    // Por ahora dejamos abierto para desarrollo
    // const isAuthenticated = false;
    // if (!isAuthenticated) {
    //   redirect('/login');
    // }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-background sticky top-0 z-50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-xl font-bold">Panel Admin - Turnos Web</h1>
                        <nav className="flex flex-wrap gap-3">
                            <a href="/turnosweb/dashboard" className="text-sm hover:text-primary whitespace-nowrap">Dashboard</a>
                            <a href="/turnosweb/horarios" className="text-sm hover:text-primary whitespace-nowrap">Horarios</a>
                            <a href="/turnosweb/servicios" className="text-sm hover:text-primary whitespace-nowrap">Servicios</a>
                            <a href="/turnosweb/turnos" className="text-sm hover:text-primary whitespace-nowrap">Turnos</a>
                            <a href="/turnosweb/estadisticas" className="text-sm hover:text-primary whitespace-nowrap">Estadisticas</a>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}




