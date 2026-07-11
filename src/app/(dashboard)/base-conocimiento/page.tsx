"use client";

import { useState, useEffect } from "react";
import { Search, MessageSquare, Lightbulb, FileText, TrendingUp, ClipboardList, Save, ArrowUpCircle, List, BarChart3, PlusCircle, Trash2, ThumbsUp, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIncidentes } from "@/context/IncidenteContext";
import { SugerenciaDTO, ArticuloKBSDTO, CrearArticuloDTO, ResumenKBSDTO, IncidenteCierreDTO } from '@/types/base-conocimiento';
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
  const { incidentes, listarIncidentes } = useIncidentes();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [contextoBusqueda, setContextoBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState<SugerenciaDTO[]>([]);
  const [sugerenciaPorContexto, setSugerenciaPorContexto] = useState<SugerenciaDTO[]>([]);
  const [moduloActivo, setModuloActivo] = useState<string | null>(null);
  const [articulos, setArticulos] = useState<ArticuloKBSDTO[]>([]);
  const [resumen, setResumen] = useState<ResumenKBSDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [vista, setVista] = useState<"busqueda" | "listado" | "crear" | "detalle">("busqueda");
  const [selectedArticulo, setSelectedArticulo] = useState<ArticuloKBSDTO | null>(null);
  const [crearForm, setCrearForm] = useState<CrearArticuloDTO>({
    titulo: "", descripcion: "", solucion: "",
    tipoArticulo: "OPERATIVO", moduloOrigen: "INCIDENCIAS",
    categoria: "", tags: [], afectaCocina: false, afectaSalon: false, afectaReservas: false,
    creadoPor: user?.nombre || "",
  });

  // Cargar incidentes al montar
  useEffect(() => { listarIncidentes(); }, [listarIncidentes]);

  // ==================== HANDLERS ====================

  const abrirBaseConocimiento = async () => {
    setLoading(true);
    setModuloActivo(null);
    try {
      const r = await baseConocimientoService.buscar({ query: searchTerm, limit: 10 });
      setSugerencias(r); setVista("busqueda");
    } catch (e: any) { console.error(e); } finally { setLoading(false); }
  };

  const obtenerSugerenciasPorContexto = async () => {
    if (!contextoBusqueda.trim()) return;
    try {
      const r = await baseConocimientoService.sugerirPorContexto(contextoBusqueda);
      setSugerenciaPorContexto(r);
    } catch (e: any) { console.error(e); }
  };

  const sugerenciasPorModulo = async (modulo: string) => {
    setLoading(true);
    setModuloActivo(modulo);
    try {
      const r = await baseConocimientoService.sugerirPorModulo(modulo);
      setSugerencias(r); setVista("busqueda");
    } catch (e: any) { console.error(e); } finally { setLoading(false); }
  };

  const listarArticulos = async () => {
    setLoading(true);
    try {
      const r = await baseConocimientoService.listarTodos();
      setArticulos(r); setVista("listado");
    } catch (e: any) { console.error(e); } finally { setLoading(false); }
  };

  const cargarResumen = async () => {
    try {
      const r = await baseConocimientoService.obtenerResumen();
      setResumen(r);
    } catch (e: any) { console.error(e); }
  };

  const crearArticulo = async () => {
    try {
      await baseConocimientoService.crear(crearForm);
      setCrearForm({ titulo: "", descripcion: "", solucion: "", tipoArticulo: "OPERATIVO", moduloOrigen: "INCIDENCIAS", categoria: "", tags: [], afectaCocina: false, afectaSalon: false, afectaReservas: false, creadoPor: user?.nombre || "" });
      await listarArticulos();
    } catch (e: any) { console.error(e); }
  };

  const eliminarArticulo = async (id: number) => {
    if (!confirm("¿Eliminar artículo?")) return;
    try { await baseConocimientoService.eliminar(id); await listarArticulos(); }
    catch (e: any) { console.error(e); }
  };

  const votarArticulo = async (id: number) => {
    try {
      const a = await baseConocimientoService.votar(id, 5);
      setArticulos(prev => prev.map(p => p.id === id ? a : p));
    } catch (e: any) { console.error(e); }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    try {
      const a = await baseConocimientoService.cambiarEstado(id, estado);
      setArticulos(prev => prev.map(p => p.id === id ? a : p));
    } catch (e: any) { console.error(e); }
  };

  const verDetalle = async (id: number) => {
    try {
      const a = await baseConocimientoService.obtenerPorId(id);
      setSelectedArticulo(a); setVista("detalle");
    } catch (e: any) { console.error(e); }
  };

  // ==================== RENDER ====================

  const renderCard = (s: SugerenciaDTO | ArticuloKBSDTO) => (
    <div key={s.id} className="border border-zinc-800 rounded-lg p-4 hover:bg-amber-500/5 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-zinc-100 font-medium text-base">{s.titulo}</h3>
        <div className={`px-2 py-0.5 rounded border text-xs uppercase tracking-widest ${moduloColors[s.moduloOrigen] || moduloColors.SOLICITUDES}`}>
          {moduloLabels[s.moduloOrigen] || s.moduloOrigen}
        </div>
      </div>
      <p className="text-zinc-400 text-sm line-clamp-2">{s.descripcion}</p>
      <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap mt-3">
        <span>Rating: {s.rating}/5</span>
        <span>Veces resuelto: {s.vecesResuelto}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-zinc-100">Base de Conocimiento</h1>
          <button onClick={cargarResumen} className="ml-2 p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-amber-400" title="Resumen"><BarChart3 className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-2">
          <button onClick={listarArticulos} className="flex items-center gap-2 px-3 py-2 bg-neutral-800 border border-zinc-700 rounded text-zinc-300 text-xs uppercase tracking-widest hover:bg-amber-500/10"><List className="w-3.5 h-3.5" /> Listar</button>
          <button onClick={() => setVista("crear")} className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 text-xs uppercase tracking-widest hover:bg-amber-500/20"><PlusCircle className="w-3.5 h-3.5" /> Crear</button>
        </div>
      </div>

      {/* RESUMEN */}
      {resumen && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: resumen.totalArticulos, color: "text-zinc-100" },
            { label: "Publicados", value: resumen.publicados, color: "text-emerald-400" },
            { label: "En Revisión", value: resumen.enRevision, color: "text-amber-400" },
            { label: "Obsolescentes", value: resumen.obsoletos, color: "text-red-400" },
            { label: "Rating Prom.", value: resumen.ratingPromedio.toFixed(1), color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="bg-neutral-950 border border-zinc-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold ${s.color}">{s.value}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {vista === "busqueda" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* BÚSQUEDA */}
            <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><Search className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold text-zinc-100">Búsqueda de Artículos</h2></div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="text" placeholder="Buscar 'horno', 'cocina', 'mesa'..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && abrirBaseConocimiento()}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50" />
                </div>
                <button onClick={abrirBaseConocimiento} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 text-sm uppercase tracking-widest hover:bg-amber-500/20"><Search className="w-4 h-4" /> Buscar</button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
              ) : moduloActivo && sugerencias.length === 0 ? (
                <div className="flex flex-col items-center py-8"><MessageSquare className="w-12 h-12 text-zinc-700" /><p className="text-sm text-zinc-500 uppercase tracking-widest mt-3">Sin artículos en <span className={`font-medium ${moduloColors[moduloActivo]}`}>{moduloLabels[moduloActivo]}</span></p></div>
              ) : moduloActivo && sugerencias.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm text-zinc-500 uppercase tracking-widest">Artículos de <span className={`font-semibold ${moduloColors[moduloActivo]}`}>{moduloLabels[moduloActivo]}</span> ({sugerencias.length})</h3>
                    <button onClick={() => { setModuloActivo(null); setSugerencias([]); setSearchTerm(""); }} className="text-xs text-zinc-600 hover:text-amber-400">
                      Limpiar filtro
                    </button>
                  </div>
                  {sugerencias.map(renderCard)}
                </div>
              ) : sugerencias.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm text-zinc-500 uppercase tracking-widest">Resultados ({sugerencias.length})</h3>
                  {sugerencias.map(renderCard)}
                </div>
              ) : searchTerm ? (
                <div className="flex flex-col items-center py-8"><Search className="w-12 h-12 text-zinc-700" /><p className="text-sm text-zinc-500 uppercase tracking-widest mt-3">Sin resultados</p></div>
              ) : null}
            </div>

            {/* SUGERENCIAS POR CONTEXTO */}
            <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><Lightbulb className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold text-zinc-100">Sugerencias por Contexto</h2></div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="text" placeholder="Ej: 'mesa caliente', 'pedido urgente', 'reserva'" value={contextoBusqueda}
                    onChange={(e) => setContextoBusqueda(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && obtenerSugerenciasPorContexto()}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50" />
                </div>
                <button onClick={obtenerSugerenciasPorContexto} className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 text-sm uppercase tracking-widest hover:bg-amber-500/20"><Lightbulb className="w-4 h-4" /> Sugerir</button>
              </div>
              {sugerenciaPorContexto.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm text-zinc-500 uppercase tracking-widest">Sugerencias para: "{contextoBusqueda}"</h3>
                  {sugerenciaPorContexto.map(renderCard)}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><ArrowUpCircle className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold text-zinc-100">¡Contribuir!</h2></div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg border border-zinc-800"><Save className="w-4 h-4 text-zinc-500" /><span className="text-sm text-zinc-400">Guardar solución al cerrar incidente</span></div>
                <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg border border-zinc-800"><TrendingUp className="w-4 h-4 text-zinc-500" /><span className="text-sm text-zinc-400">Compartir mejores prácticas</span></div>
                <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg border border-zinc-800"><ClipboardList className="w-4 h-4 text-zinc-500" /><span className="text-sm text-zinc-400">Crear artículos de capacitación</span></div>
              </div>
              {incidentes.filter(i => i.estado === "RESOLVER").slice(0, 3).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Tus contribuciones</h3>
                  {incidentes.filter(i => i.estado === "RESOLVER").slice(0, 3).map(i => (
                    <div key={i.id} className="border border-zinc-800 rounded-lg p-2 mb-2"><p className="text-xs text-zinc-300">{i.resumenProblema}</p></div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><MessageSquare className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold text-zinc-100">Por Módulo</h2></div>
              <div className="space-y-2">
                {Object.entries(moduloLabels).map(([key, label]) => (
                  <button key={key} onClick={() => sugerenciasPorModulo(key)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${moduloActivo === key ? `${moduloColors[key]} border-current` : "bg-neutral-900 border-zinc-800 hover:bg-amber-500/5"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${moduloActivo === key ? "" : moduloColors[key]}`}>{label}</span>
                      {moduloActivo === key && <span className="text-[10px] uppercase tracking-widest opacity-70">Activo</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-amber-500" /><h2 className="text-lg font-semibold text-zinc-100">Alimentación Rápida</h2></div>
              <div className="space-y-2">
                <button onClick={() => baseConocimientoService.alimentarDesdeCapacidad("cpu", "80%", "Escalar servidor")} className="w-full text-left p-2 bg-neutral-900 rounded text-xs text-zinc-400 hover:text-amber-400">Desde Capacidad</button>
                <button onClick={() => baseConocimientoService.alimentarDesdeMonitoreo("Alerta CPU", "90%", "Reiniciar servicio")} className="w-full text-left p-2 bg-neutral-900 rounded text-xs text-zinc-400 hover:text-amber-400">Desde Monitoreo</button>
                <button onClick={() => baseConocimientoService.alimentarDesdeContinuidad("DRP v2", "equipo@mail.com", "1. Backup 2. Restore")} className="w-full text-left p-2 bg-neutral-900 rounded text-xs text-zinc-400 hover:text-amber-400">Desde Continuidad</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTADO */}
      {vista === "listado" && (
        <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Todos los Artículos ({articulos.length})</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
          ) : articulos.length === 0 ? (
            <div className="text-center py-8"><p className="text-sm text-zinc-500 uppercase tracking-widest">No hay artículos</p></div>
          ) : (
            <div className="space-y-3">
              {articulos.map(a => (
                <div key={a.id} className="border border-zinc-800 rounded-lg p-4 hover:bg-amber-500/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-zinc-100 font-medium">{a.titulo}</h3>
                        <span className={`px-2 py-0.5 rounded border text-xs ${moduloColors[a.moduloOrigen] || ""}`}>{moduloLabels[a.moduloOrigen] || a.moduloOrigen}</span>
                        <span className="px-2 py-0.5 rounded border text-xs bg-zinc-800 border-zinc-700 text-zinc-400">{tipoArticuloLabels[a.tipoArticulo] || a.tipoArticulo}</span>
                        <span className="px-2 py-0.5 rounded border text-xs bg-zinc-800 border-zinc-700 text-zinc-400">{estadoArticuloLabels[a.estado] || a.estado}</span>
                      </div>
                      <p className="text-zinc-400 text-sm line-clamp-1">{a.descripcion}</p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
                        <span>⭐ {a.rating}/5 ({a.totalVotos} votos)</span>
                        <span>✅ {a.vecesResuelto} resuelto</span>
                        <span>👤 {a.creadoPor || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={() => verDetalle(a.id)} className="p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-amber-400" title="Ver detalle"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => votarArticulo(a.id)} className="p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-amber-400" title="Votar 5 estrellas"><ThumbsUp className="w-3.5 h-3.5" /></button>
                      <select onChange={(e) => cambiarEstado(a.id, e.target.value)} className="bg-neutral-900 border border-zinc-700 rounded px-1 py-1 text-xs text-zinc-400" title="Cambiar estado">
                        <option value="">Estado</option>
                        {Object.keys(estadoArticuloLabels).map(k => <option key={k} value={k}>{estadoArticuloLabels[k]}</option>)}
                      </select>
                      <button onClick={() => eliminarArticulo(a.id)} className="p-1.5 rounded border border-zinc-700 text-zinc-500 hover:text-red-400" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREAR */}
      {vista === "crear" && (
        <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Crear Nuevo Artículo</h2>
          <div className="space-y-4">
            <input placeholder="Título *" value={crearForm.titulo} onChange={(e) => setCrearForm({ ...crearForm, titulo: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50" />
            <textarea placeholder="Descripción *" value={crearForm.descripcion} onChange={(e) => setCrearForm({ ...crearForm, descripcion: e.target.value })} rows={3}
              className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50" />
            <textarea placeholder="Solución (opcional)" value={crearForm.solucion || ""} onChange={(e) => setCrearForm({ ...crearForm, solucion: e.target.value })} rows={2}
              className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm focus:outline-none focus:border-amber-500/50" />
            <div className="grid grid-cols-2 gap-3">
              <select value={crearForm.tipoArticulo} onChange={(e) => setCrearForm({ ...crearForm, tipoArticulo: e.target.value })}
                className="bg-neutral-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 text-sm">
                {Object.entries(tipoArticuloLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={crearForm.moduloOrigen} onChange={(e) => setCrearForm({ ...crearForm, moduloOrigen: e.target.value })}
                className="bg-neutral-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100 text-sm">
                {Object.entries(moduloLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <input placeholder="Categoría (ej: COMANDAS)" value={crearForm.categoria || ""} onChange={(e) => setCrearForm({ ...crearForm, categoria: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-zinc-800 rounded text-zinc-100 text-sm" />
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <label className="flex items-center gap-2"><input type="checkbox" checked={crearForm.afectaCocina || false} onChange={(e) => setCrearForm({ ...crearForm, afectaCocina: e.target.checked })} /> Afecta Cocina</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={crearForm.afectaSalon || false} onChange={(e) => setCrearForm({ ...crearForm, afectaSalon: e.target.checked })} /> Afecta Salón</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={crearForm.afectaReservas || false} onChange={(e) => setCrearForm({ ...crearForm, afectaReservas: e.target.checked })} /> Afecta Reservas</label>
            </div>
            <button onClick={crearArticulo} disabled={!crearForm.titulo || !crearForm.descripcion}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg disabled:opacity-50">
              Crear Artículo
            </button>
          </div>
        </div>
      )}

      {/* DETALLE */}
      {vista === "detalle" && selectedArticulo && (
        <div className="bg-neutral-950 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-100">{selectedArticulo.titulo}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded border text-xs ${moduloColors[selectedArticulo.moduloOrigen] || ""}`}>{moduloLabels[selectedArticulo.moduloOrigen] || selectedArticulo.moduloOrigen}</span>
                <span className="px-2 py-0.5 rounded border text-xs bg-zinc-800 border-zinc-700 text-zinc-400">{tipoArticuloLabels[selectedArticulo.tipoArticulo]}</span>
                <span className="px-2 py-0.5 rounded border text-xs bg-zinc-800 border-zinc-700 text-zinc-400">{estadoArticuloLabels[selectedArticulo.estado]}</span>
              </div>
            </div>
            <button onClick={() => setVista("listado")} className="text-xs text-zinc-500 hover:text-amber-400 uppercase tracking-widest">← Volver</button>
          </div>
          <div className="space-y-4">
            <div><h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Descripción</h4><p className="text-zinc-300 text-sm">{selectedArticulo.descripcion}</p></div>
            {selectedArticulo.solucion && <div><h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Solución</h4><p className="text-zinc-300 text-sm">{selectedArticulo.solucion}</p></div>}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-neutral-900 rounded-lg p-3"><p className="text-xs text-zinc-500">Rating</p><p className="text-zinc-100 font-medium">⭐ {selectedArticulo.rating}/5 ({selectedArticulo.totalVotos} votos)</p></div>
              <div className="bg-neutral-900 rounded-lg p-3"><p className="text-xs text-zinc-500">Veces Resuelto</p><p className="text-zinc-100 font-medium">{selectedArticulo.vecesResuelto}</p></div>
              <div className="bg-neutral-900 rounded-lg p-3"><p className="text-xs text-zinc-500">Creado por</p><p className="text-zinc-100 font-medium">{selectedArticulo.creadoPor || "—"}</p></div>
            </div>
            {selectedArticulo.tags?.length > 0 && (
              <div><h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Tags</h4><div className="flex gap-2">{selectedArticulo.tags.map(t => <span key={t} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{t}</span>)}</div></div>
            )}
            <div className="flex gap-2">
              <select onChange={(e) => e.target.value && cambiarEstado(selectedArticulo.id, e.target.value)} className="bg-neutral-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300">
                <option value="">Cambiar estado...</option>
                {Object.entries(estadoArticuloLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={() => votarArticulo(selectedArticulo.id)} className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 text-xs uppercase">Votar 5⭐</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
