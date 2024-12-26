// src/components/Calendario.jsx
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // Componente principal
import dayGridPlugin from "@fullcalendar/daygrid"; // Vistas de mes y semana sin horario
import timeGridPlugin from "@fullcalendar/timegrid"; // Vistas de semana y día con horario
import listPlugin from "@fullcalendar/list"; // Vistas de lista
import interactionPlugin from "@fullcalendar/interaction"; // Para interacciones
import multiMonthPlugin from "@fullcalendar/multimonth"; // Vista multi-mes

import "./Calendar.css";

const Calendario = () => {
  const [eventos, setEventos] = useState([
    {
      id: "1",
      title: "Evento de Ejemplo",
      start: "2024-12-25T10:00:00",
      end: "2024-12-25T12:00:00",
      allDay: false,
    },
  ]);

  // Manejar clic en una fecha para agregar un evento
  const handleDateClick = (arg) => {
    const title = prompt("Ingrese el título del evento:");
    if (title) {
      const nuevoEvento = {
        id: String(eventos.length + 1),
        title,
        start: arg.date,
        allDay: arg.allDay,
      };
      setEventos([...eventos, nuevoEvento]);
    }
  };

  // Manejar clic en un evento para eliminarlo
  const handleEventClick = (clickInfo) => {
    if (
      window.confirm(`¿Deseas eliminar el evento '${clickInfo.event.title}'?`)
    ) {
      setEventos(eventos.filter((evento) => evento.id !== clickInfo.event.id));
    }
  };

  return (
    <div className="container mt-5">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          interactionPlugin,
          multiMonthPlugin,
        ]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right:
            "dayGridMonth,timeGridWeek,timeGridDay,listMonth,multiMonthYear",
        }}
        views={{
          dayGridMonth: { buttonText: "Mes" },
          timeGridWeek: { buttonText: "Semana" },
          timeGridDay: { buttonText: "Día" },
          listMonth: { buttonText: "Lista Mes" },
          multiMonthYear: {
            type: "multiMonthYear",
            multiMonthMaxColumns: 3, // Mostrar una columna de meses
            buttonText: "Multi-Mes",
          },
        }}
        locale="es" // Cambiar a español
        events={eventos}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        height="auto"
      />
    </div>
  );
};

export default Calendario;
