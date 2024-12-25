import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import ReactMarkdown from "react-markdown";
import "./NoteModal.css";
import "./NoteContenido.css";

const NoteModal = ({ title, date, content }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const blendyRef = useRef(null);

  useEffect(() => {
    if (!blendyRef.current) {
      blendyRef.current = createBlendy();
    }

    blendyRef.current.update();
  }, []);

  const openModal = () => {
    setIsAnimating(true); // Activar la animación
    setIsModalOpen(true); // Mostrar la modal
    blendyRef.current.toggle("note-modal", () => {
      setIsAnimating(false); // Finalizar la animación
    });
  };

  const closeModal = () => {
    setIsAnimating(true); // Activar la animación
    blendyRef.current.untoggle("note-modal", () => {
      setIsAnimating(false); // Finalizar la animación
      setIsModalOpen(false); // Cerrar la modal
    });
  };

  return (
    <div>
      {/* Vista inicial de la nota */}
      <div
        className="note-summary"
        onClick={openModal}
        data-blendy-from="note-modal"
      >
        <h3>{title}</h3>
        <p style={{ fontStyle: "italic" }}>{date}</p>
      </div>

      {/* Modal */}
      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="note-modal"
          onClick={closeModal}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro de la modal
          >
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <h2>{title}</h2>
            <p
              style={{
                fontStyle: "italic",
                textAlign: "center",
                color: "#3f3f3f",
              }}
            >
              {date}
            </p>
            <div className="note-content">
              {/* Renderización del contenido en formato Markdown */}
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteModal;
