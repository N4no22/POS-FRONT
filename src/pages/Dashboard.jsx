import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
     
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido al Dashboard 🚀
        </h1>
        <p className="text-gray-600 mt-2">
          Acá va el contenido principal (ventas, stock, etc.)
        </p>
      </main>
    </div>
  );
}
