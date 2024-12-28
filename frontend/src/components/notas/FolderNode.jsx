// FolderNode.js
import React, { useState } from "react";
import "./FolderTree.css";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "@/utils/dndTypes";
import NoteModal from "./NoteModal";

const FolderNode = ({ folder, moveFolder, moveNote }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent =
    (folder.subfolders && folder.subfolders.length > 0) ||
    (folder.notes && folder.notes.length > 0);

  const toggleExpand = () => {
    if (hasContent) {
      setIsExpanded(!isExpanded);
    }
  };

  // Drag logic
  const [, drag] = useDrag({
    type: ItemTypes.FOLDER,
    item: { id: folder.id, type: ItemTypes.FOLDER },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop logic

  const [, drop] = useDrop({
    accept: [ItemTypes.FOLDER, ItemTypes.NOTE],
    drop: (item) => {
      if (!item.handled) {
        // Prevenir duplicaciones
        item.handled = true;
        if (item.type === ItemTypes.FOLDER) {
          console.log(
            `Intentando mover carpeta: ID ${item.id} -> Target ID ${folder.id}`,
          );
          moveFolder(item.id, folder.id);
        } else if (item.type === ItemTypes.NOTE) {
          console.log(
            `Intentando mover nota: ID ${item.id} -> Target ID ${folder.id}`,
          );
          moveNote(item.id, folder.id);
        }
      }
    },
  });

  return (
    <li ref={(node) => drag(drop(node))} className="folder-node">
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
              <FolderNode
                key={subfolder.id}
                folder={subfolder}
                moveFolder={moveFolder}
                moveNote={moveNote}
              />
            ))}
          {folder.notes &&
            folder.notes.map((note) => (
              <NoteModal
                key={note.id}
                id={note.id}
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
