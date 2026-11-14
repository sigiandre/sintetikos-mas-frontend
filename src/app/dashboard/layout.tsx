'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Layers, 
  Package, 
  Tag, 
  Users, 
  Truck, 
  ShoppingCart, 
  Footprints, 
  LogOut, 
  ShoppingBag 
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nombre: string; rol: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (!token) {
      router.push('/login');
      return;
    }

    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Layers },
    { name: 'Productos / Insumos', href: '/dashboard/productos', icon: Package },
    { name: 'Categorías', href: '/dashboard/categorias', icon: Tag },
    { name: 'Proveedores', href: '/dashboard/proveedores', icon: Truck },
    { name: 'Clientes (Fabricantes)', href: '/dashboard/clientes', icon: Users },
    { name: 'Ventas de Insumos', href: '/dashboard/ventas', icon: ShoppingCart },
    { name: 'Zapatos Fabricados', href: '/dashboard/zapatos', icon: Footprints },
    { name: 'Compras a Proveedores', href: '/dashboard/compras', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Layers className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base">Sintetikos & Más</h1>
              <span className="text-xs text-indigo-400 font-medium">Panel de Control</span>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-950/50 p-3 rounded-lg mb-3 border border-slate-800/80">
            <p className="text-sm font-semibold text-white truncate">{usuario?.nombre || 'Usuario'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded border border-indigo-500/20">
              {usuario?.rol || 'VENDEDOR'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between md:justify-end">
          <div className="md:hidden flex items-center space-x-2">
            <Layers className="text-indigo-500 w-6 h-6" />
            <span className="font-bold text-white">Sintetikos & Más</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-300">Bienvenido, <strong className="text-white">{usuario?.nombre}</strong></span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}