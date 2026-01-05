"use client";

import { useState } from 'react';

export default function Home() {

  // Ventana de Bienvenida

  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);

  // --- 1. DATOS ---
  const menu = [
    { id: 1, nombre: "Sencillos", precio: 50, descripcion: "La base clásica.", proteina: null, imagen: "https://th.bing.com/th/id/R.30dd3707abb673f9d677d8399ffd6d28?rik=xS3IFJvwRweQtw&pid=ImgRaw&r=0" },
    { id: 2, nombre: "Con Pollo", precio: 60, descripcion: "Con pechuga deshebrada.", proteina: "Pollo", imagen: "https://i.pinimg.com/originals/2c/86/37/2c863707d836553026b3ec9f8205a032.jpg" },
    { id: 3, nombre: "Con Arrachera", precio: 65, descripcion: "Con arrachera marinada.", proteina: "Arrachera", imagen: "https://izekesillatok.hu/wp-content/uploads/2025/05/Chilaquiles-con-arrachera.webp"}
  ];

  // --- 2. ESTADOS (Memoria) ---
  const [carrito, setCarrito] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [platilloSeleccionado, setPlatilloSeleccionado] = useState(null);
  
  // Estado para las opciones (CheckBoxes)
  const [extras, setExtras] = useState({
    sinCrema: false,   // "Quitar Crema"
    sinQueso: false,   // "Quitar Queso"
    conCebolla: false, // "Poner Cebolla"
    conCilantro: false, // "Poner Cilantro"
    extraPollo: false,  // "Agregar Pollo" 
    extraArrachera: false // "Agregar Arrachera" 
  });

  // --- 3. FUNCIONES LÓGICAS ---

  // Paso 1: Abrir el configurador
  function abrirModal(platillo) {
    setPlatilloSeleccionado(platillo);
    // Reseteamos las opciones para que empiecen limpias
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

  // Paso 2: Marcar/Desmarcar opciones
  function toggleExtra(nombreExtra) {
    setExtras({
      ...extras, // Copia las que ya estaban
      [nombreExtra]: !extras[nombreExtra] // Invierte la que tocaste (true <-> false)
    });
  }

  // Paso 3: Confirmar y mandar al carrito
  function confirmarPedido() {
    if (!platilloSeleccionado) return; // Seguridad

    const notas = [];
    let precioFinal = platilloSeleccionado.precio;

    //Restricciones y extras
    if (extras.sinCrema) notas.push("Sin Crema");
    if (extras.sinQueso) notas.push("Sin Queso");
    if (extras.conCebolla) notas.push("Con Cebolla");
    if (extras.conCilantro) notas.push("Con Cilantro");
    if (extras.extraPollo) { notas.push("Extra Pollo"); precioFinal += 10; };
    if (extras.extraArrachera) { notas.push("Extra Arrachera"); precioFinal += 10; };
    
    // Crear el objeto final del pedido
    const pedidoFinal = {
      ...platilloSeleccionado,
      precio: precioFinal,
      notas: notas, // Guardamos las personalizaciones
      id_unico: Date.now() // Truco pro: ID único por si pide 2 iguales con notas distintas
    };

    setCarrito([...carrito, pedidoFinal]);
    setModalAbierto(false); // Cerramos ventana
  }

  // --- VISTA 1: LA BIENVENIDA ---
  if (mostrarBienvenida) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
        
        {/* 1. EL NUEVO FONDO: Foto de Chilaquiles */}
        {/* Usamos una foto real para que se vea apetecible. */}
        <div 
            className="absolute inset-0 bg-cover bg-center z-0 opacity-60"
            style={{ 
              // Foto de ejemplo de Unsplash. ¡Tú puedes poner la tuya después!
              backgroundImage: "url('https://tse1.mm.bing.net/th/id/OIP.40TtBVP6woVbPpCMMownaQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3')",
              filter: "blur(10px)" // Desenfoque fuerte para que el texto se lea bien
            }}
        ></div>

        {/* 2. EL CONTENIDO CENTRAL */}
        <div className="relative z-10 text-center p-6 animate-fade-in-up">
          
          {/* TU LOGO LIMPIO (Sin el fondo negro) */}
          {/* Asegúrate de que el nombre del archivo sea el correcto, ej: logo.png */}
          <img 
            src="/logo.png" 
            alt="Logo Chilikante" 
            // Quitamos el 'scale' porque ya no hay que ocultar nada.
            // Usamos rounded-full para asegurar el recorte circular perfecto.
            className="w-56 h-56 mx-auto mb-8 rounded-full shadow-2xl border-4 border-white bg-white" 
          />

          <h1 className="text-5xl font-black mb-2 text-white tracking-tight drop-shadow-lg">
            CHILIKANTE
          </h1>
          <p className="text-xl mb-10 text-gray-100 font-medium tracking-widest uppercase drop-shadow-md">
            De México al paladar
          </p>
          
          <button 
            onClick={() => setMostrarBienvenida(false)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-full text-xl shadow-xl transition-transform hover:scale-105 hover:shadow-2xl"
          >
            ORDENAR AHORA
          </button>
        </div>
      </div>
    );
  }
  
