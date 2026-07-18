"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, List, PlusCircle, Trash2, ThumbsUp, ThumbsDown, Eye, X, Search, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ArticuloKBSDTO, CrearArticuloDTO, SugerenciaDTO } from '@/types/base-conocimiento';
import { baseConocimientoService } from '@/services/baseConocimientoService';

const moduloColors: Record<string, string> = {
  SOLICITUDES: "bg-purple-500/15 border-purple-500/30 text-purple-400",
  CAMBIOS: "bg-amber-500/15 border-amber-500/30 text-amber-500",
  INCIDENCIAS: "bg-red-500/15 border-red-500/30 text-red-400",
  CAPACIDAD: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
  MONITOREO: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  CONTINUIDAD: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
};

const moduloLabels: Record<string, string> = {
  SOLICITUDES: "Solicitudes", CAMBIOS: "Cambios", INCIDENCIAS: "Incidencias",
  CAPACIDAD: "Capacidad", MONITOREO: "Monitoreo", CONTINUIDAD: "Continuidad",
};

const tipoArticuloLabels: Record<string, string> = {
  OPERATIVO: "Operativo", ESTRATEGICO: "Estratégico", CRISIS: "Crisis",
};

const estadoArticuloLabels: Record<string, string> = {
  BORRADOR: "Borrador", REVISION_PARES: "Revisión Pares", PUBLICADO: "Publicado",
  OBSOLETO: "Obsoleto", EMERGENCIA_ACTIVA: "Emergencia Activa",
};

