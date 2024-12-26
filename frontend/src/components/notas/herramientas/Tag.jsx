import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import "./global.css";

const NewTag = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tagName, setTagName] = useState(""); // Estado para el nombre del tag
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
    blendyRef.current.toggle("tag-modal", () => {
      setIsAnimating(false); // Finalizar la animación
    });
  };

  const closeModal = () => {
    setIsAnimating(true); // Activar la animación
    blendyRef.current.untoggle("tag-modal", () => {
      setIsAnimating(false); // Finalizar la animación
      setIsModalOpen(false); // Cerrar la modal
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Nombre del tag:", tagName);
    setTagName(""); // Reiniciar el campo de entrada
    closeModal(); // Cerrar la modal después de enviar
  };

  return (
    <div>
      <div
        className="create-tag button"
        onClick={openModal}
        data-blendy-from="tag-modal"
      >
        <p>Nuevo Tag</p>
      </div>

      {/* Modal */}
      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="tag-modal"
          onClick={closeModal}
        >
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro de la modal
          >
            <button className="cerrar-button" onClick={closeModal}>
              &times;
            </button>
            <h2>Crear Nuevo Tag</h2>
            <form onSubmit={handleSubmit}>
              <div className="new-tag-form-group">
                <label htmlFor="tagName">Nombre del Tag:</label>
                <input
                  type="text"
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Crear Tag
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTag;
