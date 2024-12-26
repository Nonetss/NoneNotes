import React, { useState, useRef, useEffect } from "react";
import { createBlendy } from "blendy";
import api from "@/utils/api";
import FolderOptions from "./FolderOptions"; // Importa el nuevo componente
import "./global.css";

const NewFolder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderParent, setFolderParent] = useState("");
  const [folders, setFolders] = useState([]);
  const blendyRef = useRef(null);

  useEffect(() => {
    if (!blendyRef.current) {
      blendyRef.current = createBlendy();
    }

    blendyRef.current.update();
  }, []);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await api.get("/folders/");
        const uniqueFolders = response.data.filter(
          (folder, index, self) =>
            index === self.findIndex((f) => f.id === folder.id),
        );
        setFolders(uniqueFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, []);

  const openModal = () => {
    setIsAnimating(true);
    setIsModalOpen(true);
    blendyRef.current.toggle("new-folder", () => {
      setIsAnimating(false);
    });
  };

  const closeModal = () => {
    setIsAnimating(true);
    blendyRef.current.untoggle("new-folder", () => {
      setIsAnimating(false);
      setIsModalOpen(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName.trim()) {
      alert("Por favor, ingrese un nombre para la carpeta.");
      return;
    }

    try {
      const parentId = folderParent === "" ? null : parseInt(folderParent, 10);

      const response = await api.post("/folders/", {
        nombre: folderName,
        parent: parentId,
      });
      console.log("Carpeta creada:", response.data);

      setFolders((prevFolders) => [...prevFolders, response.data]);

      setFolderName("");
      setFolderParent("");
      closeModal();
    } catch (error) {
      console.error(
        "Error al crear la carpeta:",
        error.response?.data || error.message,
      );
      alert(
        "Ocurrió un error al crear la carpeta. Por favor, intenta nuevamente.",
      );
    }
  };

  return (
    <div>
      <div
        className="create-folder button"
        onClick={openModal}
        data-blendy-from="new-folder"
      >
        <p>Nueva carpeta</p>
      </div>

      {(isModalOpen || isAnimating) && (
        <div
          className={`modal-overlay ${isModalOpen ? "active" : ""}`}
          data-blendy-to="new-folder"
          onClick={closeModal}
        >
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
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
                  autoComplete="off"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  required
                />
                <label htmlFor="folderParent">Seleccionar carpeta padre:</label>
                <select
                  id="folderParent"
                  value={folderParent}
                  onChange={(e) => setFolderParent(e.target.value)}
                >
                  <option value="">/</option>
                  <FolderOptions folders={folders} />
                </select>
              </div>
              <button type="submit" className="submit-button">
                Crear Carpeta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewFolder;
