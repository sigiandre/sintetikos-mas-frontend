'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Package, Plus, Trash2, Search, Filter } from 'lucide-react';

interface Categoria { id: string; nombre: string; }
interface Proveedor { id: string; nombre: string; }
interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  stockActual: number;
  precioVenta: number;
  categoria: Categoria;
  proveedor?: Proveedor;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('METRO');
  const [stockActual, setStockActual] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  
  // Estados de Filtros y Buscador
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [prods, cats, provs] = await Promise.all([
        fetchApi('/productos'),
        fetchApi('/categorias'),
        fetchApi('/proveedores'),
      ]);
      setProductos(prods);
      setCategorias(cats);
      setProveedores(provs);
      if (cats.length > 0) setCategoriaId(cats[0].id);
      if (provs.length > 0) setProveedorId(provs[0].id);
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
      await fetchApi('/productos', {
        method: 'POST',
        body: JSON.stringify({
          nombre,
          descripcion,
          categoriaId,
          proveedorId: proveedorId || undefined,
          unidadMedida,
          stockActual: parseFloat(stockActual),
          precioCompra: parseFloat(precioCompra),
          precioVenta: parseFloat(precioVenta),
        }),
      });
      setNombre('');
      setDescripcion('');
      setStockActual('');
      setPrecioCompra('');
      setPrecioVenta('');
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este insumo?')) return;
    try {
      await fetchApi(`/productos/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtrado en tiempo real por texto y categoría
  const productosFiltrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           (prod.descripcion && prod.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideCategoria = filtroCategoria === 'TODAS' || prod.categoria?.id === filtroCategoria;
    return coincideNombre && coincideCategoria;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Inventario de Insumos</h1>
        <p className="text-slate-400 text-sm mt-1">Control de rollos, cueros, pegamentos y materiales de calzado.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario de Creación */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Package className="w-5 h-5 text-indigo-500" />
          <span>Registrar Nuevo Insumo</span>
        </h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nombre del insumo (ej. Napa Negro)"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          >
            <option value="">Selecciona Proveedor (Opcional)</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <select
            value={unidadMedida}
            onChange={(e) => setUnidadMedida(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          >
            <option value="METRO">METRO</option>
            <option value="ROLLO">ROLLO</option>
            <option value="GALON">GALON</option>
            <option value="LATA">LATA</option>
            <option value="KILOGRAMO">KILOGRAMO</option>
            <option value="UNIDAD">UNIDAD</option>
          </select>
          <input
            type="number"
            step="any"
            placeholder="Stock Inicial"
            required
            value={stockActual}
            onChange={(e) => setStockActual(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <input
            type="number"
            step="any"
            placeholder="Precio Compra (S/)"
            required
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <input
            type="number"
            step="any"
            placeholder="Precio Venta (S/)"
            required
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <input
            type="text"
            placeholder="Descripción corta"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm md:col-span-2"
          />
          <button
            type="submit"
            disabled={cargando}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{cargando ? 'Guardando...' : 'Guardar Insumo'}</span>
          </button>
        </form>
      </div>

      {/* Barra de Búsqueda y Filtros en Tiempo Real */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar insumo por nombre o detalle..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 w-full md:w-auto"
          >
            <option value="TODAS">Todas las Categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Productos Filtrada */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Insumo</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Stock Actual</th>
              <th className="p-4">P. Venta</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No se encontraron insumos con esos criterios de búsqueda.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-semibold text-white">
                    {prod.nombre}
                    <div className="text-xs text-slate-400 font-normal">{prod.descripcion}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-semibold border border-indigo-500/20">
                      {prod.categoria?.nombre || 'S/C'}
                    </span>
                  </td>
                  <td className="p-4 text-white font-medium">
                    {prod.stockActual} <span className="text-xs text-slate-400">{prod.unidadMedida}</span>
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">S/ {Number(prod.precioVenta).toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEliminar(prod.id)}
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