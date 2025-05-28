// src/App.tsx
import { AppRouter } from "./routes/AppRouter";
import { ToastContainer } from 'react-toastify'; // Importa el componente ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importa el CSS de react-toastify

function App() {
  return (
    <>
      <AppRouter/>
      
      <ToastContainer
        position="bottom-right" // Posición de los toasts (ej. "top-right", "bottom-left")
        autoClose={3000}       // Duración en milisegundos antes de que el toast se cierre automáticamente
        hideProgressBar={false} // Ocultar la barra de progreso
        newestOnTop={false}    // Los toasts nuevos aparecen en la parte inferior
        closeOnClick         // Cerrar el toast al hacer clic
        rtl={false}          // Soporte de derecha a izquierda
        pauseOnFocusLoss     // Pausar el temporizador del toast si la ventana pierde el foco
        draggable            // Permitir arrastrar el toast
        pauseOnHover         // Pausar el temporizador del toast al pasar el ratón
      />
    </>
  )
}

export default App;