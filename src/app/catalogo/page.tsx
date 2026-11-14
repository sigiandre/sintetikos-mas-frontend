'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Layers, Package, Footprints, Search, MessageCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  stockActual: number;
  precioVenta: number;
  categoria: { nombre: string; };
}

interface Zapato {
  id: string;
  modelo: string;
  color: string;
  talla: string;
  cantidad: number;
  cliente: { nombre: string; };
}

export default function CatalogoPublicoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [zapatos, setZapatos] = useState<Zapato[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState<'insumos' | 'zapatos'>('insumos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPublico = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const [resProd, resZap] = await Promise.all([
          fetch(`${baseUrl}/productos`),
          fetch(`${baseUrl}/operacion/zapatos-fabricados`),
        ]);

        if (resProd.ok) setProductos(await resProd.json());
        if (resZap.ok) setZapatos(await resZap.json());
      } catch (err) {
        console.error('Error cargando catálogo público', err);
      } finally {
        setCargando(false);
      }
    };
    cargarPublico();
  }, []);

  // Filtrado
  const productosFiltrados = productos.filter((p) =>
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const zapatosFiltrados = zapatos.filter((z) =>
      (z.modelo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (z.color || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (z.cliente?.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header Público */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base">Sintetikos & Más</h1>
            <span className="text-xs text-indigo-400 font-medium">Catálogo Abierto al Público</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Acceso Sistema</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Banner de Presentación */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 p-8 rounded-3xl border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Vitrina Digital de Insumos y Calzado</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              Explora nuestra variedad de materiales de primera calidad para calzado y descubre los modelos elaborados por nuestros talleres asociados.
            </p>
          </div>
        <a
          href={`https://wa.me/51961301426?text=${encodeURIComponent(
            "Hola Sintetikos & Más, vengo de su catálogo digital y me gustaría cotizar unos insumos."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition whitespace-nowrap"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Cotizar por WhatsApp</span>
        </a>
        </div>

        {/* Pestañas de Navegación y Buscador */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setTabActiva('insumos')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${
                tabActiva === 'insumos'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Insumos y Materiales</span>
            </button>
            <button
              onClick={() => setTabActiva('zapatos')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${
                tabActiva === 'zapatos'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span>Modelos Fabricados</span>
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={tabActiva === 'insumos' ? 'Buscar insumo...' : 'Buscar modelo o taller...'}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Listados */}
        {cargando ? (
          <div className="text-center py-20 text-slate-500">Cargando catálogo...</div>
        ) : tabActiva === 'insumos' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                No hay insumos disponibles con ese término.
              </div>
            ) : (
              productosFiltrados.map((prod) => (
                <div key={prod.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 font-semibold text-xs rounded-lg border border-indigo-500/20">
                        {prod.categoria?.nombre || 'General'}
                      </span>
                      <span className="text-emerald-400 font-bold text-lg">
                        S/ {Number(prod.precioVenta).toFixed(2)} <span className="text-xs font-normal text-slate-400">/ {prod.unidadMedida}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{prod.nombre}</h3>
                    <p className="text-slate-400 text-xs mt-1">{prod.descripcion || 'Material garantizado para calzado.'}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className={prod.stockActual > 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                      {prod.stockActual > 0 ? '● En Stock' : '○ Stock Agotado'}
                    </span>
                    <span className="text-slate-400">Stock: {prod.stockActual} {prod.unidadMedida}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zapatosFiltrados.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                No hay modelos de calzado registrados en la vitrina.
              </div>
            ) : (
              zapatosFiltrados.map((zap) => (
                <div key={zap.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 font-semibold text-xs rounded-lg border border-cyan-500/20">
                        Taller: {zap.cliente?.nombre || 'Particular'}
                      </span>
                      <span className="text-white font-bold text-sm bg-slate-800 px-2.5 py-1 rounded-lg">
                        {zap.cantidad} pares
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Modelo {zap.modelo}</h3>
                    <p className="text-slate-300 text-xs mt-1">Color: <strong className="text-white">{zap.color}</strong></p>
                    <p className="text-slate-400 text-xs mt-0.5">Talla: {zap.talla}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Producción verificada</span>
                    <span className="text-indigo-400 font-medium">Sintetikos & Más</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Sintetikos & Más. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}