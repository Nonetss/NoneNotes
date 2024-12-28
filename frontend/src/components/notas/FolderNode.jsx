// FolderNode.js
import React, { useState } from "react";
import "./FolderTree.css";
import NoteModal from "./NoteModal";

const FolderNode = ({ folder }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div className="folder-header" onClick={toggleExpand}>
        {hasContent && (
          <span className={`folder-icon ${isExpanded ? "expanded" : ""}`}>
            ➜
          </span>
        )}
        <span className="folder-name">{folder.nombre}</span>
      </div>
      {hasContent && (
        <div
          className={`folder-subtree ${isExpanded ? "expanded" : "collapsed"}`}
        >
          {folder.subfolders &&
            folder.subfolders.map((subfolder) => (
              <FolderNode key={subfolder.id} folder={subfolder} />
            ))}
          {folder.notes &&
            folder.notes.map((note) => (
              <NoteModal
                key={note.id}
                id={note.id} // Aquí pasas el ID de la nota
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

export default FolderNode;
