"use client";
import { supabase } from "./lib/supabase"; 
import { useState, useEffect } from 'react';
import Image from "next/image";

export default function Home() {

  // --- 1. CONTROL DE VISTAS (El flujo de la app) ---
  // Vistas posibles: 'hero' -> 'registro' -> 'menu' -> 'tracking'
  const [vistaActual, setVistaActual] = useState('hero');

  // --- 2. DATOS DEL MENÚ ---
  const menu = [
    { id: 1, nombre: "Sencillos", precio: 50, descripcion: "Acompañados con Frijol y Rebanadas de Pan.", proteina: null, imagen: "https://th.bing.com/th/id/R.30dd3707abb673f9d677d8399ffd6d28?rik=xS3IFJvwRweQtw&pid=ImgRaw&r=0" },
    { id: 2, nombre: "Con Pollo", precio: 60, descripcion: "La Base + Pechuga deshebrada.", proteina: "Pollo", imagen: "https://i.pinimg.com/originals/2c/86/37/2c863707d836553026b3ec9f8205a032.jpg" },
    { id: 3, nombre: "Con Arrachera", precio: 65, descripcion: "La Base + Arrachera marinada.", proteina: "Arrachera", imagen: "https://izekesillatok.hu/wp-content/uploads/2025/05/Chilaquiles-con-arrachera.webp"}
  ];

  // --- 3. ESTADOS (Memoria) ---
  const [nombreCliente, setNombreCliente] = useState("");
  const [carrito, setCarrito] = useState([]); // Ahora guardamos varios items aquí
  const [modalAbierto, setModalAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false); // Para ver el resumen
  const [platilloSeleccionado, setPlatilloSeleccionado] = useState(null);
  const [pedidoActivo, setPedidoActivo] = useState(null); // Guarda el ID y Estado de la orden actual
  const [loading, setLoading] = useState(false);

  // Estado para las opciones (CheckBoxes)
  const [extras, setExtras] = useState({
    sinCrema: false, 
    sinQueso: false, 
    conCebolla: false, 
    conCilantro: false,
    extraPollo: false, 
    extraArrachera: false
  });

  // --- 4. LÓGICA DE TIEMPO REAL (NOTIFICACIONES) ---
  useEffect(() => {
    let canal;
    if (vistaActual === 'tracking' && pedidoActivo) {
      // Nos suscribimos a cambios en ESTA orden específica
      canal = supabase
        .channel('orden-status')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ordenes',
            filter: `id=eq.${pedidoActivo.id}`
          },
          (payload) => {
            console.log("Cambio detectado!", payload);
            setPedidoActivo(payload.new); // Actualizamos el estado en pantalla
            if (payload.new.estado === 'listo') {
              // Opcional: Sonar una campanita o vibrar
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
          }
        )
        .subscribe();
    }
    return () => {
      if (canal) supabase.removeChannel(canal);
    }
  }, [vistaActual, pedidoActivo]);


  // --- 5. FUNCIONES AUXILIARES ---

  function abrirModal(platillo) {
    setPlatilloSeleccionado(platillo);
    setExtras({
      sinCrema: false, 
      sinQueso: false, 
      conCebolla: false,
      conCilantro: false, 
      extraArrachera: false, 
      extraPollo: false
    });
    setModalAbierto(true);
  }

  function toggleExtra(nombreExtra) {
    setExtras({ ...extras, [nombreExtra]: !extras[nombreExtra] });
  }

  // Agregar al carrito (LOCAL)
  function agregarAlCarrito() {
    let precioCalculado = platilloSeleccionado.precio;
    const notas = [];
    
    if (extras.sinCrema) notas.push("Sin Crema");
    if (extras.sinQueso) notas.push("Sin Queso");
    if (extras.conCebolla) notas.push("Con Cebolla");
    if (extras.conCilantro) notas.push("Con Cilantro");
    if (extras.extraPollo) { notas.push("Extra Pollo"); precioCalculado += 10; }
    if (extras.extraArrachera) { notas.push("Extra Arrachera"); precioCalculado += 15; }

    const itemPedido = {
      id_temp: Date.now(), // ID temporal para borrarlo del carrito si quiere
      platillo: platilloSeleccionado.nombre,
      precio: precioCalculado,
      notas: notas,
      cantidad: 1
    };

    setCarrito([...carrito, itemPedido]);
    setModalAbierto(false);
  }

  // Eliminar del carrito
  function borrarDelCarrito(id_temp) {
    setCarrito(carrito.filter(item => item.id_temp !== id_temp));
  }

  // ENVIAR TODO A SUPABASE
  async function enviarPedidoFinal() {
    if (carrito.length === 0) return;
    setLoading(true);

    const totalPagar = carrito.reduce((acc, item) => acc + item.precio, 0);

    const { data, error } = await supabase
      .from('ordenes')
      .insert([
        { 
          nombre_cliente: nombreCliente, 
          total: totalPagar,
          detalles: carrito, // Guardamos TODO el array de platillos
          origen: "salon",
          estado: "pendiente"
        },
      ])
      .select();

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setPedidoActivo(data[0]); // Guardamos la orden creada
      setCarrito([]); // Limpiamos carrito
      setVistaActual('tracking'); // Cambiamos a pantalla de espera
    }
  }

  // --- RENDERIZADO DE VISTAS ---

  // 1. VISTA HERO
  if (vistaActual === 'hero') {
    return (
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('https://tse1.mm.bing.net/th/id/OIP.40TtBVP6woVbPpCMMownaQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3')", filter: "blur(10px)" }}></div>
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-2">
          <div className="animacion-zoom w-full max-w-[600px]">
             <Image src="/logo2.0.png" alt="Logo" width={800} height={800} className="h-auto w-full object-contain mb-2" priority />
          </div>
          <button onClick={() => setVistaActual('registro')}
            className="animacion-boton mt-8 rounded-full bg-red-600 px-8 py-3 text-2xl font-bold text-white shadow-xl hover:scale-105">
            ORDENAR AHORA
          </button>
        </div>
      </div>
    );
  }

  // 2. VISTA REGISTRO (Pedir Nombre)
  if (vistaActual === 'registro') {

    // Función para validar que solo sean letras y espacios
    const manejarCambioNombre = (e) => {
      const valor = e.target.value;
      // Esta Regex permite: Letras (a-z), Mayúsculas (A-Z), Acentos (áéí...), Ñ y Espacios (\s)
      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;

      // Solo actualizamos el estado SI cumple con la regla
      if (soloLetras.test(valor)) {
        setNombreCliente(valor);
      }
    };

    return (
      
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden bg-black">
        {/* FONDO */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('https://tse1.mm.bing.net/th/id/OIP.40TtBVP6woVbPpCMMownaQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3')", filter: "blur(10px)" }}>
        </div>
        
        {/* CONTENIDO */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-md">     
        <h2 className="text-3xl font-bold mb-2 text-center shadow-black drop-shadow-lg">¡Bienvenido! 👋</h2>
        <p className="mb-8 text-gray-100 font-medium text-center drop-shadow-md">¿A nombre de quién sale el pedido?</p>
        
        <input 
          type="text" 
          placeholder="Escribe tu nombre..."
          value={nombreCliente}
          onChange={manejarCambioNombre}
          className="w-full p-4 rounded-xl text-white text-xl font-bold text-center mb-6 shadow-xl"
        />
        <button 
          disabled={nombreCliente.trim().length < 3 }
          onClick={() => setVistaActual('menu')}
          className="w-full bg-red-600 py-4 rounded-xl font-bold text-xl text-white shadow-xl transition-transform hover:scale-105 disabled:opacity-50 disabled:bg-gray-600"
        >
          VER EL MENÚ ➔
        </button>
        {/* Mensajes de error dinámicos */}
            <div className="h-8"> {/* Espacio reservado para que no brinque el diseño */}
              {nombreCliente.length > 0 && nombreCliente.trim().length < 3 && (
                <p className="text-sm text-red-300 font-bold animate-pulse text-center">
                  El nombre es muy corto...
                </p>
              )}
            </div>
        </div>   
      </div>
    );
  }

  // 4. VISTA TRACKING (La notificación)
  if (vistaActual === 'tracking' && pedidoActivo) {
    const esListo = pedidoActivo.estado === 'listo';
    
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-1000 ${esListo ? 'bg-green-600' : 'bg-neutral-900'} text-white text-center`}>
        
        {/* Animación de estado */}
        <div className="mb-8 text-8xl">
           {esListo ? '✅' : '👨‍🍳'}
        </div>

        <h1 className="text-4xl font-black mb-2">
          {esListo ? '¡ESTÁ LISTO!' : 'PREPARANDO...'}
        </h1>
        
        <p className="text-xl opacity-90 mb-8">
          {esListo 
            ? `¡Corre por tus chilaquiles ${nombreCliente}! ID: #${pedidoActivo.id}` 
            : `Relájate ${nombreCliente}, estamos cocinando tu orden #${pedidoActivo.id}`}
        </p>

        {!esListo && (
          <div className="animate-pulse text-sm text-gray-400 mt-10">
            Esta pantalla cambiará a verde cuando estén listos.
          </div>
        )}

        {esListo && (
          <button 
             onClick={() => {
               setCarrito([]);
               setVistaActual('hero');
             }}
             className="mt-8 bg-white text-green-700 px-8 py-3 rounded-full font-bold shadow-lg"
          >
            Hacer otro pedido
          </button>
        )}
      </div>
    );
  }

  // 3. VISTA MENÚ (Por defecto si no es ninguna de las anteriores)
  return (
    <div className="min-h-screen bg-gray-50 pb-24"> 
      
      {/* HEADER */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-gray-800">Hola, {nombreCliente} 🌶️</h1>
          <p className="text-xs text-gray-500">Arma tu pedido</p>
        </div>
        {carrito.length > 0 && (
          <button onClick={() => setCarritoAbierto(true)} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-bounce">
            🛒 Ver Carrito ({carrito.length})
          </button>
        )}
      </header>

      {/* GRID PRODUCTOS */}
      <main className="p-4 grid grid-cols-1 gap-6 max-w-2xl mx-auto">
        {menu.map((platillo) => (
          <div key={platillo.id} onClick={() => abrirModal(platillo)}
            className="group relative h-48 rounded-2xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${platillo.imagen}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 w-full text-white flex justify-between items-end">
               <div>
                 <h2 className="text-2xl font-bold">{platillo.nombre}</h2>
                 <p className="text-gray-300 text-xs">{platillo.descripcion}</p>
               </div>
               <span className="bg-white text-black font-bold px-2 py-1 rounded-lg">${platillo.precio}</span>
            </div>
          </div>
        ))}
      </main>

      {/* MODAL AGREGAR AL CARRITO */}
      {modalAbierto && platilloSeleccionado && (
        <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 md:items-center">
          <div className="bg-white w-full max-w-lg p-6 rounded-t-3xl md:rounded-3xl animate-slide-up h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black text-gray-800">{platilloSeleccionado.nombre}</h3>
              <button onClick={() => setModalAbierto(false)} className="text-2xl text-red-400 font-bold">✕</button>
            </div>
            
            {/* SECCIÓN EXTRAS ($$$) */}
            <div className="mb-6">
              <p className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wider">¿Doble Proteína?</p>
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${extras.extraPollo ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-red-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={extras.extraPollo} onChange={() => toggleExtra('extraPollo')} className="w-5 h-5 accent-green-400"/>
                    <span className={`font-bold ${extras.extraPollo ? 'text-green-600' : 'text-gray-600'}`}>
                      Extra Pollo
                    </span>
                  </div>
                  <span className={`font-bold ${extras.extraPollo ? 'text-green-600' : 'text-gray-600'}`}>
                    +$10
                  </span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${extras.extraArrachera ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-red-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={extras.extraArrachera} onChange={() => toggleExtra('extraArrachera')} className="w-5 h-5 accent-green-400"/>
                    <span className={`font-bold ${extras.extraArrachera ? 'text-green-600' : 'text-gray-600'}`}>
                      Extra Arrachera
                    </span>
                  </div>
                  <span className={`font-bold ${extras.extraArrachera ? 'text-green-600' : 'text-gray-600'}`}>
                    +$15
                  </span>
                </label>
              </div>
            </div>

            {/* SECCIÓN GUSTOS (Gratis) */}
            <div className="mb-8">
               <p className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wider">Personaliza (Gratis)</p>
               <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => toggleExtra('sinQueso')}
                   className={`p-3 rounded-lg font-bold border-2 transition-all ${extras.sinQueso ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600'}`}
                 >🚫 Sin Queso</button>
                 <button 
                   onClick={() => toggleExtra('sinCrema')}
                   className={`p-3 rounded-lg font-bold border-2 transition-all ${extras.sinCrema ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600'}`}
                 >🚫 Sin Crema</button>
                 <button 
                   onClick={() => toggleExtra('conCebolla')}
                   className={`p-3 rounded-lg font-bold border-2 transition-all ${extras.conCebolla ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-600'}`}
                 >🧅 Con Cebolla</button>
                  <button
                    onClick={() => toggleExtra('conCilantro')}
                    className={`p-3 rounded-lg font-bold border-2 transition-all ${extras.conCilantro ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-600'}`}
                  >🌿 Con Cilantro</button>
               </div>
            </div>

            <button onClick={agregarAlCarrito} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg">
              AGREGAR A LA ORDEN
            </button>
          </div>
        </div>
      )}

      {/* MODAL RESUMEN CARRITO (CHECKOUT) */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 h-[80vh] flex flex-col">
            <h2 className="text-2xl text-gray-800 mb-4">Tu Pedido 📋</h2>
            
            <div className="flex-1 overflow-y-auto space-y-4">
              {carrito.map((item) => (
                <div key={item.id_temp} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="font-bold text-gray-800">{item.platillo}</p>
                    <p className="text-xs text-gray-600">{item.notas.join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-600">${item.precio}</p>
                    <button onClick={() => borrarDelCarrito(item.id_temp)} className="text-red-500 text-xs font-bold mt-1">Eliminar</button>
                  </div>
                </div>
              ))}
              {carrito.length === 0 && <p className="text-center text-gray-600">Tu carrito está vacío ☹️</p>}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-xl text-gray-800 mb-4">
                <span>TOTAL:</span>
                <span>${carrito.reduce((acc, item) => acc + item.precio, 0)}</span>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setCarritoAbierto(false)} className="flex-1 bg-gray-600 py-3 rounded-xl font-bold text-white shadow-xl">Seguir Pidiendo</button>
                 <button onClick={enviarPedidoFinal} disabled={loading || carrito.length === 0} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-xl">
                   {loading ? "Enviando..." : "CONFIRMAR ✅"}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}