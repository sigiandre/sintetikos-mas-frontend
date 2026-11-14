'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Truck, Plus, Trash2, Phone, MapPin, UserCheck, Search } from 'lucide-react';

interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  direccion?: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  // Estado para el buscador en tiempo real
  const [busqueda, setBusqueda] = useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarProveedores = async () => {
    try {
      const data = await fetchApi('/proveedores');
      setProveedores(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await fetchApi('/proveedores', {
        method: 'POST',
        body: JSON.stringify({ nombre, contacto, telefono, direccion }),
      });
      setNombre('');
      setContacto('');
      setTelefono('');
      setDireccion('');
      cargarProveedores();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await fetchApi(`/proveedores/${id}`, { method: 'DELETE' });
      cargarProveedores();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtrado instantáneo
  const proveedoresFiltrados = proveedores.filter((prov) => {
    const texto = busqueda.toLowerCase();
    return (
      prov.nombre.toLowerCase().includes(texto) ||
      (prov.contacto && prov.contacto.toLowerCase().includes(texto)) ||
      (prov.telefono && prov.telefono.toLowerCase().includes(texto)) ||
      (prov.direccion && prov.direccion.toLowerCase().includes(texto))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Proveedores</h1>
        <p className="text-slate-400 text-sm mt-1">Control de proveedores de cueros, suelas, pegamentos y avíos.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Truck className="w-5 h-5 text-indigo-500" />
          <span>Registrar Proveedor</span>
        </h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre de la empresa"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <input
            type="text"
            placeholder="Persona de contacto"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={cargando}
              className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{cargando ? 'Guardando...' : 'Guardar Proveedor'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar proveedor por empresa, contacto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
              <th className="p-4">Empresa</th>
              <th className="p-4">Contacto</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Dirección</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No se encontraron proveedores.
                </td>
              </tr>
            ) : (
              proveedoresFiltrados.map((prov) => (
                <tr key={prov.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-semibold text-white">{prov.nombre}</td>
                  <td className="p-4 text-slate-300 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>{prov.contacto || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{prov.telefono || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{prov.direccion || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEliminar(prov.id)}
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