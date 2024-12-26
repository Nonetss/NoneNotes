import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";

const Filtro = ({ onApplyFilters }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const blendyRef = useRef(null);

  useEffect(() => {
    if (!blendyRef.current) {
      blendyRef.current = createBlendy();
    }
    blendyRef.current.update();

    const storedCategories = JSON.parse(
      localStorage.getItem("category") || "[]",
    );
    const storedTags = JSON.parse(localStorage.getItem("tags") || "[]");
    setCategories(storedCategories);
    setTags(storedTags);
  }, []);

  const openModal = () => {
    setIsAnimating(true);
    setIsModalOpen(true);
    blendyRef.current.toggle("filtro", () => {
      setIsAnimating(false);
    });
  };

  const closeModal = () => {
    setIsAnimating(true);
    setError(null);
    setSelectedCategory("");
    setSelectedTags([]);
    blendyRef.current.untoggle("filtro", () => {
      setIsAnimating(false);
      setIsModalOpen(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      onApplyFilters(selectedCategory, selectedTags);
      closeModal();
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
      setError(
        "Ocurrió un error al aplicar los filtros. Por favor, intenta nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagChange = (e) => {
    const value = e.target.value;
    if (value && !selectedTags.includes(value)) {
      setSelectedTags([...selectedTags, value]);
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedTags([]);
    onApplyFilters("", []); // Llamar a onApplyFilters con valores vacíos
  };

  return (
    <div className="filter-container">
      <div
        className="create-category button"
        onClick={openModal}
        data-blendy-from="filtro"
      >
        <p>Aplicar filtro</p>
      </div>

      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="filtro"
          onClick={closeModal}
        >
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar-button" onClick={closeModal}>
              &times;
            </button>
            <h2>Aplicar Filtros</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="category">Categoría:</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags:</label>
                <select
                  id="tags"
                  onChange={handleTagChange}
                  disabled={isLoading}
                >
                  <option value="">Selecciona tags</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.nombre}
                    </option>
                  ))}
                </select>

                <div className="selected-tags">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find((t) => t.id === parseInt(tagId));
                    return tag ? (
                      <span key={tag.id} className="tag">
                        {tag.nombre}
                        <button
                          type="button"
                          onClick={() => removeTag(tagId)}
                          className="remove-tag"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="button-group">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Aplicando filtros..." : "Aplicar filtros"}
                </button>
                <button
                  className="clear-filters-button"
                  onClick={handleClearFilters}
                >
                  Limpiar filtros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filtro;