export default function BaseConocimientoPage() {
  const { user } = useAuth();
  const [articulos, setArticulos] = useState<(ArticuloKBSDTO | SugerenciaDTO)[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCrear, setShowCrear] = useState(false);
  const [detalle, setDetalle] = useState<ArticuloKBSDTO | null>(null);
  const [crearForm, setCrearForm] = useState<CrearArticuloDTO>({
    titulo: "", descripcion: "", solucion: "",
    tipoArticulo: "OPERATIVO", moduloOrigen: "INCIDENCIAS",
    categoria: "", afectaCocina: false, afectaSalon: false, afectaReservas: false, creadoPor: "",
  });

  useEffect(() => { listarArticulos(); }, []);

  const listarArticulos = async () => {
    setLoading(true);
    try {
      const r = await baseConocimientoService.listarTodos();
      setArticulos(r);
    } catch (e: any) { console.error("Error al listar:", e); }
    finally { setLoading(false); }
  };

  const crearArticulo = async () => {
    try {
      await baseConocimientoService.crear(crearForm);
      setCrearForm({ titulo: "", descripcion: "", solucion: "", tipoArticulo: "OPERATIVO", moduloOrigen: "INCIDENCIAS", categoria: "", afectaCocina: false, afectaSalon: false, afectaReservas: false, creadoPor: "" });
      setShowCrear(false);
      await listarArticulos();
    } catch (e: any) { console.error("Error al crear:", e); }
  };

  const eliminarArticulo = async (id: number) => {
    if (!confirm("¿Eliminar artículo?")) return;
    try { await baseConocimientoService.eliminar(id); await listarArticulos(); }
    catch (e: any) { console.error(e); }
  };

  const votarArticulo = async (id: number, tipo: "LIKE" | "DISLIKE") => {
    try { const a = await baseConocimientoService.votar(id, tipo); setArticulos(prev => prev.map(p => p.id === id ? a : p)); }
    catch (e: any) { console.error(e); }
  };

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscarArticulos = async (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) { await listarArticulos(); return; }
    setIsSearching(true); setLoading(true);
    try { const r = await baseConocimientoService.buscar({ query: term, limit: 50 }); setArticulos(r as any); }
    catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setIsSearching(false); listarArticulos(); return; }
    debounceRef.current = setTimeout(() => buscarArticulos(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const limpiarBusqueda = async () => {
    setQuery(""); setIsSearching(false); await listarArticulos();
  };

  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState<CrearArticuloDTO>({ titulo: "", descripcion: "", solucion: "", tipoArticulo: "OPERATIVO", moduloOrigen: "INCIDENCIAS", categoria: "", afectaCocina: false, afectaSalon: false, afectaReservas: false });

  const verDetalle = async (id: number) => {
    try { const a = await baseConocimientoService.obtenerPorId(id); setDetalle(a); setEditando(false); }
    catch (e: any) { console.error(e); }
  };

  const iniciarEdicion = () => {
    if (!detalle) return;
    setEditForm({ titulo: detalle.titulo, descripcion: detalle.descripcion, solucion: detalle.solucion, tipoArticulo: detalle.tipoArticulo, moduloOrigen: detalle.moduloOrigen, categoria: detalle.categoria, afectaCocina: detalle.afectaCocina, afectaSalon: detalle.afectaSalon, afectaReservas: detalle.afectaReservas });
    setEditando(true);
  };

  const guardarEdicion = async () => {
    if (!detalle) return;
    try { const a = await baseConocimientoService.actualizar(detalle.id, editForm); setDetalle(a); setEditando(false); await listarArticulos(); }
    catch (e: any) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-zinc-100">Base de Conocimiento</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={listarArticulos} className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-zinc-700 rounded text-zinc-300 text-sm uppercase tracking-widest hover:bg-amber-500/10">
            <List className="w-4 h-4" /> ACTUALIZAR
          </button>
          <button onClick={() => { setCrearForm(prev => ({ ...prev, creadoPor: user?.nombre || "" })); setShowCrear(true); }} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 text-sm uppercase tracking-widest hover:bg-amber-500/20">
            <PlusCircle className="w-4 h-4" /> CREAR
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
            placeholder="Buscar artículos por título, descripción, categoría..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50" />
        </div>
        {isSearching && (
          <button onClick={limpiarBusqueda} className="flex items-center gap-1 px-3 py-2.5 border border-zinc-700 rounded-lg text-zinc-400 text-sm hover:text-zinc-200">
            <XCircle className="w-4 h-4" /> Limpiar
          </button>
        )}
      </div>

      {/* LISTA */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : articulos.length > 0 ? (
        <div className="bg-neutral-950 border border-zinc-800 rounded-xl divide-y divide-zinc-800/50">
          <div className="px-4 py-2 text-xs text-zinc-500 uppercase tracking-widest bg-zinc-900/50 rounded-t-xl">
            {articulos.length} artículo{articulos.length !== 1 ? "s" : ""}
          </div>
          {articulos.map(a => (
            <div key={a.id} className="px-4 py-3 flex items-start justify-between hover:bg-amber-500/5 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-zinc-100 font-medium text-sm truncate">{a.titulo}</h3>
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase ${moduloColors[a.moduloOrigen] || ""}`}>{moduloLabels[a.moduloOrigen] || a.moduloOrigen}</span>
                  {'tipoArticulo' in a && <span className="px-1.5 py-0.5 rounded border text-[10px] bg-zinc-800 border-zinc-700 text-zinc-400">{tipoArticuloLabels[(a as any).tipoArticulo] || (a as any).tipoArticulo}</span>}
                  {'estado' in a && <span className="px-1.5 py-0.5 rounded border text-[10px] bg-zinc-800 border-zinc-700 text-zinc-400">{estadoArticuloLabels[(a as any).estado] || (a as any).estado}</span>}
                </div>
                <p className="text-zinc-400 text-xs line-clamp-1">{a.descripcion}</p>
                <div className="flex items-center gap-3 text-[10px] text-zinc-600 mt-1">
                  <span className="text-emerald-400">👍 {a.likes}</span>
                  <span className="text-red-400">👎 {a.dislikes}</span>
                  <span>⭐ {a.rating.toFixed(1)} ({(a as any).totalVotos ?? 0})</span>
                  <span>👤 {(a as any).creadoPor || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button onClick={() => verDetalle(a.id)} className="p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-amber-400" title="Ver"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => votarArticulo(a.id, "LIKE")} className="p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-emerald-400" title="Like"><ThumbsUp className="w-3.5 h-3.5" /></button>
                <button onClick={() => votarArticulo(a.id, "DISLIKE")} className="p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-red-400" title="Dislike"><ThumbsDown className="w-3.5 h-3.5" /></button>
                <button onClick={() => eliminarArticulo(a.id)} className="p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-red-400" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 bg-neutral-950 border border-zinc-800 rounded-xl">
          <FileText className="w-12 h-12 text-zinc-700" />
          <p className="text-sm text-zinc-500 uppercase tracking-widest mt-3">No hay artículos. ¡Crea uno!</p>
        </div>
      )}

      {/* MODAL CREAR */}
      {showCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCrear(false)}>
          <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">Nuevo Artículo</h2>
              <button onClick={() => setShowCrear(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Título *" value={crearForm.titulo} onChange={e => setCrearForm({ ...crearForm, titulo: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50" />
              <textarea placeholder="Descripción *" value={crearForm.descripcion} onChange={e => setCrearForm({ ...crearForm, descripcion: e.target.value })} rows={3}
                className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50" />
              <textarea placeholder="Solución *" value={crearForm.solucion || ""} onChange={e => setCrearForm({ ...crearForm, solucion: e.target.value })} rows={5}
                className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50" />
              <div className="grid grid-cols-2 gap-3">
                <select value={crearForm.tipoArticulo} onChange={e => setCrearForm({ ...crearForm, tipoArticulo: e.target.value })}
                  className="bg-neutral-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 text-sm">
                  {Object.entries(tipoArticuloLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={crearForm.moduloOrigen} onChange={e => setCrearForm({ ...crearForm, moduloOrigen: e.target.value })}
                  className="bg-neutral-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 text-sm">
                  {Object.entries(moduloLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <input placeholder="Categoría (ej: COMANDAS)" value={crearForm.categoria || ""} onChange={e => setCrearForm({ ...crearForm, categoria: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm" />
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <label className="flex items-center gap-2"><input type="checkbox" checked={crearForm.afectaCocina || false} onChange={e => setCrearForm({ ...crearForm, afectaCocina: e.target.checked })} /> Cocina</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={crearForm.afectaSalon || false} onChange={e => setCrearForm({ ...crearForm, afectaSalon: e.target.checked })} /> Salón</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={crearForm.afectaReservas || false} onChange={e => setCrearForm({ ...crearForm, afectaReservas: e.target.checked })} /> Reservas</label>
              </div>
              <div className="text-xs text-zinc-500">Creado por: <span className="text-zinc-300 font-medium">{crearForm.creadoPor || "—"}</span></div>
              <button onClick={crearArticulo} disabled={!crearForm.titulo || !crearForm.descripcion}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg disabled:opacity-50 text-sm">
                Guardar Artículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE / EDICIÓN */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setDetalle(null); setEditando(false); }}>
          <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">{editando ? "Editar Artículo" : detalle.titulo}</h2>
              <button onClick={() => { setDetalle(null); setEditando(false); }} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>

            {editando ? (
              <div className="space-y-3">
                <input placeholder="Título" value={editForm.titulo} onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm" />
                <textarea placeholder="Descripción" value={editForm.descripcion} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} rows={3}
                  className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm" />
                <textarea placeholder="Solución" value={editForm.solucion || ""} onChange={e => setEditForm({ ...editForm, solucion: e.target.value })} rows={3}
                  className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={editForm.tipoArticulo} onChange={e => setEditForm({ ...editForm, tipoArticulo: e.target.value })}
                    className="bg-neutral-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 text-sm">
                    {Object.entries(tipoArticuloLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <select value={editForm.moduloOrigen} onChange={e => setEditForm({ ...editForm, moduloOrigen: e.target.value })}
                    className="bg-neutral-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 text-sm">
                    {Object.entries(moduloLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <input placeholder="Categoría" value={editForm.categoria || ""} onChange={e => setEditForm({ ...editForm, categoria: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm" />
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={editForm.afectaCocina || false} onChange={e => setEditForm({ ...editForm, afectaCocina: e.target.checked })} /> Cocina</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={editForm.afectaSalon || false} onChange={e => setEditForm({ ...editForm, afectaSalon: e.target.checked })} /> Salón</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={editForm.afectaReservas || false} onChange={e => setEditForm({ ...editForm, afectaReservas: e.target.checked })} /> Reservas</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={guardarEdicion} disabled={!editForm.titulo || !editForm.descripcion}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg disabled:opacity-50 text-sm">Guardar Cambios</button>
                  <button onClick={() => setEditando(false)} className="px-4 py-2 border border-zinc-700 rounded-lg text-zinc-300 text-sm hover:bg-zinc-800">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-0.5 rounded border text-xs ${moduloColors[detalle.moduloOrigen] || ""}`}>{moduloLabels[detalle.moduloOrigen] || detalle.moduloOrigen}</span>
                  <span className="px-2 py-0.5 rounded border text-xs bg-zinc-800 border-zinc-700 text-zinc-400">{tipoArticuloLabels[detalle.tipoArticulo]}</span>
                  <select value={detalle.estado} onChange={async e => { try { const a = await baseConocimientoService.cambiarEstado(detalle.id, e.target.value); setDetalle(a); await listarArticulos(); } catch (err) { console.error(err); } }}
                    className="px-2 py-0.5 rounded border text-xs bg-zinc-800 border-zinc-700 text-zinc-300 cursor-pointer">
                    {Object.entries(estadoArticuloLabels).map(([k, v]) => <option key={k} value={k} className="bg-zinc-800">{v}</option>)}
                  </select>
                </div>
                <div className="space-y-3 text-sm">
                  <div><p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Descripción</p><p className="text-zinc-300">{detalle.descripcion}</p></div>
                  {detalle.solucion && (() => { const pasos = detalle.solucion!.split(/(?=\d+\.\s)/).filter(s => s.trim()); return <div><p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Solución</p><ol className="list-decimal list-inside text-zinc-300 space-y-1">{pasos.map((p, i) => <li key={i} className="text-sm">{p.replace(/^\d+\.\s*/, '')}</li>)}</ol></div>; })()}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-neutral-900 rounded-lg p-2"><p className="text-[10px] text-zinc-500">Rating</p><p className="text-zinc-100 font-medium">⭐ {detalle.rating.toFixed(1)}</p></div>
                    <div className="bg-neutral-900 rounded-lg p-2"><p className="text-[10px] text-zinc-500">Votos</p><p className="text-zinc-100 font-medium"><span className="text-emerald-400">👍 {detalle.likes}</span> <span className="text-red-400">👎 {detalle.dislikes}</span></p></div>
                    <div className="bg-neutral-900 rounded-lg p-2"><p className="text-[10px] text-zinc-500">Creado por</p><p className="text-zinc-100 font-medium truncate">{detalle.creadoPor || "—"}</p></div>
                  </div>
                  <button onClick={iniciarEdicion} className="w-full py-2 border border-amber-500/30 text-amber-500 rounded-lg text-sm hover:bg-amber-500/10">Editar Artículo</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
