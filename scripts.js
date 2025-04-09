document.addEventListener('DOMContentLoaded', function () {
    let fecha = new Date(); // Fecha actual
    const mesTexto = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const diasSemana = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];

    // Días festivos por mes (Ejemplo para Colombia, ajustar según necesidad)
    const diasFestivos = {
        0: [1, 6],      // Enero: Año Nuevo, Reyes Magos (puede variar, Lunes siguiente al 6)
        1: [],          // Febrero
        2: [25],        // Marzo: San José (puede variar, Lunes siguiente al 19)
        3: [17, 18],    // Abril: Jueves Santo, Viernes Santo (Varía cada año - Ejemplo 2025) - ESTE ES EL MES '3' INTERNAMENTE
        4: [1, 19],     // Mayo: Día del Trabajo, Ascensión del Señor (Varía, Lunes siguiente)
        5: [9, 16],     // Junio: Corpus Christi, Sagrado Corazón (Varían, Lunes siguientes)
        6: [1, 20],     // Julio: San Pedro y San Pablo (Varía, Lunes siguiente), Independencia
        7: [7, 18],     // Agosto: Batalla de Boyacá, Asunción de la Virgen (Varía, Lunes siguiente)
        8: [],          // Septiembre
        9: [13],        // Octubre: Día de la Raza (Varía, Lunes siguiente)
       10: [3, 17],     // Noviembre: Todos los Santos, Independencia Cartagena (Varían, Lunes siguientes)
       11: [8, 25]      // Diciembre: Inmaculada Concepción, Navidad
    };

    // --- Selección de Elementos del DOM ---
    const mesElemento = document.getElementById('mes');
    const diasElemento = document.getElementById('dias');
    const modal = document.getElementById('modal');
    const modalFecha = document.getElementById('modal-fecha');
    const modalInput = document.getElementById('modal-input');
    const modalGuardar = document.getElementById('modal-guardar');
    const modalCerrar = document.getElementById('modal-cerrar');
    const recordatoriosElemento = document.getElementById('recordatorios');
    const tablaRecordatorios = document.getElementById('tabla-recordatorios');
    const confirmModal = document.getElementById('confirmModal');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const modalEditar = document.getElementById('modalEditar');
    const inputDetalle = document.getElementById('inputDetalle');
    const confirmEdit = document.getElementById('confirmEdit');
    const cancelEdit = document.getElementById('cancelEdit');
    const botonExportarJson = document.getElementById('exportar-json'); // Botón de exportar
    const botonExportarApi = document.getElementById('exportar-api-btn');
    const apiExportAllResult = document.getElementById('apiExportAllResult');

    // *** NUEVOS ELEMENTOS PARA EL MODAL API ***
    const apiModal = document.getElementById('apiModal');
    const apiModalCerrar = document.getElementById('apiModalCerrar');
    const botonExportarLocalJson = document.getElementById('exportar-local-json-btn'); // Botón dentro del modal API

    // GET ALL
    const apiGetAllBtn = document.getElementById('apiGetAllBtn');
    const apiGetAllResult = document.getElementById('apiGetAllResult');
    // CREATE
    const apiCreateDateInput = document.getElementById('apiCreateDateInput');
    const apiCreateActivitiesInput = document.getElementById('apiCreateActivitiesInput');
    const apiCreateBtn = document.getElementById('apiCreateBtn');
    const apiCreateResult = document.getElementById('apiCreateResult');
    // GET BY ID
    const apiGetIdInput = document.getElementById('apiGetIdInput');
    const apiGetByIdBtn = document.getElementById('apiGetByIdBtn');
    const apiGetByIdResult = document.getElementById('apiGetByIdResult');
    // UPDATE
    const apiUpdateIdInput = document.getElementById('apiUpdateIdInput');
    const apiUpdateDateInput = document.getElementById('apiUpdateDateInput');
    const apiUpdateActivitiesInput = document.getElementById('apiUpdateActivitiesInput');
    const apiUpdateBtn = document.getElementById('apiUpdateBtn');
    const apiUpdateResult = document.getElementById('apiUpdateResult');
    // DELETE
    const apiDeleteIdInput = document.getElementById('apiDeleteIdInput');
    const apiDeleteBtn = document.getElementById('apiDeleteBtn');
    const apiDeleteResult = document.getElementById('apiDeleteResult');
    // *** FIN NUEVOS ELEMENTOS ***

    let recordatorios = cargarRecordatorios();
    let recordatorioParaEditar = null; // Variable para guardar referencia al editar

    // *** NUEVA CONSTANTE PARA LA API BASE URL ***
    const API_BASE_URL = 'https://apicalendarioloca.onrender.com/api/actividades'; 

    // --- Funciones Principales ---

    function cargarRecordatorios() {
        const recordatoriosGuardados = localStorage.getItem('recordatorios');
        try {
            const parsed = recordatoriosGuardados ? JSON.parse(recordatoriosGuardados) : {};
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch (e) {
            console.error("Error al parsear recordatorios de localStorage:", e);
            return {};
        }
    }

    function guardarRecordatorios() {
        localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
    }

    function generarCalendario() {
        let primerDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1).getDay();
        primerDiaDelMes = primerDiaDelMes === 0 ? 6 : primerDiaDelMes - 1; // Ajustar Lunes=0, Domingo=6

        let diasEnMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();

        mesElemento.innerText = `${mesTexto[fecha.getMonth()]} de ${fecha.getFullYear()}`;
        diasElemento.innerHTML = '';

        diasSemana.forEach(dia => {
            let diaSemana = document.createElement('div');
            diaSemana.classList.add('text-gray-400', 'font-semibold', 'text-center');
            diaSemana.innerText = dia;
            diasElemento.appendChild(diaSemana);
        });

        for (let i = 0; i < primerDiaDelMes; i++) {
            diasElemento.appendChild(document.createElement('div'));
        }

        const hoy = new Date();
        const hoyDia = hoy.getDate();
        const hoyMes = hoy.getMonth();
        const hoyAnio = hoy.getFullYear();

        for (let i = 1; i <= diasEnMes; i++) {
            let dia = document.createElement('div');
            dia.classList.add('text-gray-300', 'hover:bg-gray-600', 'text-center', 'rounded-full', 'w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'cursor-pointer', 'transition-colors', 'relative');
            dia.innerText = i;

            const esHoy = (i === hoyDia && fecha.getMonth() === hoyMes && fecha.getFullYear() === hoyAnio);
            const esFestivo = diasFestivos[fecha.getMonth()]?.includes(i);
            // Genera la clave con mes basado en 0 (ej: 8-3-2025 para 8 de Abril 2025)
            const fechaClave = `${i}-${fecha.getMonth()}-${fecha.getFullYear()}`;
            const tieneRecordatorios = Array.isArray(recordatorios[fechaClave]) && recordatorios[fechaClave].length > 0;

            if (esHoy) {
                dia.classList.add('border-2', 'border-blue-500', 'font-bold', 'text-white');
                dia.classList.remove('text-gray-300');
            }
            if (esFestivo) {
                dia.classList.add('bg-red-700', 'text-white', 'font-semibold');
                dia.classList.remove('text-gray-300', 'hover:bg-gray-600');
            }
             if (tieneRecordatorios && !esFestivo && !esHoy) {
                const dot = document.createElement('span');
                dot.classList.add('absolute', 'bottom-1', 'right-1', 'w-2', 'h-2', 'bg-blue-400', 'rounded-full');
                 dot.setAttribute('aria-hidden', 'true');
                dia.appendChild(dot);
            }

            dia.addEventListener('click', function () {
                modalFecha.innerText = `${i} de ${mesTexto[fecha.getMonth()]} de ${fecha.getFullYear()}`;
                modalInput.value = '';
                mostrarRecordatoriosEnModal(i);
                modal.classList.remove('hidden');
                modalInput.focus();
            });

            diasElemento.appendChild(dia);
        }
    }

    function mostrarRecordatoriosEnModal(dia) {
        // Genera la clave con mes basado en 0
        const fechaClave = `${dia}-${fecha.getMonth()}-${fecha.getFullYear()}`;
        const recordatoriosDelDia = recordatorios[fechaClave] || [];
        recordatoriosElemento.innerHTML = '';

        if (recordatoriosDelDia.length === 0) {
            recordatoriosElemento.innerHTML = '<li class="text-gray-400 italic">No hay recordatorios para este día.</li>';
            return;
        }

        recordatoriosDelDia.forEach((recordatorio, index) => {
             if (!recordatorio || typeof recordatorio !== 'string' || recordatorio.trim() === '') {
                 console.warn(`Recordatorio inválido encontrado y omitido en ${fechaClave} index ${index}:`, recordatorio);
                 return;
             }

            const li = document.createElement('li');
            li.classList.add('text-white', 'flex', 'justify-between', 'items-center', 'bg-gray-700', 'p-2', 'rounded-lg', 'mb-2');
            li.innerHTML = `
                <span class="flex-grow mr-2 break-words">${recordatorio}</span>
                <button class="text-red-500 hover:text-red-400 focus:outline-none flex-shrink-0 ml-2" aria-label="Eliminar recordatorio" data-index="${index}" data-fecha="${fechaClave}" data-action="eliminar-modal">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
            `;
            recordatoriosElemento.appendChild(li);
        });

        recordatoriosElemento.querySelectorAll('button[data-action="eliminar-modal"]').forEach(button => {
             button.removeEventListener('click', manejarClickEliminarModal);
             button.addEventListener('click', manejarClickEliminarModal);
         });
    }

    function manejarClickEliminarModal(event) {
        const button = event.currentTarget;
        const index = parseInt(button.getAttribute('data-index'), 10);
        const fechaClave = button.getAttribute('data-fecha'); // Clave con mes 0-based
        const dia = fechaClave.split('-')[0];

         if (isNaN(index)) {
             console.error("Índice inválido para eliminar:", button.getAttribute('data-index'));
             return;
         }

        mostrarConfirmacionEliminar(fechaClave, index, () => {
             mostrarRecordatoriosEnModal(dia);
             mostrarTablaRecordatorios();
             generarCalendario();
        });
    }

    function mostrarTablaRecordatorios() {
        tablaRecordatorios.innerHTML = '';
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);

        const todosLosRecordatorios = [];
        Object.entries(recordatorios).forEach(([fechaClave, recordatoriosDelDia]) => {
             // fechaClave sigue siendo D-M0-YYYY (M0 = mes 0-based)
             if (!Array.isArray(recordatoriosDelDia)) {
                 console.warn(`Valor inválido encontrado para la clave ${fechaClave}, se omitirá.`);
                 return;
             }

            const partes = fechaClave.split('-');
             if (partes.length !== 3) {
                 console.warn(`Clave de fecha inválida encontrada: ${fechaClave}, se omitirá.`);
                 return;
             }
             const [diaStr, mesCeroStr, anioStr] = partes;
             const dia = parseInt(diaStr, 10);
             const mesCero = parseInt(mesCeroStr, 10); // Mes 0-based
             const anio = parseInt(anioStr, 10);

             if (isNaN(dia) || isNaN(mesCero) || isNaN(anio) || mesCero < 0 || mesCero > 11) {
                 console.warn(`Componentes de fecha inválidos en clave: ${fechaClave}, se omitirá.`);
                 return;
             }

             const recordatoriosValidos = recordatoriosDelDia.filter(r => r && typeof r === 'string' && r.trim() !== '');

            // Crear fecha Date object usando mes 0-based para comparaciones
            const fechaRecordatorio = new Date(anio, mesCero, dia);
             if (isNaN(fechaRecordatorio.getTime())) {
                 console.warn(`Fecha inválida creada desde clave: ${fechaClave}, se omitirá.`);
                 return;
             }
            fechaRecordatorio.setHours(0, 0, 0, 0);

             recordatoriosValidos.forEach((recordatorio) => {
                 // Encontrar el índice original en el array no filtrado
                 const originalIndex = recordatoriosDelDia.indexOf(recordatorio);
                 if (originalIndex === -1) {
                     // Esto no debería pasar si recordatorio viene de recordatoriosValidos
                     console.error("No se encontró el índice original para:", recordatorio, "en", fechaClave);
                     return;
                 }
                todosLosRecordatorios.push({
                    fecha: fechaRecordatorio, // Objeto Date para ordenar
                    dia: diaStr,
                    mes: mesCeroStr, // Guardamos el mes 0-based aquí para consistencia interna
                    anio: anioStr,
                    detalle: recordatorio,
                    originalIndex: originalIndex, // Índice en el array original
                    fechaClave: fechaClave // La clave original D-M0-YYYY
                });
            });
        });

        todosLosRecordatorios.sort((a, b) => a.fecha - b.fecha);

        if (todosLosRecordatorios.length === 0) {
             tablaRecordatorios.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400 py-4 italic">No hay recordatorios almacenados.</td></tr>`;
             return;
         }

        todosLosRecordatorios.forEach(recordatorio => {
            const row = document.createElement('tr');
            row.classList.add('border-b', 'border-gray-600', 'hover:bg-gray-600/50');

            const esPasado = fechaActual > recordatorio.fecha;
            const esHoy = fechaActual.getTime() === recordatorio.fecha.getTime();

            let estadoClaseColor = 'bg-yellow-400';
            if (esHoy) estadoClaseColor = 'bg-green-500';
            else if (esPasado) estadoClaseColor = 'bg-red-600';

            const tooltipTexto = esHoy ? 'Hoy' : (esPasado ? 'Vencido' : 'Próximo');

            // Mostramos el nombre del mes usando el mes 0-based convertido a número
            const mesCorrectoNombre = mesTexto[parseInt(recordatorio.mes, 10)];

            row.innerHTML = `
                <td class="px-4 py-2 text-white flex items-center">
                     <span class="w-2.5 h-2.5 ${estadoClaseColor} rounded-full mr-2 inline-block flex-shrink-0" title="${tooltipTexto}" aria-hidden="true"></span>
                     <span>${recordatorio.dia}</span>
                </td>
                <td class="px-4 py-2 text-white">${mesCorrectoNombre}</td>
                <td class="px-4 py-2 text-white break-words">${recordatorio.detalle}</td>
                <td class="px-1 py-2 text-center">
                    <button class="text-yellow-400 hover:text-yellow-300 focus:outline-none editar-recordatorio p-1" aria-label="Editar recordatorio" data-fecha="${recordatorio.fechaClave}" data-index="${recordatorio.originalIndex}">
                        <i class="fas fa-edit" aria-hidden="true"></i>
                    </button>
                </td>
                <td class="px-1 py-2 text-center">
                    <button class="text-red-500 hover:text-red-400 focus:outline-none eliminar-recordatorio-tabla p-1" aria-label="Eliminar recordatorio" data-fecha="${recordatorio.fechaClave}" data-index="${recordatorio.originalIndex}">
                        <i class="fas fa-trash" aria-hidden="true"></i>
                    </button>
                </td>
            `;

            tablaRecordatorios.appendChild(row);
        });

        asignarEventosTabla();
    }

     function asignarEventosTabla() {
         document.querySelectorAll('.eliminar-recordatorio-tabla').forEach(button => {
             button.removeEventListener('click', manejarClickEliminarTabla);
             button.addEventListener('click', manejarClickEliminarTabla);
         });
         document.querySelectorAll('.editar-recordatorio').forEach(button => {
             button.removeEventListener('click', manejarClickEditar);
             button.addEventListener('click', manejarClickEditar);
         });
     }

     function manejarClickEliminarTabla(event) {
         const button = event.currentTarget;
         const fechaClave = button.getAttribute('data-fecha'); // Clave D-M0-YYYY
         const index = parseInt(button.getAttribute('data-index'), 10);

          if (isNaN(index)) {
              console.error("Índice inválido para eliminar desde tabla:", button.getAttribute('data-index'));
              return;
          }
         mostrarConfirmacionEliminar(fechaClave, index, () => {
             mostrarTablaRecordatorios();
             generarCalendario();
         });
     }

     function manejarClickEditar(event) {
         const button = event.currentTarget;
         const fechaClave = button.getAttribute('data-fecha'); // Clave D-M0-YYYY
         const index = parseInt(button.getAttribute('data-index'), 10);

          if (isNaN(index) || !recordatorios[fechaClave] || recordatorios[fechaClave][index] === undefined) {
             console.error("No se pudo encontrar el recordatorio para editar. Fecha:", fechaClave, "Índice:", index);
             alert("Error al intentar editar el recordatorio. Es posible que ya no exista.");
             mostrarTablaRecordatorios();
             generarCalendario();
             return;
          }
         const recordatorioActual = recordatorios[fechaClave][index];
         recordatorioParaEditar = { fechaClave, index };
         inputDetalle.value = recordatorioActual;
         modalEditar.classList.remove('hidden');
         inputDetalle.focus();
     }

    function mostrarConfirmacionEliminar(fechaClave, index, callbackConfirmacion) {
        // fechaClave sigue siendo D-M0-YYYY
         if (!recordatorios[fechaClave] || !Array.isArray(recordatorios[fechaClave]) || index < 0 || index >= recordatorios[fechaClave].length) {
             console.error(`Intento de eliminar un recordatorio inválido o inexistente: ${fechaClave} [${index}]`);
             alert("No se puede eliminar el recordatorio porque no se encontró.");
             mostrarTablaRecordatorios();
             generarCalendario();
             return;
         }

        confirmModal.classList.remove('hidden');

        confirmYes.onclick = () => {
             if (recordatorios[fechaClave] && Array.isArray(recordatorios[fechaClave]) && index >= 0 && index < recordatorios[fechaClave].length) {
                 recordatorios[fechaClave].splice(index, 1);
                 if (recordatorios[fechaClave].length === 0) {
                     delete recordatorios[fechaClave];
                 }
                 guardarRecordatorios();
                 if(callbackConfirmacion) callbackConfirmacion();
             } else {
                 console.error("Error al confirmar eliminación: el recordatorio ya no existía en", fechaClave, "índice", index);
                 alert("El recordatorio ya no existía al intentar eliminarlo.");
                  if(callbackConfirmacion) callbackConfirmacion();
             }
            confirmModal.classList.add('hidden');
        };

        confirmNo.onclick = () => {
            confirmModal.classList.add('hidden');
        };
    }

    // **** INICIO: MODIFICADA FUNCIÓN PARA EXPORTAR JSON (AHORA SE LLAMA DESDE EL MODAL API) ****
    function exportarRecordatoriosJsonLocal() {
        const datosParaExportar = Object.entries(recordatorios)
             .map(([fechaClave, actividades]) => {
                 if (!Array.isArray(actividades)) {
                     console.warn(`Formato de actividades inválido para ${fechaClave}. Se omitirá.`);
                     return null;
                 }
                 const actividadesValidas = actividades.filter(act => act && typeof act === 'string' && act.trim() !== '');
                 if (actividadesValidas.length === 0) return null;

                 const partes = fechaClave.split('-');
                 if (partes.length !== 3) {
                      console.warn(`Formato de fechaClave inválido: ${fechaClave}. Se omitirá.`);
                      return null;
                 }
                 const [diaStr, mesCeroStr, anioStr] = partes;
                 const dia = parseInt(diaStr, 10);
                 const mesCero = parseInt(mesCeroStr, 10);
                 const anio = parseInt(anioStr, 10);

                 if (isNaN(dia) || isNaN(mesCero) || isNaN(anio) || mesCero < 0 || mesCero > 11) {
                     console.warn(`Componentes de fecha inválidos en clave: ${fechaClave}. Se omitirá.`);
                     return null;
                 }
                 const mesCorrecto = mesCero + 1; // Convertir a mes 1-based para JSON
                 const fechaFormateadaParaJson = `${dia}-${mesCorrecto}-${anio}`;

                 return {
                     fecha: fechaFormateadaParaJson,
                     actividades: actividadesValidas
                 };
             })
             .filter(item => item !== null);

         if (datosParaExportar.length === 0) {
             alert("No hay recordatorios locales válidos para exportar.");
             return;
         }

         const jsonString = JSON.stringify(datosParaExportar, null, 2);
         const blob = new Blob([jsonString], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;

         const ahora = new Date();
         const fechaArchivo = `${ahora.getFullYear()}${(ahora.getMonth() + 1).toString().padStart(2, '0')}${ahora.getDate().toString().padStart(2, '0')}`;
         a.download = `recordatorios_locales_${fechaArchivo}.json`;

         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);

        // Opcional: Cerrar modal API después de exportar localmente
        // apiModal.classList.add('hidden');
    }
    // **** FIN: FUNCIÓN PARA EXPORTAR JSON LOCAL ****

    // *** INICIO: NUEVAS FUNCIONES PARA INTERACCIÓN CON API ***

    // Helper para mostrar resultados en los <pre> del modal API
    function displayApiResult(element, data, isError = false) {
        if (isError) {
            element.classList.add('text-red-400');
            element.classList.remove('text-green-400');
            // Intenta mostrar el mensaje de error del backend si existe
            let errorMessage = "Error desconocido";
            if (typeof data === 'string') {
                errorMessage = data;
            } else if (data instanceof Error) {
                 errorMessage = data.message;
            } else if (data && typeof data === 'object' && data.error) {
                 errorMessage = data.error;
            } else {
                 try { errorMessage = JSON.stringify(data, null, 2); } catch { /* Ignorar */ }
            }
             element.textContent = `Error: ${errorMessage}`;
        } else {
            element.classList.remove('text-red-400');
            element.classList.add('text-green-400'); // O un color neutral si prefieres
            if (typeof data === 'string') {
                element.textContent = data;
            } else if (data === null || data === undefined) {
                element.textContent = "Operación exitosa (Sin contenido)"; // Para DELETE 204
            }
            else {
                element.textContent = JSON.stringify(data, null, 2);
            }
        }
    }

    // Helper genérico para fetch
    async function apiFetch(url, options = {}) {
        try {
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
            const config = {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            };

            const response = await fetch(url, config);

            // Handle DELETE 204 No Content
            if (response.status === 204) {
                return { success: true, data: null }; // Indicate success with no data
            }

            const responseData = await response.json();

            if (!response.ok) {
                 // Usar el mensaje de error del backend si está disponible
                 const errorMessage = responseData.error || responseData.message || `HTTP error! status: ${response.status}`;
                 // Lanzar un error estructurado
                 const error = new Error(errorMessage);
                 error.status = response.status;
                 error.data = responseData; // Adjuntar la respuesta completa por si acaso
                 throw error;
             }

            return { success: true, data: responseData };

        } catch (error) {
            console.error('API Fetch Error:', error);
             // Devolver un objeto de error consistente
             return { success: false, error: error.message || 'Error de red o al procesar la respuesta', status: error.status, data: error.data };
        }
    }

    // 1. GET All
    async function handleGetAllActivities() {
        apiGetAllResult.textContent = 'Cargando...';
        apiGetAllResult.classList.remove('text-red-400', 'text-green-400');
        const result = await apiFetch(API_BASE_URL);
        if (result.success) {
            displayApiResult(apiGetAllResult, result.data);
        } else {
            displayApiResult(apiGetAllResult, result.error || result.data, true);
        }
    }

    // 2. POST Create
    async function handleCreateActivity() {
        const fecha = apiCreateDateInput.value.trim();
        const actividadesRaw = apiCreateActivitiesInput.value.trim();

        // Validación básica
        if (!fecha || !actividadesRaw) {
            displayApiResult(apiCreateResult, "La fecha y las actividades son obligatorias.", true);
            return;
        }
        // Validación simple de formato de fecha (podría ser más robusta)
        if (!/^\d{1,2}-\d{1,2}-\d{4}$/.test(fecha)) {
             displayApiResult(apiCreateResult, "Formato de fecha inválido. Use D-M-AAAA (ej: 8-4-2025).", true);
             return;
        }

        const actividadesArray = actividadesRaw.split('\n')
                                          .map(line => line.trim())
                                          .filter(line => line !== '');

        if (actividadesArray.length === 0) {
            displayApiResult(apiCreateResult, "Debe ingresar al menos una actividad.", true);
            return;
        }

        const data = { fecha, actividades: actividadesArray };
        apiCreateResult.textContent = 'Creando...';
        apiCreateResult.classList.remove('text-red-400', 'text-green-400');
        const result = await apiFetch(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (result.success) {
            displayApiResult(apiCreateResult, result.data);
            apiCreateDateInput.value = ''; // Limpiar campos tras éxito
            apiCreateActivitiesInput.value = '';
            // Opcional: Recargar la lista completa para ver el nuevo item
            // handleGetAllActivities();
        } else {
            displayApiResult(apiCreateResult, result.error || result.data, true);
        }
    }

    // 3. GET By ID
    async function handleGetActivityById() {
        const id = apiGetIdInput.value.trim();
        if (!id) {
            displayApiResult(apiGetByIdResult, "Debe ingresar un ID.", true);
            return;
        }
        apiGetByIdResult.textContent = 'Buscando...';
        apiGetByIdResult.classList.remove('text-red-400', 'text-green-400');
        const result = await apiFetch(`${API_BASE_URL}/${id}`);
        if (result.success) {
            displayApiResult(apiGetByIdResult, result.data);
        } else {
            displayApiResult(apiGetByIdResult, result.error || result.data, true);
        }
    }

    // 4. PUT Update
    async function handleUpdateActivity() {
        const id = apiUpdateIdInput.value.trim();
        const fecha = apiUpdateDateInput.value.trim();
        const actividadesRaw = apiUpdateActivitiesInput.value.trim();

        if (!id) {
            displayApiResult(apiUpdateResult, "Debe ingresar el ID de la actividad a actualizar.", true);
            return;
        }
        // Al menos uno de los campos a actualizar debe tener valor
        if (!fecha && !actividadesRaw) {
             displayApiResult(apiUpdateResult, "Debe ingresar una nueva fecha o nuevas actividades para actualizar.", true);
             return;
        }
        // Validación de fecha si se proporciona
        if (fecha && !/^\d{1,2}-\d{1,2}-\d{4}$/.test(fecha)) {
             displayApiResult(apiUpdateResult, "Formato de fecha inválido. Use D-M-AAAA (ej: 8-4-2025).", true);
             return;
        }

        const dataToUpdate = {};
        if (fecha) {
            dataToUpdate.fecha = fecha;
        }
        if (actividadesRaw) {
            const actividadesArray = actividadesRaw.split('\n')
                                              .map(line => line.trim())
                                              .filter(line => line !== '');
            if (actividadesArray.length > 0) {
                 dataToUpdate.actividades = actividadesArray;
            } else if (actividadesRaw) { // Si escribió algo pero eran solo espacios
                 displayApiResult(apiUpdateResult, "Si actualiza actividades, debe ingresar al menos una válida.", true);
                 return;
            }
        }

         if (Object.keys(dataToUpdate).length === 0) {
             displayApiResult(apiUpdateResult, "No hay datos válidos para actualizar.", true);
             return;
         }

        apiUpdateResult.textContent = 'Actualizando...';
        apiUpdateResult.classList.remove('text-red-400', 'text-green-400');
        const result = await apiFetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dataToUpdate),
        });

        if (result.success) {
            displayApiResult(apiUpdateResult, result.data);
            // Opcional: Recargar la lista o el item específico para ver cambios
            // handleGetAllActivities();
            // handleGetActivityById(); // (necesitaría el ID)
        } else {
            displayApiResult(apiUpdateResult, result.error || result.data, true);
        }
    }

    // 5. DELETE By ID
    async function handleDeleteActivity() {
        const id = apiDeleteIdInput.value.trim();
        if (!id) {
            displayApiResult(apiDeleteResult, "Debe ingresar un ID para eliminar.", true);
            return;
        }

        // Confirmación (opcional pero recomendado)
        if (!confirm(`¿Está seguro de que desea eliminar la actividad con ID: ${id}? Esta acción no se puede deshacer.`)) {
            displayApiResult(apiDeleteResult, "Eliminación cancelada.", false); // Mensaje neutral
            apiDeleteResult.classList.remove('text-red-400', 'text-green-400');
            return;
        }

        apiDeleteResult.textContent = 'Eliminando...';
        apiDeleteResult.classList.remove('text-red-400', 'text-green-400');
        const result = await apiFetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (result.success) {
             // Para 204 No Content, result.data será null
            displayApiResult(apiDeleteResult, `Actividad con ID ${id} eliminada exitosamente.`);
            apiDeleteIdInput.value = ''; // Limpiar campo tras éxito
            // Opcional: Recargar la lista completa
            // handleGetAllActivities();
        } else {
             displayApiResult(apiDeleteResult, result.error || result.data, true);
        }
    }
    async function handleExportLocalToApi() {
        apiExportAllResult.textContent = 'Iniciando exportación de LocalStorage a API...';
        apiExportAllResult.classList.remove('text-red-400', 'text-green-400');

        const localRecordatorios = cargarRecordatorios(); // Carga los datos actuales

        if (!localRecordatorios || Object.keys(localRecordatorios).length === 0) {
            apiExportAllResult.textContent = 'No hay recordatorios en LocalStorage para exportar.';
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        const resultsDetails = [];
        const totalEntries = Object.keys(localRecordatorios).length;
        let processedCount = 0;

        // Usamos un bucle for...of con Object.entries para poder usar await dentro
        for (const [fechaClave, actividadesArray] of Object.entries(localRecordatorios)) {
            processedCount++;
            apiExportAllResult.textContent = `Procesando ${processedCount}/${totalEntries}: ${fechaClave}...`;

            // Validar que sea un array y tenga contenido válido
            if (!Array.isArray(actividadesArray) || actividadesArray.length === 0) {
                resultsDetails.push(`Skipped ${fechaClave}: No es un array válido o está vacío.`);
                continue;
            }
            const actividadesValidas = actividadesArray.filter(act => typeof act === 'string' && act.trim() !== '');
            if (actividadesValidas.length === 0) {
                 resultsDetails.push(`Skipped ${fechaClave}: No contiene actividades válidas.`);
                 continue;
            }

            // Parsear y formatear fecha (D-M0-YYYY a D-M-YYYY)
            const partes = fechaClave.split('-');
            let fechaApi;
            if (partes.length === 3) {
                const dia = partes[0];
                const mesCero = parseInt(partes[1], 10);
                const anio = partes[2];
                if (!isNaN(mesCero) && mesCero >= 0 && mesCero <= 11) {
                    const mesCorrecto = mesCero + 1; // Convertir a 1-based
                    fechaApi = `${dia}-${mesCorrecto}-${anio}`;
                }
            }

            if (!fechaApi) {
                 resultsDetails.push(`Skipped ${fechaClave}: Formato de fecha inválido.`);
                 errorCount++;
                 continue;
            }

            // Preparar payload para la API
            const payload = {
                fecha: fechaApi,
                actividades: actividadesValidas
            };

            // Enviar petición POST a la API
            const result = await apiFetch(API_BASE_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Registrar resultado
            if (result.success) {
                successCount++;
                resultsDetails.push(`Éxito ${fechaApi}: ${JSON.stringify(result.data?._id || 'OK')}`); // Mostrar ID si se devuelve
            } else {
                errorCount++;
                resultsDetails.push(`Error ${fechaApi}: ${result.error || JSON.stringify(result.data)}`);
            }
        }

        // Mostrar resumen final
        let summary = `Exportación completada.\n`;
        summary += `Total de fechas en LocalStorage: ${totalEntries}\n`;
        summary += `Enviadas con éxito: ${successCount}\n`;
        summary += `Errores/Omitidos: ${errorCount}\n\n`;
        summary += `Detalles:\n${resultsDetails.join('\n')}`;

        apiExportAllResult.textContent = summary;
        if (errorCount > 0) {
            apiExportAllResult.classList.add('text-red-400');
        } else {
            apiExportAllResult.classList.add('text-green-400');
        }

         // Opcional: Recargar la lista de la API para ver los nuevos datos
         // await handleGetAllActivities();
    }

    

    // *** FIN: NUEVAS FUNCIONES PARA INTERACCIÓN CON API ***

    // --- Event Listeners ---

    document.getElementById('mes-siguiente').addEventListener('click', () => {
        fecha.setMonth(fecha.getMonth() + 1);
        generarCalendario();
    });

    document.getElementById('mes-anterior').addEventListener('click', () => {
        fecha.setMonth(fecha.getMonth() - 1);
        generarCalendario();
    });

    modalCerrar.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

     document.addEventListener('keydown', (event) => {
         if (event.key === 'Escape') {
             if (!modal.classList.contains('hidden')) modal.classList.add('hidden');
             if (!confirmModal.classList.contains('hidden')) confirmModal.classList.add('hidden');
             if (!modalEditar.classList.contains('hidden')) {
                 modalEditar.classList.add('hidden');
                 recordatorioParaEditar = null;
             }
         }
     });

    modalGuardar.addEventListener('click', () => {
        const diaCompleto = modalFecha.innerText;
        const partesFecha = diaCompleto.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d+)/);
         if (!partesFecha || partesFecha.length < 4) {
             console.error("No se pudo parsear la fecha del modal:", diaCompleto);
             alert("Error al obtener la fecha seleccionada.");
             return;
         }
        const dia = partesFecha[1];
        const mesActual = fecha.getMonth(); // Mes 0-based
        const anioActual = fecha.getFullYear();

        // Genera la clave con mes basado en 0
        const fechaClave = `${dia}-${mesActual}-${anioActual}`;
        const nuevoRecordatorio = modalInput.value.trim();

        if (nuevoRecordatorio === '') {
            alert("Por favor, escriba un recordatorio antes de agregar.");
            modalInput.focus();
            return;
        }

        if (!recordatorios[fechaClave] || !Array.isArray(recordatorios[fechaClave])) {
            recordatorios[fechaClave] = [];
        }
        recordatorios[fechaClave].push(nuevoRecordatorio);
        guardarRecordatorios();

        mostrarRecordatoriosEnModal(dia);
        mostrarTablaRecordatorios();
        generarCalendario();
        modalInput.value = '';
        modalInput.focus();
    });

    confirmEdit.addEventListener('click', () => {
        if (!recordatorioParaEditar) {
             console.warn("Intento de guardar edición sin un recordatorio seleccionado.");
             modalEditar.classList.add('hidden');
             return;
        }

        const { fechaClave, index } = recordatorioParaEditar; // fechaClave es D-M0-YYYY
        const nuevoDetalle = inputDetalle.value.trim();

        if (nuevoDetalle === '') {
            alert("El detalle del recordatorio no puede estar vacío.");
             inputDetalle.focus();
            return;
        }

         if (recordatorios[fechaClave] && Array.isArray(recordatorios[fechaClave]) && recordatorios[fechaClave][index] !== undefined) {
             recordatorios[fechaClave][index] = nuevoDetalle;
             guardarRecordatorios();
             mostrarTablaRecordatorios();
             modalEditar.classList.add('hidden');
             recordatorioParaEditar = null;
             // generarCalendario(); // Opcional
         } else {
             alert("Error al guardar la edición. El recordatorio original no se encontró o ha sido modificado.");
             modalEditar.classList.add('hidden');
             recordatorioParaEditar = null;
             mostrarTablaRecordatorios();
         }
    });

    cancelEdit.addEventListener('click', () => {
        modalEditar.classList.add('hidden');
        recordatorioParaEditar = null;
    });

    // *** MODIFICADO: Listener para el botón original de exportar ***
    botonExportarJson.addEventListener('click', () => {
        // Ahora abre el modal de API en lugar de exportar directamente
        apiGetAllResult.textContent = 'Presiona "Cargar Todas" para ver los datos de la API...'; // Resetear mensaje inicial
        apiGetAllResult.classList.remove('text-red-400', 'text-green-400');
        // Limpiar otros resultados al abrir
        apiCreateResult.textContent = '';
        apiGetByIdResult.textContent = '';
        apiUpdateResult.textContent = '';
        apiDeleteResult.textContent = '';
        apiModal.classList.remove('hidden');
    });

    // *** NUEVO Listener para el botón de exportar TODO a API ***
    botonExportarApi.addEventListener('click', handleExportLocalToApi);

    // *** NUEVOS Listeners para el Modal API ***
    apiModalCerrar.addEventListener('click', () => {
        apiModal.classList.add('hidden');
    });

    // Listener para el botón de exportar *localmente* (dentro del modal API)
    botonExportarLocalJson.addEventListener('click', exportarRecordatoriosJsonLocal);

    // Listeners para los botones de operaciones API
    apiGetAllBtn.addEventListener('click', handleGetAllActivities);
    apiCreateBtn.addEventListener('click', handleCreateActivity);
    apiGetByIdBtn.addEventListener('click', handleGetActivityById);
    apiUpdateBtn.addEventListener('click', handleUpdateActivity);
    apiDeleteBtn.addEventListener('click', handleDeleteActivity);

     // Cerrar modal API con tecla Escape
     document.addEventListener('keydown', (event) => {
         if (event.key === 'Escape') {
             // ... (tu código existente para cerrar otros modales) ...
             if (!apiModal.classList.contains('hidden')) {
                 apiModal.classList.add('hidden');
             }
         }
     });

    // --- Inicialización ---
    generarCalendario();
    mostrarTablaRecordatorios();

}); // Fin del DOMContentLoaded
