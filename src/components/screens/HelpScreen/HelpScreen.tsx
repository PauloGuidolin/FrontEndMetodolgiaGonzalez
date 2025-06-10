import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import style from "./HelpScreen.module.css";
import { useState, useRef } from "react";

/**
 * Componente HelpScreen
 * Muestra una sección de preguntas frecuentes (FAQ) con funcionalidad de acordeón.
 */
export const HelpScreen = () => {
  // Estado para controlar la visibilidad de cada respuesta (si está abierta o cerrada).
  // Se inicializa con un array de 9 elementos, todos en 'false' (cerrados).
  const [isOpen, setIsOpen] = useState(Array(9).fill(false));
  // useRef para almacenar referencias a los elementos DOM de las respuestas.
  // Esto permite manipular directamente sus propiedades para las animaciones.
  const answerRefs = useRef<(HTMLDivElement | null)[]>(Array(9).fill(null));

  /**
   * Alterna la visibilidad de la respuesta correspondiente al índice dado.
   * Aplica estilos CSS para una animación de deslizamiento.
   * @param index El índice de la pregunta/respuesta a alternar.
   */
  const toggleAnswer = (index: number) => {
    // Obtiene la referencia al elemento DOM de la respuesta.
    const answerElement = answerRefs.current[index];
    if (!answerElement) return; // Si el elemento no existe, sale de la función.

    // Crea una copia del estado 'isOpen' para modificarla.
    const newIsOpen = [...isOpen];
    // Determina si la respuesta se va a abrir (true) o cerrar (false).
    const willOpen = !newIsOpen[index];
    // Actualiza el estado para el índice específico.
    newIsOpen[index] = willOpen;
    setIsOpen(newIsOpen);

    // Añade una clase CSS para indicar que la animación está en curso.
    answerElement.classList.add(style.animating);

    // Usa requestAnimationFrame para asegurar que las propiedades se apliquen
    // en el siguiente ciclo de renderizado del navegador, permitiendo la transición.
    requestAnimationFrame(() => {
      // Forzar un reflow para que el navegador "vea" el cambio de clase antes de la animación.
      void answerElement.offsetWidth;
      // Establece la altura y opacidad para iniciar la transición.
      answerElement.style.height = willOpen
        ? `${answerElement.scrollHeight}px` // Si se abre, toma la altura de su contenido.
        : "0"; // Si se cierra, la altura es 0.
      answerElement.style.opacity = willOpen ? "1" : "0";
    });

    // Remueve la clase 'animating' y restablece la altura a 'auto' después de la duración de la transición.
    // Esto asegura que el contenido pueda crecer o encoger libremente si cambian sus dimensiones internas.
    setTimeout(() => {
      answerElement.classList.remove(style.animating);
      answerElement.style.height = willOpen ? "auto" : "0";
    }, 300); // La duración debe coincidir con la transición definida en el CSS.
  };

  return (
    <div className={style.principalConteiner}>
      <Header />
      <div className={style.mainContent}>
        <div className={style.Title}>
          <h1>Aprovecha nuestras herramientas de autoservicio</h1>
          <h3>
            Tu experiencia de devolución será más fácil y rápida, y está
            disponible 24/7. Disfruta sin complicaciones.
          </h3>
        </div>
        <div className={style.conteinerForQuestions}>
          {/* Contenedor de la primera columna de preguntas */}
          <div className={style.conteinerQuestions1}>
            <div>
              <button onClick={() => toggleAnswer(0)}>
                ¿Mi compra es segura?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[0] = el;
                }}
                className={isOpen[0] ? style.open : ""}
              >
                <p>
                  Sí, utilizamos protocolos de seguridad avanzados para proteger
                  tu información de pago y personal.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(1)}>¿Hacemos envíos?</button>
              <div
                ref={(el) => {
                  answerRefs.current[1] = el;
                }}
                className={isOpen[1] ? style.open : ""}
              >
                <p>
                  Sí, realizamos envíos a toda Argentina. Consulta nuestras
                  políticas de envío para más detalles.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(2)}>
                ¿Métodos de pago?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[2] = el;
                }}
                className={isOpen[2] ? style.open : ""}
              >
                <p>
                  Aceptamos tarjetas de crédito (Visa, Mastercard, American
                  Express), débito y Mercado Pago.
                </p>
              </div>
            </div>
          </div>
          {/* Contenedor de la segunda columna de preguntas */}
          <div className={style.conteinerQuestions2}>
            <div>
              <button onClick={() => toggleAnswer(3)}>
                ¿Cuál es el tiempo de entrega?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[3] = el;
                }}
                className={isOpen[3] ? style.open : ""}
              >
                <p>
                  El tiempo de entrega es de hasta 3 días hábiles (incluido el
                  envío) según lo sea el método de envío.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(4)}>
                ¿Tienen tiendas físicas?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[4] = el;
                }}
                className={isOpen[4] ? style.open : ""}
              >
                <p>
                  Sí, podrás encontrar muchas de nuestras sucursales en todo el
                  país.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(5)}>
                ¿Tienen guía de talles?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[5] = el;
                }}
                className={isOpen[5] ? style.open : ""}
              >
                <p>
                  No, pero podemos ayudarte a encontrar la mejor opción para ti.
                  Siempre estará disponible atención al cliente.
                </p>
              </div>
            </div>
          </div>
          {/* Contenedor de la tercera columna de preguntas */}
          <div className={style.conteinerQuestions3}>
            <div>
              <button onClick={() => toggleAnswer(6)}>
                ¿Cómo puedo rastrear mi pedido?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[6] = el;
                }}
                className={isOpen[6] ? style.open : ""}
              >
                <p>
                  Puedes consultar el estado de tu pedido en cualquier momento
                  en la pestaña de pedidos.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(7)}>
                ¿Tienen tiendas físicas?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[7] = el;
                }}
                className={isOpen[7] ? style.open : ""}
              >
                <p>
                  Sí, podrás encontrar muchas de nuestras sucursales en todo el
                  país.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(8)}>
                ¿Cómo solicito una devolución?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[8] = el;
                }}
                className={isOpen[8] ? style.open : ""}
              >
                <p>
                  Para realizar una devolución, debes enviar un correo
                  electrónico a nuestro equipo de atención al cliente,
                  indicando el número de pedido y la cantidad a devolver. Y que
                  la devolución cumpla con los plazos de entrega establecidos
                  por nuestro equipo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};