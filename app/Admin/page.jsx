"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Asegúrate de que la ruta sea correcta (../ sube un nivel)

export default function AdminPage() {
  const [acceso, setAcceso] = useState(false);
  const [pin, setPin] = useState("");
  const [modo, setModo] = useState("cocina"); // 'cocina' o 'caja'
  
  // --- LOGIN SIMPLE ---
  if (!acceso) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h1 className="mb-6 text-4xl font-black text-red-500">🛡️ STAFF CHILIKANTE</h1>
        <div className="bg-white/10 p-8 rounded-2xl flex flex-col items-center w-full max-w-sm backdrop-blur-sm">
          <p className="mb-4 font-bold text-gray-300">Ingresa el PIN de acceso</p>
          <input
            type="password"
            className="w-full rounded-xl p-4 text-black text-center text-3xl font-bold tracking-widest mb-6 focus:ring-4 focus:ring-red-500 outline-none"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
          />
          <div className="grid grid-cols-3 gap-4 w-full mb-6">
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <button key={num} onClick={() => setPin(prev => prev + num)} className="bg-gray-700 p-4 rounded-xl font-bold text-xl hover:bg-gray-600 transition-colors">{num}</button>
            ))}
            <button onClick={() => setPin('')} className="bg-red-900/50 p-4 rounded-xl font-bold text-xl text-red-300">C</button>
            <button onClick={() => setPin(prev => prev + '0')} className="bg-gray-700 p-4 rounded-xl font-bold text-xl">0</button>
            <button onClick={() => { if(pin === "1234") setAcceso(true); else alert("PIN Incorrecto"); }} className="bg-green-600 p-4 rounded-xl font-bold text-xl">➔</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <h1 className="text-xl font-bold tracking-wider">🔥 ADMIN HUB</h1>
        
        {/* SWITCHER DE MODOS */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button 
            onClick={() => setModo('cocina')}
            className={`px-4 md:px-6 py-2 rounded-md font-bold transition-all text-sm md:text-base ${modo === 'cocina' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            👨‍🍳 COCINA
          </button>
          <button 
            onClick={() => setModo('caja')}
            className={`px-4 md:px-6 py-2 rounded-md font-bold transition-all text-sm md:text-base ${modo === 'caja' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ CAJA
          </button>
        </div>
        
        <button onClick={() => setAcceso(false)} className="text-sm text-gray-400 hover:text-white ml-2">Salir</button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-hidden h-[calc(100vh-80px)]">
        {modo === 'cocina' ? <VistaCocina /> : <VistaCajaRapida />}
      </div>
    </div>
  );
}

// ==========================================
// 1. VISTA COCINA (Monitor de Pedidos)
// ==========================================
function VistaCocina() {
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    // Cargar inicial
    const fetchOrdenes = async () => {
      const { data } = await supabase.from("ordenes").select("*").neq("estado", "entregado").order("id", { ascending: false });
      if (data) setOrdenes(data);
    };
    fetchOrdenes();

    // Realtime
    const canal = supabase.channel("admin-cocina").on("postgres_changes", { event: "*", schema: "public", table: "ordenes" }, (payload) => {
      if (payload.eventType === "INSERT") setOrdenes(prev => [payload.new, ...prev]);
      if (payload.eventType === "UPDATE") setOrdenes(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
    }).subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    // Optimistic UI update
    setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o));
    await supabase.from("ordenes").update({ estado: nuevoEstado }).eq("id", id);
  };

  return (
    <div className="p-4 h-full overflow-y-auto pb-20">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ordenes.map((orden) => {
          const esNuevo = orden.estado === 'pendiente';
          const esListo = orden.estado === 'listo';
          
          return (
            <div key={orden.id} className={`flex flex-col justify-between rounded-xl border-4 p-4 shadow-lg min-h-[300px] transition-all ${
              esNuevo ? 'border-red-500 bg-white' : esListo ? 'border-green-500 bg-green-50 opacity-75' : 'border-yellow-400 bg-yellow-50'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <span className="text-4xl font-black text-gray-800">#{orden.id}</span>
                  <div className="text-right">
                     <p className="font-bold text-lg text-gray-900 leading-none uppercase">{orden.nombre_cliente}</p>
                     <p className="text-xs text-gray-500">{new Date(orden.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {orden.detalles.map((item, i) => (
                    <div key={i} className="leading-tight">
                      <p className="font-black text-gray-800 text-lg">
                        {item.cantidad}x {item.platillo}
                      </p>
                      {item.notas && item.notas.length > 0 && (
                        <p className="text-sm font-bold text-red-600 bg-red-100 inline-block px-1 rounded">
                          {item.notas.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
                 {!esListo ? (
                   <>
                     {/* BOTÓN PREPARANDO (Opcional) */}
                     {orden.estado !== 'preparando' && (
                       <button onClick={() => cambiarEstado(orden.id, 'preparando')} className="col-span-1 bg-yellow-400 text-yellow-900 font-bold py-3 rounded-lg hover:bg-yellow-500">
                         👨‍🍳 Oído
                       </button>
                     )}
                     
                     <button onClick={() => cambiarEstado(orden.id, 'listo')} className={`${orden.estado === 'preparando' ? 'col-span-2' : 'col-span-1'} bg-green-600 text-white font-black py-3 rounded-lg text-xl shadow-md active:scale-95 transition-transform hover:bg-green-700`}>
                       LISTO ✅
                     </button>
                   </>
                 ) : (
                   <button onClick={() => cambiarEstado(orden.id, 'entregado')} className="col-span-2 bg-gray-300 text-gray-600 font-bold py-2 rounded-lg hover:bg-gray-400">
                     Archivar (Entregado) 📁
                   </button>
                 )}
              </div>
            </div>
          );
        })}
        {ordenes.length === 0 && <div className="col-span-full text-center text-gray-400 py-20 text-2xl font-bold">Todo tranquilo en la cocina... 🦗</div>}
      </div>
    </div>
  );
}

// ==========================================
// 2. VISTA CAJA RÁPIDA (Para Empleados)
// ==========================================
function VistaCajaRapida() {
  const [ticket, setTicket] = useState([]);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  // Menú rápido
  const productos = [
    { nombre: "Sencillos", precio: 50 },
    { nombre: "Con Pollo", precio: 60 },
    { nombre: "Con Arrachera", precio: 65 },
  ];
  
  const extras = [
    { nombre: "Extra Pollo", precio: 15 },
    { nombre: "Extra Arrachera", precio: 20 },
    { nombre: "Con Huevo", precio: 10 },
  ];

  const gustos = ["Sin Cebolla", "Sin Crema", "Sin Queso", "Salsa Aparte", "Para Llevar"];

  // Agregar item al ticket
  const agregarAlTicket = (prod) => {
    const nuevoItem = { 
      id_temp: Date.now(), 
      platillo: prod.nombre, 
      precio: prod.precio, 
      notas: [], 
      cantidad: 1 
    };
    setTicket([...ticket, nuevoItem]);
  };

  // Agregar nota/extra al ÚLTIMO item agregado
  const agregarNotaUltimoItem = (texto, precioExtra = 0) => {
    if (ticket.length === 0) return;
    const nuevoTicket = [...ticket];
    const ultimoItem = nuevoTicket[nuevoTicket.length - 1];
    
    // Evitar duplicados
    if (!ultimoItem.notas.includes(texto)) {
        ultimoItem.notas.push(texto);
        ultimoItem.precio += precioExtra;
    }
    setTicket(nuevoTicket);
  };

  const enviarOrden = async () => {
    if (ticket.length === 0) return;
    setLoading(true);
    const nombreFinal = nombre.trim() || `Mostrador ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    const total = ticket.reduce((acc, item) => acc + item.precio, 0);

    const { error } = await supabase.from('ordenes').insert([{
      nombre_cliente: nombreFinal,
      total: total,
      detalles: ticket,
      origen: "caja_rapida",
      estado: "pendiente"
    }]);

    setLoading(false);
    if (!error) {
      setTicket([]);
      setNombre("");
      alert("¡Orden enviada! 🚀");
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-200 overflow-hidden">
      
      {/* IZQUIERDA: BOTONERA (Scrollable) */}
      <div className="md:w-2/3 p-4 grid grid-rows-[auto_1fr_1fr] gap-4 h-full overflow-y-auto pb-20">
         
         {/* 1. PRODUCTOS */}
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {productos.map(p => (
              <button key={p.nombre} onClick={() => agregarAlTicket(p)} className="bg-white border-2 border-red-500 rounded-2xl p-4 md:p-6 text-lg md:text-xl font-black text-gray-800 hover:bg-red-50 active:scale-95 shadow-md flex flex-col justify-center items-center h-24 md:h-32 transition-transform">
                <span>{p.nombre}</span>
                <span className="text-red-600 text-base md:text-lg">${p.precio}</span>
              </button>
            ))}
         </div>

         {/* 2. EXTRAS ($) */}
         <div className="bg-white rounded-2xl p-3 md:p-4 shadow-inner">
            <h3 className="font-bold text-gray-400 mb-2 text-xs md:text-sm uppercase">Agregar Extra al último plato:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
               {extras.map(e => (
                 <button key={e.nombre} onClick={() => agregarNotaUltimoItem(e.nombre, e.precio)} className="bg-green-100 text-green-800 font-bold py-3 rounded-xl border border-green-300 active:bg-green-200 text-sm md:text-base">
                   {e.nombre} (+${e.precio})
                 </button>
               ))}
            </div>
         </div>

         {/* 3. NOTAS (Gratis) */}
         <div className="bg-white rounded-2xl p-3 md:p-4 shadow-inner">
            <h3 className="font-bold text-gray-400 mb-2 text-xs md:text-sm uppercase">Notas de Cocina:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
               {gustos.map(g => (
                 <button key={g} onClick={() => agregarNotaUltimoItem(g)} className="bg-gray-100 text-gray-600 font-bold py-2 rounded-lg border border-gray-300 hover:bg-gray-200 text-xs md:text-sm">
                   {g}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* DERECHA: TICKET (Fixed) */}
      <div className="md:w-1/3 bg-white border-l shadow-2xl flex flex-col h-[40vh] md:h-full border-t md:border-t-0">
         <div className="p-3 md:p-4 bg-gray-800 text-white shrink-0">
            <label className="text-xs text-gray-400 uppercase font-bold">Cliente:</label>
            <input 
              type="text" 
              placeholder="Nombre (Opcional)" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-transparent text-xl md:text-2xl font-bold placeholder-gray-600 focus:outline-none border-b border-gray-600 pb-1 mt-1"
            />
         </div>

         <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
            {ticket.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start border-b pb-2 animate-slide-up">
                <div>
                   <p className="font-bold text-base md:text-lg text-gray-800">{item.platillo}</p>
                   {item.notas.length > 0 && <p className="text-xs text-gray-500 font-bold">{item.notas.join(", ")}</p>}
                </div>
                <div className="text-right">
                   <p className="font-bold">${item.precio}</p>
                   <button onClick={() => {
                      const nuevo = [...ticket];
                      nuevo.splice(idx, 1);
                      setTicket(nuevo);
                   }} className="text-red-500 text-xs font-bold p-1">Eliminar</button>
                </div>
              </div>
            ))}
            {ticket.length === 0 && <p className="text-center text-gray-400 mt-10">Ticket vacío...</p>}
         </div>

         <div className="p-3 md:p-4 bg-gray-50 border-t shrink-0 pb-8 md:pb-4">
            <div className="flex justify-between text-2xl md:text-3xl font-black text-gray-800 mb-2 md:mb-4">
               <span>TOTAL:</span>
               <span>${ticket.reduce((acc, item) => acc + item.precio, 0)}</span>
            </div>
            <button 
              onClick={enviarOrden}
              disabled={ticket.length === 0 || loading}
              className="w-full bg-blue-600 text-white py-4 md:py-5 rounded-xl font-bold text-xl md:text-2xl shadow-xl hover:bg-blue-700 active:scale-95 disabled:bg-gray-400 transition-all"
            >
              {loading ? "ENVIANDO..." : "COBRAR 💵"}
            </button>
         </div>
      </div>

    </div>
  );
}