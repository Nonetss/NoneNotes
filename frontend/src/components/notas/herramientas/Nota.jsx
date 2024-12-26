import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import api from "@/utils/api"; // Importa la utilidad personalizada
import FolderOptions from "./FolderOptions"; // Importamos el componente para opciones de folders
import "./global.css";

const NewNote = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [noteTitle, setNoteTitle] = useState(""); // Estado para el título de la nota
  const [folderId, setFolderId] = useState(""); // Estado para el folder asociado
  const [folders, setFolders] = useState([]); // Lista de folders disponibles
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const blendyRef = useRef(null);

  useEffect(() => {
    if (!blendyRef.current) {
      blendyRef.current = createBlendy();
    }

    blendyRef.current.update();
  }, []);

  useEffect(() => {
    // Cargar carpetas existentes para el selector
    const fetchFolders = async () => {
      try {
        const response = await api.get("/folders/");
        setFolders(response.data);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, []);

  const openModal = () => {
    setIsAnimating(true); // Activar la animación
    setIsModalOpen(true); // Mostrar la modal
    blendyRef.current.toggle("new-note", () => {
      setIsAnimating(false); // Finalizar la animación
    });
  };

  const closeModal = () => {
    setIsAnimating(true); // Activar la animación
    blendyRef.current.untoggle("new-note", () => {
      setIsAnimating(false); // Finalizar la animación
      setIsModalOpen(false); // Cerrar la modal
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Inicia la carga
    setError(null); // Reinicia el estado de error

    if (!noteTitle.trim()) {
      setError("El título de la nota es obligatorio.");
      setLoading(false);
      return;
    }

    if (!folderId) {
      setError("Debe seleccionar una carpeta para asociar la nota.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/notas/notas/", {
        titulo: noteTitle,
        folder_id: parseInt(folderId, 10), // Convierte el folder_id a número
      });

      console.log("Nota creada:", response);

      // Reinicia los campos del formulario
      setNoteTitle("");
      setFolderId("");

      // Cierra la modal
      closeModal();
      location.reload();
    } catch (error) {
      console.error("Error al crear la nota:", error);
      setError(error.message || "Error desconocido.");
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  return (
    <div>
      <div
        className="create-note button"
        onClick={openModal}
        data-blendy-from="new-note"
      >
        <p>Nueva Nota</p>
      </div>

      {/* Modal */}
      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="new-note"
          onClick={closeModal}
        >
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro de la modal
          >
            <h2>Crear Nueva Nota</h2>
            <button className="cerrar-button" onClick={closeModal}>
              &times;
            </button>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="noteTitle">Título de la nota:</label>
                <input
                  type="text"
                  id="noteTitle"
                  autoComplete="off"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />
                <label htmlFor="folderId">Seleccionar carpeta:</label>
                <select
                  id="folderId"
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  required
                >
                  <option value="">Seleccione una carpeta</option>
                  <FolderOptions folders={folders} />
                </select>
              </div>
              {error && <p className="error-message">{error}</p>}
              <button
                type="submit"
                className="submit-button"
                disabled={loading} // Deshabilitar mientras carga
              >
                {loading ? "Creando..." : "Crear Nota"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewNote;
