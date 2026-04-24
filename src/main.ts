import "./style.css";

type MatrizAsientos = number[][];

type PosicionAsiento = {
  fila: number;
  columna: number;
};

type ResultadoBusquedaContiguos =
  | {
      encontrados: true;
      asientos: [PosicionAsiento, PosicionAsiento];
      mensaje: string;
    }
  | {
      encontrados: false;
      mensaje: string;
    };

const FILAS_SALA = 8;
const ASIENTOS_POR_FILA = 10;

// Crea la matriz base de la sala con todos los asientos disponibles.
// 0 = disponible, 1 = ocupado
export function inicializarMatrizAsientos(
  filas = FILAS_SALA,
  columnas = ASIENTOS_POR_FILA,
): MatrizAsientos {
  const sala: MatrizAsientos = [];

  for (let indiceFila = 0; indiceFila < filas; indiceFila += 1) {
    const fila: number[] = [];

    for (let indiceColumna = 0; indiceColumna < columnas; indiceColumna += 1) {
      fila.push(0);
    }

    sala.push(fila);
  }

  return sala;
}

// Muestra la sala en consola con coordenadas de filas/columnas y estado L/X.
export function mostrarEstadoSala(sala: MatrizAsientos): void {
  if (sala.length === 0) {
    console.log("La sala no tiene asientos configurados.");
    return;
  }

  const columnas = sala[0].length;
  const columnasTexto: string[] = [];

  for (let indiceColumna = 0; indiceColumna < columnas; indiceColumna += 1) {
    columnasTexto.push(String(indiceColumna + 1).padStart(2, " "));
  }

  const encabezadoColumnas = columnasTexto.join(" ");

  console.log("    " + encabezadoColumnas);

  sala.forEach((fila, indiceFila) => {
    const numeroFila = String(indiceFila + 1).padStart(2, " ");
    const estadoFila = fila
      .map((asiento) => (asiento === 1 ? " X" : " L"))
      .join(" ");

    console.log(`${numeroFila} |${estadoFila}`);
  });
}

// Intenta reservar un asiento especifico y devuelve un mensaje claro del resultado.
export function reservarAsiento(
  sala: MatrizAsientos,
  fila: number,
  columna: number,
): string {
  const indiceFila = fila - 1;
  const indiceColumna = columna - 1;

  const filaValida = indiceFila >= 0 && indiceFila < sala.length;
  const columnaValida =
    sala[indiceFila] !== undefined &&
    indiceColumna >= 0 &&
    indiceColumna < sala[indiceFila].length;

  if (!filaValida || !columnaValida) {
    return `No se pudo reservar: la posicion fila ${fila}, columna ${columna} no existe.`;
  }

  if (sala[indiceFila][indiceColumna] === 1) {
    return `No se pudo reservar: el asiento fila ${fila}, columna ${columna} ya esta ocupado.`;
  }

  sala[indiceFila][indiceColumna] = 1;
  return `Reserva exitosa: asiento fila ${fila}, columna ${columna} reservado correctamente.`;
}

// Cuenta cuantos asientos estan ocupados y disponibles en toda la sala.
export function contarAsientos(sala: MatrizAsientos): {
  ocupados: number;
  disponibles: number;
} {
  const totalAsientos = sala.reduce((acumulado, fila) => acumulado + fila.length, 0);
  const ocupados = sala.reduce(
    (acumulado, fila) => acumulado + fila.filter((asiento) => asiento === 1).length,
    0,
  );

  return {
    ocupados,
    disponibles: totalAsientos - ocupados,
  };
}

// Busca el primer par de asientos libres contiguos en horizontal dentro de una fila.
export function buscarDosAsientosContiguos(
  sala: MatrizAsientos,
): ResultadoBusquedaContiguos {
  for (let indiceFila = 0; indiceFila < sala.length; indiceFila += 1) {
    const fila = sala[indiceFila];

    for (let indiceColumna = 0; indiceColumna < fila.length - 1; indiceColumna += 1) {
      const asientoActual = fila[indiceColumna];
      const asientoSiguiente = fila[indiceColumna + 1];

      if (asientoActual === 0 && asientoSiguiente === 0) {
        const primerAsiento = { fila: indiceFila + 1, columna: indiceColumna + 1 };
        const segundoAsiento = { fila: indiceFila + 1, columna: indiceColumna + 2 };

        return {
          encontrados: true,
          asientos: [primerAsiento, segundoAsiento],
          mensaje: `Se encontraron dos asientos contiguos en la fila ${primerAsiento.fila}, columnas ${primerAsiento.columna} y ${segundoAsiento.columna}.`,
        };
      }
    }
  }

  return {
    encontrados: false,
    mensaje:
      "No hay dos asientos libres contiguos horizontalmente en este momento.",
  };
}

