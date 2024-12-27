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
  const [categories, setCategories] = useState([]); // Lista de categorías
  const [tags, setTags] = useState([]); // Lista de tags
  const [selectedCategory, setSelectedCategory] = useState(""); // Estado para la categoría seleccionada
  const [selectedTags, setSelectedTags] = useState([]); // Estado para los tags seleccionados
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

    // Cargar categorías y tags desde localStorage
    const fetchCategoriesAndTags = () => {
      const storedCategories = JSON.parse(localStorage.getItem("category"));
      const storedTags = JSON.parse(localStorage.getItem("tags"));

      if (storedCategories) {
        setCategories(storedCategories);
      }

      if (storedTags) {
        setTags(storedTags);
      }
    };

    fetchFolders();
    fetchCategoriesAndTags();
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

  const handleTagChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedTags(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones
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

    if (selectedTags.length === 0) {
      // Verificar si no hay tags seleccionados
      setError("Debe seleccionar al menos un tag.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/notas/notas/", {
        titulo: noteTitle,
        folder_id: parseInt(folderId, 10),
        categoria_id: selectedCategory ? parseInt(selectedCategory, 10) : null, // Manejar categoría opcional
        tags_ids: selectedTags.map((tag) => parseInt(tag, 10)), // Convertir cada tag a número
      });

      console.log("Nota creada:", response);

      // Resetear campos
      setNoteTitle("");
      setFolderId("");
      setSelectedCategory("");
      setSelectedTags([]);

      closeModal();
      location.reload();
    } catch (error) {
      console.error("Error al crear la nota:", error);
      setError(error.response?.data?.detail || "Error desconocido.");
    } finally {
      setLoading(false);
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
                <label htmlFor="category">Categoría:</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>

                <label htmlFor="tags">Tags:</label>
                <select
                  id="tags"
                  multiple
                  value={selectedTags}
                  onChange={handleTagChange}
                  required
                >
                  <option value="">Seleccione tags</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.nombre}
                    </option>
                  ))}
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
