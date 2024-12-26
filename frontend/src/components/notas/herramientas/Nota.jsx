import { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import "./global.css";

const NewNote = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [noteTitle, setNoteTitle] = useState(""); // Estado para el título de la nota
  const [noteContent, setNoteContent] = useState(""); // Estado para el contenido de la nota
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Título de la nota:", noteTitle);
    console.log("Contenido de la nota:", noteContent);
    setNoteTitle(""); // Reiniciar el título
    setNoteContent(""); // Reiniciar el contenido
    closeModal(); // Cerrar la modal después de enviar
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
              <div className="new-note-form-group">
                <label htmlFor="noteTitle">Título de la nota:</label>
                <input
                  type="text"
                  id="noteTitle"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />
              </div>
              <div className="new-note-form-group">
                <label htmlFor="noteContent">Contenido de la nota:</label>
                <textarea
                  id="noteContent"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                Crear Nota
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewNote;