// --- VISTA 2: EL MENÚ PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 para dar espacio al carrito flotante si quisieras ponerlo abajo */}
      
      {/* HEADER SIMPLIFICADO */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-800">Menú 🌶️</h1>
        <div className="bg-red-600 text-white px-4 py-1 rounded-full font-bold text-sm">
          🛒 {carrito.length}
        </div>
      </header>

      {/* GRID VISUAL */}
      <main className="p-4 grid grid-cols-1 gap-6 max-w-2xl mx-auto">
        {menu.map((platillo) => (
          <div 
            key={platillo.id} 
            onClick={() => abrirModal(platillo)}
            className="group relative h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all"
          >
            {/* Imagen de fondo */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url('${platillo.imagen}')` }}
            ></div>
            
            {/* Gradiente oscuro para que se lea el texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>

            {/* Texto encima */}
            <div className="absolute bottom-0 left-0 p-6 w-full text-white">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{platillo.nombre}</h2>
                  <p className="text-gray-300 text-sm line-clamp-2">{platillo.descripcion}</p>
                </div>
                <span className="bg-white text-black font-bold px-3 py-1 rounded-lg text-lg">
                  ${platillo.precio}
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* MODAL CON EXTRAS DE PROTEÍNA */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg p-6 animate-slide-up h-[85vh] md:h-auto overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">{platilloSeleccionado.nombre}</h3>
              <button onClick={() => setModalAbierto(false)} className="bg-gray-100 p-2 rounded-full">✕</button>
            </div>

            {/* SECCIÓN EXTRAS ($$$) */}
            <div className="mb-6">
              <p className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">¿Doble Proteína?</p>
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer ${extras.extraPollo ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={extras.extraPollo} onChange={() => toggleExtra('extraPollo')} className="w-5 h-5 accent-red-600"/>
                    <span className="font-bold text-gray-700">Extra Pollo</span>
                  </div>
                  <span className="font-bold text-red-600">+$15</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer ${extras.extraArrachera ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={extras.extraArrachera} onChange={() => toggleExtra('extraArrachera')} className="w-5 h-5 accent-red-600"/>
                    <span className="font-bold text-gray-700">Extra Arrachera</span>
                  </div>
                  <span className="font-bold text-red-600">+$20</span>
                </label>
              </div>
            </div>

            {/* SECCIÓN GUSTOS (Gratis) */}
            <div className="mb-8">
               <p className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">Personaliza (Gratis)</p>
               <div className="grid grid-cols-2 gap-3">
                 {/* Aquí puedes reutilizar los botones grandes del código anterior si te gustaron más */}
                 <button 
                    onClick={() => toggleExtra('sinCrema')}
                    className={`p-3 rounded-lg font-bold border-2 ${extras.sinCrema ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-500'}`}
                 >🚫 Sin Crema</button>
                 <button 
                    onClick={() => toggleExtra('conCebolla')}
                    className={`p-3 rounded-lg font-bold border-2 ${extras.conCebolla ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-500'}`}
                 >🧅 Con Cebolla</button>
               </div>
            </div>

            <button 
              onClick={confirmarPedido}
              className="w-full py-4 bg-red-600 text-white font-bold text-xl rounded-2xl shadow-xl hover:bg-red-700"
            >
              Agregar Orden
            </button>

          </div>
        </div>
      )}

      {/* DEBUGGING: Ver el carrito abajo */}
      <div className="mt-10 p-4 bg-gray-900 text-green-400 rounded text-xs font-mono overflow-auto">
        <p className="text-white font-bold mb-2">TICKET DE COCINA (SIMULACIÓN):</p>
        <pre>{JSON.stringify(carrito, null, 2)}</pre>
      </div>

    </div>
  );
}