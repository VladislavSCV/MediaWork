import "./globals.css";
export const metadata = { title: "Медиафасады" };

export default function RootLayout({ children }: any) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
