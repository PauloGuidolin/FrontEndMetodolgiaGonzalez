import { Footer } from "../../ui/Footer/Footer";
import { Header } from "../../ui/Header/Header";
import style from "./HelpScreen.module.css";
import { useState, useRef } from "react"; // Importa useRef

export const HelpScreen = () => {
  const [isOpen, setIsOpen] = useState(Array(9).fill(false));
  const answerRefs = useRef<(HTMLDivElement | null)[]>(Array(9).fill(null)); // Crea refs para los divs de las respuestas

  const toggleAnswer = (index: number) => {
    const answerElement = answerRefs.current[index];
    if (!answerElement) return;

    const newIsOpen = [...isOpen];
    const willOpen = !newIsOpen[index];
    newIsOpen[index] = willOpen;
    setIsOpen(newIsOpen);

    // Añade la clase 'animating' para la transición
    answerElement.classList.add(style.animating);

    // Espera al siguiente frame para que la transición se active
    requestAnimationFrame(() => {
      void answerElement.offsetWidth;
      answerElement.style.height = willOpen
        ? `${answerElement.scrollHeight}px`
        : "0";
      answerElement.style.opacity = willOpen ? "1" : "0";
    });

    // Remueve la clase 'animating' después de la duración de la transición
    setTimeout(() => {
      answerElement.classList.remove(style.animating);
      answerElement.style.height = willOpen ? "auto" : "0"; // Restablece a 'auto' para futuras aperturas
    }, 300); // 300ms es la duración de la transición en CSS
  };

  return (
    <div className={style.principalConteiner}>
      <div>
        <Header />
      </div>
      <div className={style.mainContent}>
        <div className={style.Title}>
          <h1>Aprovecha nuestras herramientas de autoservicio</h1>
          <h3>
            Tu experiencia de devolucion sera mas facil y rapida, y esta
            disponible 24/7. Disfruta sin complicaciones
          </h3>
        </div>
        <div className={style.conteinerForQuestions}>
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
              <button onClick={() => toggleAnswer(2)}>¿Métodos de pago?</button>
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
          <div className={style.conteinerQuestions2}>
            <div>
              <button onClick={() => toggleAnswer(3)}>
                ¿Cual es el tiempo de entrega?
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
                ¿Tienen tiendas fisicas?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[4] = el;
                }}
                className={isOpen[4] ? style.open : ""}
              >
                <p>
                  Si, podras encontra muchas de nuestas sucursales en todo el
                  país.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(5)}>
                ¿Tienen guia de talles?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[5] = el;
                }}
                className={isOpen[5] ? style.open : ""}
              >
                <p>
                  No, pero podemos ayudarte a encontrar la mejor opción para ti.
                  Siempre estara disponible atencion al cliente
                </p>
              </div>
            </div>
          </div>
          <div className={style.conteinerQuestions3}>
            <div>
              <button onClick={() => toggleAnswer(6)}>
                ¿Como puedo rastrear mi pedido?
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
                ¿Tienen tiendas fisicas?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[7] = el;
                }}
                className={isOpen[7] ? style.open : ""}
              >
                <p>
                  Si, podras encontra muchas de nuestas sucursales en todo el
                  país.
                </p>
              </div>
            </div>
            <div>
              <button onClick={() => toggleAnswer(8)}>
                ¿Como solicito una devolución?
              </button>
              <div
                ref={(el) => {
                  answerRefs.current[8] = el;
                }}
                className={isOpen[8] ? style.open : ""}
              >
                <p>
                  Para realizar una devolución, debes enviar un correo
                  electrónico a nuestro equipo de atención al cliente, indicando
                  el número de pedido y la cantidad a devolver. y que la
                  devolución cumpla con los plazos de entrega establecidos por
                  nuestro equipo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};
