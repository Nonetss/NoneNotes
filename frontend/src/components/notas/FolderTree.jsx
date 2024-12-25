import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import "./FolderTree.css";
import NoteModal from "./NoteModal";

const FolderTree = () => {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await api.get("/folders");
        setFolders(response.data);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    fetchFolders();
  }, []);

  return (
    <ul className="folder-tree">
      {folders.map((folder) => (
        <FolderNode key={folder.id} folder={folder} />
      ))}
    </ul>
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
          <span className="folder-icon">{isExpanded ? "▼" : "▶"}</span>
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
