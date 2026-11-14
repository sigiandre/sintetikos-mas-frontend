'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { ShoppingCart, Plus } from 'lucide-react';

interface Producto { id: string; nombre: string; stockActual: number; precioVenta: number; unidadMedida: string; }
interface Cliente { id: string; nombre: string; }
interface VentaItem {
  id: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: { nombre: string; unidadMedida: string; };
}
interface Venta {
  id: string;
  fechaVenta: string;
  total: number;
  cliente: { nombre: string; };
  items: VentaItem[];
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [vData, pData, cData] = await Promise.all([
        fetchApi('/operacion/ventas'),
        fetchApi('/productos'),
        fetchApi('/clientes'),
      ]);
      setVentas(vData);
      setProductos(pData);
      setClientes(cData);
      if (cData.length > 0) setClienteId(cData[0].id);
      if (pData.length > 0) {
        setProductoId(pData[0].id);
        setPrecioVenta(pData[0].precioVenta);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleProductoChange = (id: string) => {
    setProductoId(id);
    const prod = productos.find((p) => p.id === id);
    if (prod) setPrecioVenta(prod.precioVenta.toString());
  };

  const handleCrearVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await fetchApi('/operacion/ventas', {
        method: 'POST',
        body: JSON.stringify({
          clienteId,
          items: [
            {
              productoId,
              cantidad: parseFloat(cantidad),
              precioUnitario: parseFloat(precioVenta),
            },
          ],
        }),
      });
      setCantidad('');
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
        <h1 className="text-3xl font-bold text-white tracking-tight">Ventas de Insumos</h1>
        <p className="text-slate-400 text-sm mt-1">Salida de materiales con descuento automático de inventario.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-amber-500" />
          <span>Registrar Venta</span>
        </h2>
        <form onSubmit={handleCrearVenta} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          >
            <option value="">Selecciona Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <select
            value={productoId}
            onChange={(e) => handleProductoChange(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          >
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stockActual})</option>
            ))}
          </select>

          <input
            type="number"
            step="any"
            placeholder="Cantidad"
            required
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />

          <input
            type="number"
            step="any"
            placeholder="Precio Unitario"
            required
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />

          <button
            type="submit"
            disabled={cargando}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{cargando ? 'Registrando...' : 'Procesar Venta'}</span>
          </button>
        </form>
      </div>

      {/* Tabla de Historial de Ventas */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Fecha</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Detalle Insumo</th>
              <th className="p-4">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {ventas.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  No hay ventas registradas aún.
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 text-slate-300">{new Date(v.fechaVenta).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-white">{v.cliente?.nombre || 'General'}</td>
                  <td className="p-4 text-slate-300">
                    {v.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.cantidad}x {item.producto?.nombre} (S/ {item.subtotal})
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-emerald-400 font-bold">S/ {Number(v.total).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}