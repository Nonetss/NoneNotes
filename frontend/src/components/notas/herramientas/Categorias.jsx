import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import api from "@/utils/api";
import "./global.css";

const NewCategory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para la carga
  const [error, setError] = useState(null); // Nuevo estado para errores
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
    blendyRef.current.toggle("new-category", () => {
      setIsAnimating(false);
    });
  };

  const closeModal = () => {
    setIsAnimating(true);
    setError(null); // Limpiar errores al cerrar el modal
    setCategoryName(""); // Limpiar el input al cerrar el modal
    blendyRef.current.untoggle("new-category", () => {
      setIsAnimating(false);
      setIsModalOpen(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Por favor, ingrese el nombre de la categoría."); // Usar el estado de error
      return;
    }

    setIsLoading(true); // Mostrar indicador de carga
    setError(null); // Limpiar errores previos

    try {
      const response = await api.post("/categorias/", {
        nombre: categoryName,
      });

      setCategoryName("");
      closeModal();
      // En lugar de recargar, podrías actualizar el estado de las categorías en el componente padre.
      // Ejemplo (asumiendo que tienes una función para esto):
      // onCategoryCreated(response.data);
    } catch (error) {
      console.error(
        "Error al crear la categoría:",
        error.response?.data || error.message,
      );
      setError(
        "Ocurrió un error al crear la categoría. Por favor, intenta nuevamente.",
      ); // Usar el estado de error
    } finally {
      setIsLoading(false); // Ocultar indicador de carga
    }
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

      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="new-category"
          onClick={closeModal}
        >
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar-button" onClick={closeModal}>
              &times;
            </button>
            <h2>Crear Nueva Carpeta</h2>
            {error && <div className="error-message">{error}</div>}{" "}
            {/* Mostrar mensaje de error */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="categoryName">Nombre de la carpeta:</label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  disabled={isLoading} // Deshabilitar el input durante la carga
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {" "}
                {/* Deshabilitar el botón durante la carga */}
                {isLoading ? "Creando..." : "Crear categoría"}{" "}
                {/* Mostrar mensaje de carga */}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCategory;
