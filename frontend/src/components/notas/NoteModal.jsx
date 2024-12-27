import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import ReactMarkdown from "react-markdown";
import api from "@/utils/api"; // Asegúrate de importar la instancia de Axios
import "./NoteModal.css";
import "./NoteEdicion.css";
import "./NoteContenido.css";

const NoteModal = ({ id, title, date, content, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(content);
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
    blendyRef.current.toggle("note-modal", () => {
      setIsAnimating(false);
    });
  };

  const closeModal = () => {
    setIsAnimating(true);
    blendyRef.current.untoggle("note-modal", () => {
      setIsAnimating(false);
      setIsModalOpen(false);
      setIsEditing(false); // Salir del modo de edición al cerrar
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleContentChange = (e) => {
    setUpdatedContent(e.target.value);
  };

  const handleSave = async () => {
    try {
      await api.put(`/notas/notas/${id}/content/`, { content: updatedContent });
      onUpdate(updatedContent); // Actualiza el contenido en el padre
      setIsEditing(!isEditing); // Salir del modo de edición
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };

  return (
    <div>
      <div
        className="note-summary"
        onClick={openModal}
        data-blendy-from="note-modal"
      >
        <h3>{title}</h3>
        <p style={{ fontStyle: "italic" }}>{date}</p>
      </div>

      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="note-modal"
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              {isEditing ? (
                <textarea
                  value={updatedContent}
                  onChange={handleContentChange}
                  className="note-editor"
                />
              ) : (
                <ReactMarkdown>{updatedContent}</ReactMarkdown>
              )}
            </div>
            <div className="modal-actions">
              {isEditing ? (
                <button onClick={handleSave} className="save-button">
                  Guardar
                </button>
              ) : (
                <button onClick={handleEditToggle} className="edit-button">
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteModal;
