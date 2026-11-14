'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { ShoppingBag, Plus } from 'lucide-react';

interface Proveedor { id: string; nombre: string; }
interface CompraProveedor {
  id: string;
  fechaCompra: string;
  total: number;
  proveedor: { nombre: string; };
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<CompraProveedor[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [proveedorId, setProveedorId] = useState('');
  const [total, setTotal] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [cData, pData] = await Promise.all([
        fetchApi('/compras-proveedores'),
        fetchApi('/proveedores'),
      ]);
      setCompras(cData);
      setProveedores(pData);
      if (pData.length > 0) setProveedorId(pData[0].id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await fetchApi('/compras-proveedores', {
        method: 'POST',
        body: JSON.stringify({
          proveedorId,
          total: parseFloat(total),
        }),
      });
      setTotal('');
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Compras a Proveedores</h1>
        <p className="text-slate-400 text-sm mt-1">Registro y control de adquisiciones de insumos y materiales.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-indigo-500" />
          <span>Registrar Compra a Proveedor</span>
        </h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          >
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          <input
            type="number"
            step="any"
            placeholder="Monto Total (S/)"
            required
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />

          <button
            type="submit"
            disabled={cargando}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{cargando ? 'Registrando...' : 'Registrar Compra'}</span>
          </button>
        </form>
      </div>

      {/* Tabla de Historial */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Fecha</th>
              <th className="p-4">Proveedor</th>
              <th className="p-4">Total Invertido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {compras.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-slate-500">
                  No hay compras a proveedores registradas.
                </td>
              </tr>
            ) : (
              compras.map((compra) => (
                <tr key={compra.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 text-slate-300">{new Date(compra.fechaCompra).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-white">{compra.proveedor?.nombre}</td>
                  <td className="p-4 text-emerald-400 font-bold">S/ {Number(compra.total).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}