import "./globals.css";

export const metadata = {
  title: "Chilaquiles App",
  description: "La mejor app de comida universitaria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}