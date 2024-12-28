import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import ReactMarkdown from "react-markdown";
import MdEditor from "react-markdown-editor-lite";
import { useDrag } from "react-dnd";
import { ItemTypes } from "@/utils/dndTypes";
import api from "@/utils/api";
import "./NoteModal.css";
import "./NoteEdicion.css";
import "./NoteContenido.css";

const NoteModal = ({ id, title, date, content, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(content);
  const [error, setError] = useState(null);
  const blendyRef = useRef(null);

  useEffect(() => {
    if (!blendyRef.current) {
      blendyRef.current = createBlendy();
    }
  }, []);

  const openModal = () => {
    setIsAnimating(true);
    setIsModalOpen(true);
    blendyRef.current.toggle(`note-modal-${id}`, () => {
      setIsAnimating(false);
    });
  };

  const closeModal = () => {
    setIsAnimating(true);
    blendyRef.current.untoggle(`note-modal-${id}`, () => {
      setIsAnimating(false);
      setIsModalOpen(false);
      setIsEditing(false);
      setError(null);
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null); // Limpiar errores al cambiar modo
  };

  const handleEditorChange = ({ text }) => {
    setUpdatedContent(text);
  };

  const handleSave = async () => {
    try {
      const response = await api.put(`/notas/notas/${id}/content/`, {
        content: updatedContent,
      });
      console.log("Cambios guardados correctamente:", response.data);

      if (typeof onUpdate === "function") {
        onUpdate(updatedContent);
      } else {
        console.warn("onUpdate no es una función válida");
      }

      setIsEditing(false); // Salir del modo de edición
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      setError("No se pudieron guardar los cambios. Intenta nuevamente.");
    }
  };

  const [, drag] = useDrag({
    type: ItemTypes.NOTE,
    item: { id, type: ItemTypes.NOTE }, // Usamos `id` directamente
  });

  return (
    <div>
      <div
        className="note-summary"
        onClick={openModal}
        data-blendy-from={`note-modal-${id}`}
        ref={drag}
      >
        <h3>{title}</h3>
        <p style={{ fontStyle: "italic" }}>{date}</p>
      </div>

      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to={`note-modal-${id}`}
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
                <MdEditor
                  value={updatedContent}
                  style={{ height: "400px" }}
                  renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                  onChange={handleEditorChange}
                />
              ) : (
                <ReactMarkdown>{updatedContent}</ReactMarkdown>
              )}
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="save-button">
                    Guardar
                  </button>
                  <button onClick={handleEditToggle} className="cancel-button">
                    Cancelar
                  </button>
                </>
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