function construirInterfaz(): string {
  return `
    <section class="cinema-app">
      <header class="cinema-header">
        <p class="cinema-kicker">Cinema Manager</p>
        <h1 class="cinema-title">
          Gestor Visual De Asientos
        </h1>
        <p class="cinema-description">
          Haz clic en un asiento libre para reservarlo. Si intentas reservar uno ocupado,
          el sistema te mostrara un mensaje claro.
        </p>
      </header>

      <section class="info-grid">
        <article class="info-card">
          <p class="info-label">Estado</p>
          <p id="mensaje-operacion" class="status-message"></p>
        </article>
        <article class="info-card">
          <p class="info-label">Resumen</p>
          <p id="resumen-asientos" class="status-message status-message--neutral"></p>
        </article>
        <article class="info-card">
          <p class="info-label">Sugerencia</p>
          <p id="mensaje-contiguos" class="status-message status-message--neutral"></p>
        </article>
      </section>

      <section class="sala-panel">
        <div class="pantalla-label">
          Pantalla
        </div>

        <div class="leyenda-barra">
          <span class="leyenda-item"><span class="leyenda-color leyenda-color--libre"></span>Libre</span>
          <span class="leyenda-item"><span class="leyenda-color leyenda-color--seleccionado"></span>Seleccionado</span>
          <span class="leyenda-item"><span class="leyenda-color leyenda-color--ocupado"></span>Ocupado</span>
          <span class="leyenda-item"><span class="leyenda-color leyenda-color--sugerido"></span>Par sugerido</span>
          <button id="confirmar-reserva" class="btn btn--confirmar">
            Confirmar asientos seleccionados
          </button>
          <button id="reiniciar-sala" class="btn btn--reiniciar">
            Reiniciar sala
          </button>
        </div>

        <div id="mapa-asientos" class="seat-grid"></div>
      </section>
    </section>
  `;
}

