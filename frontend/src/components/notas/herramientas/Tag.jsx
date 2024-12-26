import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import api from "@/utils/api";
import "./global.css";

const NewTag = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const blendyRef = useRef(null);

  useEffect(() => {
    if (!blendyRef.current) {
      blendyRef.current = createBlendy();
    }
    blendyRef.current.update();
  }, []);

  const openModal = () => {
    setIsAnimating(true);
    setIsModalOpen(true);
    blendyRef.current.toggle("tag-modal", () => {
      setIsAnimating(false);
    });
  };

  const closeModal = () => {
    setIsAnimating(true);
    setError(null);
    setTagName("");
    blendyRef.current.untoggle("tag-modal", () => {
      setIsAnimating(false);
      setIsModalOpen(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tagName.trim()) {
      setError("Por favor, ingrese el nombre del tag.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/tags/", {
        nombre: tagName, // Corregido: Usar tagName aquí
      });

      setTagName("");
      closeModal();
      // Actualizar el estado en el componente padre (ejemplo)
      if (typeof onTagCreated === "function") {
        onTagCreated(response.data);
      }
    } catch (error) {
      console.error(
        "Error al crear el tag:",
        error.response?.data || error.message,
      );
      setError(
        "Ocurrió un error al crear el tag. Por favor, intenta nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
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

      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="tag-modal"
          onClick={closeModal}
        >
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar-button" onClick={closeModal}>
              &times;
            </button>
            <h2>Crear Nuevo Tag</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="tagName">Nombre del Tag:</label>
                <input
                  type="text"
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Creando..." : "Crear Tag"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTag;
