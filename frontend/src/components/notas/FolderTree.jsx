import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import "./FolderTree.css";
import NoteModal from "./NoteModal";

const FolderTree = () => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        // Siempre realiza la solicitud al backend para obtener datos actualizados
        const response = await api.get("/folders");
        setFolders(response.data);

        // Sobrescribe el localStorage con los datos más recientes
        localStorage.setItem("folders", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching folders:", error);

        // Si hay un error, intenta cargar desde el localStorage
        const savedFolders = localStorage.getItem("folders");
        if (savedFolders) {
          setFolders(JSON.parse(savedFolders));
        }
      }
    };

    fetchFolders();
  }, []);

  return (
    <div className="global">
      <h1 className="titulo">Carpetas</h1>
      {folders.map((folder) => (
        <ul className="folder-tree">
          <FolderNode key={folder.id} folder={folder} />
        </ul>
      ))}
    </div>
  );
};

const FolderNode = ({ folder }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determinamos si la carpeta tiene contenido (subcarpetas o notas)
  const hasContent =
    (folder.subfolders && folder.subfolders.length > 0) ||
    (folder.notes && folder.notes.length > 0);

  const toggleExpand = () => {
    if (hasContent) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <li className="folder-node">
      {/* Encabezado de la carpeta */}
      <div className="folder-header" onClick={toggleExpand}>
        {hasContent && (
          <span className={`folder-icon ${isExpanded ? "expanded" : ""}`}>
            ➜
          </span>
        )}
        <span className="folder-name">{folder.nombre}</span>
      </div>

      {/* Mostramos el contenido solo si está expandido */}
      {hasContent && (
        <div
          className={`folder-subtree ${isExpanded ? "expanded" : "collapsed"}`}
        >
          {/* Subcarpetas (renderizado recursivo) */}
          {folder.subfolders &&
            folder.subfolders.map((subfolder) => (
              <FolderNode key={subfolder.id} folder={subfolder} />
            ))}

          {/* Notas */}
          {folder.notes &&
            folder.notes.map((note) => (
              <NoteModal
                key={note.id}
                title={note.titulo}
                date={new Date(note.fecha_creacion).toLocaleDateString(
                  "es-ES",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
                content={note.content}
              />
            ))}
        </div>
      )}
    </li>
  );
};

export default FolderTree;
