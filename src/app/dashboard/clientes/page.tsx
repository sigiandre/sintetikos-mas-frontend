'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Users, Plus, Trash2, Phone, MapPin, UserCheck, Search } from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  direccion?: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  // Estado para el buscador en tiempo real
  const [busqueda, setBusqueda] = useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarClientes = async () => {
    try {
      const data = await fetchApi('/clientes');
      setClientes(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await fetchApi('/clientes', {
        method: 'POST',
        body: JSON.stringify({ nombre, contacto, telefono, direccion }),
      });
      setNombre('');
      setContacto('');
      setTelefono('');
      setDireccion('');
      cargarClientes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await fetchApi(`/clientes/${id}`, { method: 'DELETE' });
      cargarClientes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtrado instantáneo
  const clientesFiltrados = clientes.filter((cli) => {
    const texto = busqueda.toLowerCase();
    return (
      cli.nombre.toLowerCase().includes(texto) ||
      (cli.contacto && cli.contacto.toLowerCase().includes(texto)) ||
      (cli.telefono && cli.telefono.toLowerCase().includes(texto)) ||
      (cli.direccion && cli.direccion.toLowerCase().includes(texto))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Clientes (Fabricantes de Calzado)</h1>
        <p className="text-slate-400 text-sm mt-1">Registro de talleres y fabricantes que compran insumos y elaboran calzado.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <span>Registrar Cliente / Taller</span>
        </h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre del cliente o taller"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <input
            type="text"
            placeholder="Persona responsable"
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
            placeholder="Dirección del taller"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={cargando}
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{cargando ? 'Guardando...' : 'Guardar Cliente'}</span>
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
            placeholder="Buscar taller o responsable..."
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
              <th className="p-4">Cliente / Taller</th>
              <th className="p-4">Responsable</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Dirección</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cli) => (
                <tr key={cli.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-semibold text-white">{cli.nombre}</td>
                  <td className="p-4 text-slate-300 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>{cli.contacto || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cli.telefono || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cli.direccion || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEliminar(cli.id)}
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