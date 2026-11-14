'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Package, Users, ShoppingCart, Footprints, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalClientes: 0,
    totalVentas: 0,
    montoVentas: 0,
    totalZapatos: 0,
  });
  const [stockBajo, setStockBajo] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const [productos, clientes, ventas, zapatos] = await Promise.all([
          fetchApi('/productos').catch(() => []),
          fetchApi('/clientes').catch(() => []),
          fetchApi('/operacion/ventas').catch(() => []),
          fetchApi('/operacion/zapatos-fabricados').catch(() => []),
        ]);

        // Calcular total recaudado en ventas
        const montoTotal = ventas.reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);
        
        // Filtrar productos con stock bajo (ej. menor o igual a 10 unidades)
        const alertas = productos.filter((p: any) => p.stockActual <= 10);

        setStats({
          totalProductos: productos.length,
          totalClientes: clientes.length,
          totalVentas: ventas.length,
          montoVentas: montoTotal,
          totalZapatos: zapatos.reduce((acc: number, z: any) => acc + Number(z.cantidad || 0), 0),
        });

        setStockBajo(alertas);
      } catch (err) {
        console.error('Error cargando métricas del dashboard', err);
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, []);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Panel General</h1>
          <p className="text-slate-400 text-sm mt-1">Monitoreo en tiempo real de inventario y producción de calzado.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/ventas"
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Nueva Venta</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Insumos Registrados</p>
              <h3 className="text-3xl font-bold text-white mt-2">{cargando ? '...' : stats.totalProductos}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-indigo-400 font-medium">
            <span>Catálogo activo de materiales</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Talleres / Clientes</p>
              <h3 className="text-3xl font-bold text-white mt-2">{cargando ? '...' : stats.totalClientes}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-400 font-medium">
            <span>Fabricantes asociados</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Ingresos por Ventas</p>
              <h3 className="text-3xl font-bold text-white mt-2">S/ {cargando ? '...' : stats.montoVentas.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-400 font-medium">
            <span>{stats.totalVentas} transacciones procesadas</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Calzado Elaborado</p>
              <h3 className="text-3xl font-bold text-white mt-2">{cargando ? '...' : stats.totalZapatos} <span className="text-sm font-normal text-slate-400">pares</span></h3>
            </div>
            <div className="w-12 h-12 bg-cyan-600/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Footprints className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-cyan-400 font-medium">
            <span>Producción total registrada</span>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Alertas de Stock Bajo y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas de Stock */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Alertas de Stock Bajo (≤ 10 unidades)</span>
            </h2>
            <Link href="/dashboard/productos" className="text-xs text-indigo-400 hover:underline flex items-center space-x-1">
              <span>Ver inventario</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stockBajo.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
              <p className="text-slate-400 text-sm">¡Excelente! No hay insumos con stock crítico en este momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stockBajo.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-amber-500/20">
                  <div>
                    <span className="font-semibold text-white">{item.nombre}</span>
                    <p className="text-xs text-slate-400">Categoría: {item.categoria?.nombre || 'General'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 font-bold text-xs rounded-md border border-amber-500/20">
                      {item.stockActual} {item.unidadMedida}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Resumen del Negocio */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">Sintetikos & Más</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              El sistema se encuentra sincronizado con el backend local en PostgreSQL. Las ventas descuentan stock automáticamente y la producción de calzado lleva el control por taller.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Versión 1.0 Pro</span>
            <span className="text-emerald-400 font-semibold">● Sistema Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
}