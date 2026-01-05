import { Anton } from "next/font/google"; // 1. Importamos la fuente
import "./globals.css";

const anton = Anton({ 
  subsets: ["latin"], 
  weight: "400", // Anton solo tiene un peso porque es muy gruesa
  variable: "--font-anton" // Esto nos ayuda a usarla en CSS si queremos
});

export const metadata = {
  title: "Chilaquiles App",
  description: "La mejor app de comida universitaria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* 3. Agregamos la clase de la fuente al body */}
      <body className={anton.className}>{children}</body>
    </html>
  );
}