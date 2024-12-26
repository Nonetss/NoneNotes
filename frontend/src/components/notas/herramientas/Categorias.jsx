import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import "./global.css";

const NewFolder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [folderName, setFolderName] = useState(""); // Estado para el nombre de la carpeta
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
    blendyRef.current.toggle("new-category", () => {
      setIsAnimating(false); // Finalizar la animación
    });
  };

  const closeModal = () => {
    setIsAnimating(true); // Activar la animación
    blendyRef.current.untoggle("new-category", () => {
      setIsAnimating(false); // Finalizar la animación
      setIsModalOpen(false); // Cerrar la modal
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Nombre de la carpeta:", folderName);
    setFolderName(""); // Reiniciar el campo de entrada
    closeModal(); // Cerrar la modal después de enviar
  };

  return (
    <div>
      <div
        className="create-category button"
        onClick={openModal}
        data-blendy-from="new-category"
      >
        <p>Nueva categoría</p>
      </div>

      {/* Modal */}
      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="new-category"
          onClick={closeModal}
        >
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro de la modal
          >
            <button className="cerrar-button" onClick={closeModal}>
              &times;
            </button>
            <h2>Crear Nueva Carpeta</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="folderName">Nombre de la carpeta:</label>
                <input
                  type="text"
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Crear categoría
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewFolder;
