'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Tag, Plus, Trash2 } from 'lucide-react';

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarCategorias = async () => {
    try {
      const data = await fetchApi('/categorias');
      setCategorias(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await fetchApi('/categorias', {
        method: 'POST',
        body: JSON.stringify({ nombre, descripcion }),
      });
      setNombre('');
      setDescripcion('');
      cargarCategorias();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await fetchApi(`/categorias/${id}`, { method: 'DELETE' });
      cargarCategorias();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Categorías</h1>
        <p className="text-slate-400 text-sm mt-1">Organiza los tipos de materiales (cueros, pegamentos, avíos, etc.).</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario de Creación */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Tag className="w-5 h-5 text-indigo-500" />
          <span>Nueva Categoría</span>
        </h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nombre (ej. Cueros Sintéticos)"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
          />
          <input
            type="text"
            placeholder="Descripción opcional"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
          />
          <button
            type="submit"
            disabled={cargando}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{cargando ? 'Guardando...' : 'Crear Categoría'}</span>
          </button>
        </form>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Nombre</th>
              <th className="p-4">Descripción</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-slate-500">
                  No hay categorías registradas aún.
                </td>
              </tr>
            ) : (
              categorias.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-semibold text-white">{cat.nombre}</td>
                  <td className="p-4 text-slate-400">{cat.descripcion || 'Sin descripción'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEliminar(cat.id)}
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