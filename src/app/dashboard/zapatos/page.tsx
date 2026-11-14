'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Footprints, Plus, Trash2 } from 'lucide-react';

interface Cliente { id: string; nombre: string; }
interface ZapatoFabricado {
  id: string;
  modelo: string;
  color: string;
  talla: string;
  cantidad: number;
  fechaFabricacion: string;
  cliente: { nombre: string; };
}

export default function ZapatosPage() {
  const [zapatos, setZapatos] = useState<ZapatoFabricado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [modelo, setModelo] = useState('');
  const [color, setColor] = useState('');
  const [talla, setTalla] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [zData, cData] = await Promise.all([
        fetchApi('/operacion/zapatos-fabricados'),
        fetchApi('/clientes'),
      ]);
      setZapatos(zData);
      setClientes(cData);
      if (cData.length > 0) setClienteId(cData[0].id);
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
      await fetchApi('/operacion/zapatos-fabricados', {
        method: 'POST',
        body: JSON.stringify({
          clienteId,
          modelo,
          color,
          talla,
          cantidad: parseInt(cantidad),
        }),
      });
      setModelo('');
      setColor('');
      setTalla('');
      setCantidad('');
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de producción?')) return;
    try {
      await fetchApi(`/operacion/zapatos-fabricados/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Zapatos Fabricados</h1>
        <p className="text-slate-400 text-sm mt-1">Registro de producción de calzado elaborado por los talleres clientes.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Footprints className="w-5 h-5 text-cyan-500" />
          <span>Registrar Lote de Calzado</span>
        </h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Modelo (ej. Oxford)"
            required
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />

          <input
            type="text"
            placeholder="Color"
            required
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />

          <input
            type="text"
            placeholder="Talla (ej. 39-42)"
            required
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />

          <input
            type="number"
            placeholder="Cantidad Pares"
            required
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />

          <button
            type="submit"
            disabled={cargando}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{cargando ? 'Guardando...' : 'Registrar'}</span>
          </button>
        </form>
      </div>

      {/* Tabla de Producción */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Fecha</th>
              <th className="p-4">Cliente / Taller</th>
              <th className="p-4">Modelo</th>
              <th className="p-4">Color / Talla</th>
              <th className="p-4">Cantidad</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {zapatos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No hay registros de calzado fabricado.
                </td>
              </tr>
            ) : (
              zapatos.map((z) => (
                <tr key={z.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 text-slate-300">{new Date(z.fechaFabricacion).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-white">{z.cliente?.nombre}</td>
                  <td className="p-4 text-indigo-400 font-medium">{z.modelo}</td>
                  <td className="p-4 text-slate-300">{z.color} (Talla: {z.talla})</td>
                  <td className="p-4 text-cyan-400 font-bold">{z.cantidad} pares</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEliminar(z.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}