function iniciarApp(): void {
  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("No se encontro el contenedor principal de la aplicacion.");
  }

  app.innerHTML = construirInterfaz();

  const mapaAsientos = app.querySelector<HTMLElement>("#mapa-asientos");
  const mensajeOperacion = app.querySelector<HTMLElement>("#mensaje-operacion");
  const mensajeContiguos = app.querySelector<HTMLElement>("#mensaje-contiguos");
  const resumenAsientos = app.querySelector<HTMLElement>("#resumen-asientos");
  const botonConfirmar = app.querySelector<HTMLButtonElement>("#confirmar-reserva");
  const botonReiniciar = app.querySelector<HTMLButtonElement>("#reiniciar-sala");

  if (
    !mapaAsientos ||
    !mensajeOperacion ||
    !mensajeContiguos ||
    !resumenAsientos ||
    !botonConfirmar ||
    !botonReiniciar
  ) {
    throw new Error("No se pudieron inicializar todos los elementos de la interfaz.");
  }

  let sala = inicializarMatrizAsientos();
  let ultimoMensaje = "Selecciona un asiento para comenzar una reserva.";
  const seleccionados = new Set<string>();

  const claveAsiento = (fila: number, columna: number): string => `${fila}-${columna}`;

  const renderizar = () => {
    const contiguos = buscarDosAsientosContiguos(sala);
    const resumen = contarAsientos(sala);

    mensajeOperacion.textContent = ultimoMensaje;
    mensajeOperacion.className = ultimoMensaje.startsWith("Reserva")
      ? "status-message status-message--success"
      : "status-message status-message--warning";

    mensajeContiguos.textContent = contiguos.mensaje;
    mensajeContiguos.className = contiguos.encontrados
      ? "status-message status-message--hint"
      : "status-message status-message--neutral";

    resumenAsientos.textContent = `Ocupados: ${resumen.ocupados} | Disponibles: ${resumen.disponibles}`;

    botonConfirmar.disabled = seleccionados.size === 0;

    const asientosSugeridos = new Set<string>();
    if (contiguos.encontrados) {
      const [primero, segundo] = contiguos.asientos;
      asientosSugeridos.add(`${primero.fila}-${primero.columna}`);
      asientosSugeridos.add(`${segundo.fila}-${segundo.columna}`);
    }

    mapaAsientos.innerHTML = "";

    sala.forEach((fila, indiceFila) => {
      fila.forEach((asiento, indiceColumna) => {
        const filaHumana = indiceFila + 1;
        const columnaHumana = indiceColumna + 1;
        const clave = claveAsiento(filaHumana, columnaHumana);
        const ocupado = asiento === 1;
        const seleccionado = seleccionados.has(clave) && !ocupado;
        const sugerido = asientosSugeridos.has(clave) && !ocupado;
        const estiloBase = "seat-button";
        const estiloEstado = seleccionado
          ? "seat-button--seleccionado"
          : ocupado
          ? "seat-button--ocupado"
          : "seat-button--libre";
        const estiloSugerido = sugerido
          ? " seat-button--sugerido"
          : "";

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = `${estiloBase} ${estiloEstado}${estiloSugerido}`;
        boton.disabled = ocupado;
        boton.dataset.fila = String(filaHumana);
        boton.dataset.columna = String(columnaHumana);
        boton.innerHTML = `
          <span class="seat-icon-wrap">
            <svg viewBox="0 0 24 24" class="seat-icon" fill="currentColor" aria-hidden="true">
              <path d="M7 3a2 2 0 0 0-2 2v6h14V5a2 2 0 0 0-2-2H7Zm-4 9h18a1 1 0 0 1 1 1v4h-2v4h-3v-4H7v4H4v-4H2v-4a1 1 0 0 1 1-1Z" />
            </svg>
          </span>
          <span class="seat-label">F${filaHumana}</span>
          <span class="seat-label">A${columnaHumana}</span>
        `;

        boton.addEventListener("click", () => {
          const claveSeleccion = claveAsiento(filaHumana, columnaHumana);

          if (seleccionados.has(claveSeleccion)) {
            seleccionados.delete(claveSeleccion);
            ultimoMensaje = `Asiento fila ${filaHumana}, columna ${columnaHumana} removido de la seleccion.`;
          } else {
            seleccionados.add(claveSeleccion);
            ultimoMensaje = `Asiento fila ${filaHumana}, columna ${columnaHumana} agregado a la seleccion.`;
          }

          renderizar();
        });

        mapaAsientos.appendChild(boton);
      });
    });
  };

  botonConfirmar.addEventListener("click", () => {
    if (seleccionados.size === 0) {
      ultimoMensaje = "Selecciona al menos 1 asiento antes de confirmar.";
      renderizar();
      return;
    }

    let reservados = 0;
    const totalSeleccionados = seleccionados.size;

    for (const clave of seleccionados) {
      const partes = clave.split("-");
      const fila = Number(partes[0]);
      const columna = Number(partes[1]);
      const mensajeReserva = reservarAsiento(sala, fila, columna);

      if (mensajeReserva.startsWith("Reserva exitosa")) {
        reservados += 1;
      }
    }

    seleccionados.clear();

    if (reservados === totalSeleccionados) {
      ultimoMensaje = `Reserva confirmada: se reservaron correctamente ${reservados} asiento(s).`;
    } else {
      ultimoMensaje = `Reserva parcial: ${reservados} de ${totalSeleccionados} asiento(s) fueron reservados.`;
    }

    renderizar();
  });

  botonReiniciar.addEventListener("click", () => {
    sala = inicializarMatrizAsientos();
    seleccionados.clear();
    ultimoMensaje = "La sala se reinicio correctamente. Todos los asientos estan libres.";
    renderizar();
  });

  renderizar();
}

if (typeof document !== "undefined") {
  iniciarApp();
}
