
document.addEventListener('DOMContentLoaded', function () {
    let fecha = new Date(); // Fecha actual
    const mesTexto = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const diasSemana = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
    
    // Días festivos por mes
    const diasFestivos = {
        0: [1, 6, 25],  // Enero
        1: [],        // Febrero
        2: [24],        // Marzo
        3: [17,18],        // Abril
        4: [1],         // Mayo
        5: [2, 23, 30],        // Junio
        6: [20],         // Julio
        7: [7, 18],        // Agosto
        8: [15],        // Septiembre
        9: [13],        // Octubre
        10: [3, 17],        // Noviembre
        11: [8, 25]         // Diciembre
    };
    
    const mesElemento = document.getElementById('mes');
    const diasElemento = document.getElementById('dias');
    const modal = document.getElementById('modal');
    const modalFecha = document.getElementById('modal-fecha');
    const modalInput = document.getElementById('modal-input');
    const modalGuardar = document.getElementById('modal-guardar');
    const modalCerrar = document.getElementById('modal-cerrar');
    const recordatoriosElemento = document.getElementById('recordatorios');
    const tablaRecordatorios = document.getElementById('tabla-recordatorios');

    let recordatorios = cargarRecordatorios();

    // Función para cargar los recordatorios desde el localStorage
    function cargarRecordatorios() {
        const recordatoriosGuardados = localStorage.getItem('recordatorios');
        return recordatoriosGuardados ? JSON.parse(recordatoriosGuardados) : {};
    }

    // Función para guardar los recordatorios en el localStorage
    function guardarRecordatorios() {
        localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
    }

    // Función para generar el calendario
    function generarCalendario() {
        let primerDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1).getDay();

        // Ajustar el primer día para que comience desde lunes (0 = lunes, 6 = domingo)
        primerDiaDelMes = primerDiaDelMes === 0 ? 6 : primerDiaDelMes - 1;

        let diasEnMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();

        // Mostrar el mes y año
        mesElemento.innerText = `${mesTexto[fecha.getMonth()]} de ${fecha.getFullYear()}`;

        // Limpiar el contenido anterior
        diasElemento.innerHTML = '';

        // Agregar los días de la semana
        diasSemana.forEach(dia => {
            let diaSemana = document.createElement('div');
            diaSemana.classList.add('text-gray-400', 'text-center');
            diaSemana.innerText = dia;
            diasElemento.appendChild(diaSemana);
        });

        // Agregar los días del mes
        for (let i = 0; i < primerDiaDelMes; i++) {
            let vacio = document.createElement('div');
            vacio.classList.add('text-gray-400', 'text-center');
            diasElemento.appendChild(vacio);
        }

        for (let i = 1; i <= diasEnMes; i++) {
            let dia = document.createElement('div');
            dia.classList.add('text-gray-400', 'text-center', 'rounded-full', 'w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'cursor-pointer');
            dia.innerText = i;

            // Obtener la fecha actual
            const hoy = new Date();
            const esHoy = (i === hoy.getDate() && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear());

            // Resaltar el día actual con color blanco (o el color que prefieras)
            if (esHoy) {
                dia.classList.add('border', 'border-red-500', 'bg-gray-800', 'text-white');
            }

            // Resaltar días festivos
            if (diasFestivos[fecha.getMonth()] && diasFestivos[fecha.getMonth()].includes(i)) {
                dia.classList.add('bg-red-500', 'text-white');
            }

            // Añadir evento para abrir el modal
            dia.addEventListener('click', function () {
                modalFecha.innerText = `${i} de ${mesTexto[fecha.getMonth()]} de ${fecha.getFullYear()}`;
                modal.classList.remove('hidden');
                mostrarRecordatorios(i);
            });

            // Añadir identificador a los días con recordatorios
            const fechaClave = `${i}-${fecha.getMonth()}-${fecha.getFullYear()}`;
            if (recordatorios[fechaClave] && recordatorios[fechaClave].length > 0) {
                dia.classList.add('bg-blue-500', 'text-white');
            }

            diasElemento.appendChild(dia);
        }
    }

// Mostrar recordatorios
function mostrarRecordatorios(dia) {
    const fechaClave = `${dia}-${fecha.getMonth()}-${fecha.getFullYear()}`;
    const recordatoriosDelDia = recordatorios[fechaClave] || [];
    recordatoriosElemento.innerHTML = '';
    recordatoriosDelDia.forEach((recordatorio, index) => {
        const li = document.createElement('li');
        li.classList.add('text-white', 'flex', 'justify-between', 'items-center');
        li.innerHTML = ` 
            <div class="flex justify-between items-center w-full bg-gray-700 p-2 rounded-lg">
                <span>${recordatorio}</span>
                <button class="text-red-500 focus:outline-none" aria-label="Eliminar recordatorio" data-index="${index}" data-fecha="${fechaClave}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        recordatoriosElemento.appendChild(li);
    });

    // Añadir eventos para eliminar recordatorios
    document.querySelectorAll('#recordatorios button').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            const fechaClave = this.getAttribute('data-fecha');
            const confirmModal = document.getElementById('confirmModal');
            const confirmYes = document.getElementById('confirmYes');
            const confirmNo = document.getElementById('confirmNo');

            // Mostrar el modal de confirmación
            confirmModal.classList.remove('hidden'); 

            // Si el usuario confirma la eliminación
            confirmYes.onclick = function () {
                recordatorios[fechaClave].splice(index, 1);
                guardarRecordatorios(); // Actualizar el localStorage
                mostrarRecordatorios(dia); // Actualizar la lista de recordatorios
                generarCalendario(); // Actualizar el calendario
                confirmModal.classList.add('hidden'); // Cerrar el modal
            };

            // Si el usuario cancela la eliminación
            confirmNo.onclick = function () {
                confirmModal.classList.add('hidden'); // Cerrar el modal sin hacer nada
            };
        });
    });
}


    function mostrarTablaRecordatorios() {
        tablaRecordatorios.innerHTML = ''; // Limpiar tabla existente
        const fechaActual = new Date();

        // Obtener todos los recordatorios en un solo array con sus fechas para ordenarlos
        const todosLosRecordatorios = [];
        Object.keys(recordatorios).forEach(fechaClave => {
            const recordatoriosDelDia = recordatorios[fechaClave];
            const [dia, mes, anio] = fechaClave.split('-');

            // Crear objeto de fecha del recordatorio
            const fechaRecordatorio = new Date(anio, mes, dia);

            // Para cada recordatorio, agregarlo con su fecha
            recordatoriosDelDia.forEach((recordatorio, index) => {
                todosLosRecordatorios.push({
                    fecha: fechaRecordatorio,
                    dia: dia,
                    mes: mes,
                    anio: anio,
                    detalle: recordatorio,
                    index: index,
                    fechaClave: fechaClave
                });
            });
        });

        // Ordenar los recordatorios por fecha (de menor a mayor)
        todosLosRecordatorios.sort((a, b) => a.fecha - b.fecha);

        // Mostrar los recordatorios ordenados
        todosLosRecordatorios.forEach(recordatorio => {
            const row = document.createElement('tr');
            const esVencido = new Date() > recordatorio.fecha; // Verificar si el recordatorio ya venció
            const esHoy = fechaActual.toDateString() === recordatorio.fecha.toDateString(); // Verificar si es hoy
            const esFuturo = new Date() < recordatorio.fecha; // Verificar si es un recordatorio para el futuro

            row.classList.add('border-b', 'border-gray-600');

            // Crear el punto que se añadirá en la fila
            const punto = document.createElement('div');
            punto.style.width = '8px'; // Tamaño del punto
            punto.style.height = '8px';
            punto.style.borderRadius = '50%'; // Hacerlo circular
            punto.style.marginRight = '10px'; // Espacio entre el punto y el texto

            // Aplicar colores según la condición
            if (esHoy) {
                punto.style.backgroundColor = 'green'; // Punto verde para hoy
            } else if (esFuturo) {
                punto.style.backgroundColor = 'yellow'; // Punto amarillo para el futuro
            } else if (esVencido) {
                punto.style.backgroundColor = 'red'; // Punto rojo para vencidos
            }

            row.innerHTML = `
                <td class="px-4 py-2 text-white flex items-center">
                    ${punto.outerHTML} ${recordatorio.dia}
                </td>
                <td class="px-4 py-2 text-white">${mesTexto[parseInt(recordatorio.mes)]}</td>
                <td class="px-4 py-2 text-white">${recordatorio.detalle}</td>

                
                <td class="px-4 py-2 text-white">
                <button class="text-yellow-500 focus:outline-none editar-recordatorio" data-fecha="${recordatorio.fechaClave}" data-index="${recordatorio.index}">
                <i class="fas fa-edit"></i>
                </button>
                </td>

                <td class="px-4 py-2 text-white">

                    <button class="text-red-500 focus:outline-none eliminar-recordatorio" data-fecha="${recordatorio.fechaClave}" data-index="${recordatorio.index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tablaRecordatorios.appendChild(row);
        });

        // Añadir eventos para eliminar recordatorios

        document.querySelectorAll('.eliminar-recordatorio').forEach(button => {
            button.addEventListener('click', function () {
                const fechaClave = this.getAttribute('data-fecha');
                const index = this.getAttribute('data-index');
                const confirmModal = document.getElementById('confirmModal');
                const confirmYes = document.getElementById('confirmYes');
                const confirmNo = document.getElementById('confirmNo');

                confirmModal.classList.remove('hidden'); 

                confirmYes.onclick = function () {
                    recordatorios[fechaClave].splice(index, 1);
                    guardarRecordatorios(); // Actualizar el localStorage
                    mostrarTablaRecordatorios(); // Actualizar la tabla
                    generarCalendario(); // Actualizar el calendario
                    confirmModal.classList.add('hidden'); 
                };

                confirmNo.onclick = function () {
                    confirmModal.classList.add('hidden');
                };
            });
        });

        // Añadir evento para editar recordatorio
document.querySelectorAll('.editar-recordatorio').forEach(button => {
    button.addEventListener('click', function () {
        const fechaClave = this.getAttribute('data-fecha');
        const index = this.getAttribute('data-index');
        const recordatorio = recordatorios[fechaClave][index]; // Obtener el recordatorio a editar

        // Mostrar el modal de edición (puedes crear un modal similar al de eliminación)
        const modalEditar = document.getElementById('modalEditar');
        const inputDetalle = document.getElementById('inputDetalle'); // Suponiendo que tienes un campo de texto en el modal para editar el detalle
        const confirmEdit = document.getElementById('confirmEdit');
        const cancelEdit = document.getElementById('cancelEdit');

        // Rellenar el input con el detalle actual del recordatorio
        inputDetalle.value = recordatorio;

        // Mostrar el modal
        modalEditar.classList.remove('hidden');

        // Si el usuario confirma la edición
        confirmEdit.onclick = function () {
            const nuevoDetalle = inputDetalle.value;

            // Actualizar el recordatorio con el nuevo detalle
            recordatorios[fechaClave][index] = nuevoDetalle;

            // Guardar los cambios en el localStorage
            guardarRecordatorios();

            // Volver a mostrar la tabla actualizada
            mostrarTablaRecordatorios();

            // Ocultar el modal de edición
            modalEditar.classList.add('hidden');
        };

        // Si el usuario cancela la edición
        cancelEdit.onclick = function () {
            modalEditar.classList.add('hidden');
        };
    });
});

    }

    // Cambiar al mes siguiente
    document.getElementById('mes-siguiente').addEventListener('click', function () {
        fecha.setMonth(fecha.getMonth() + 1);
        generarCalendario();
    });

    // Cambiar al mes anterior
    document.getElementById('mes-anterior').addEventListener('click', function () {
        fecha.setMonth(fecha.getMonth() - 1);
        generarCalendario();
    });

    // Inicializar el calendario y la tabla
    generarCalendario();
    mostrarTablaRecordatorios();

    // Cerrar el modal
    modalCerrar.addEventListener('click', function () {
        modal.classList.add('hidden');
    });

    // Guardar recordatorio con validación para no agregar vacíos
    modalGuardar.addEventListener('click', function () {
        const dia = modalFecha.innerText.split(' ')[0];
        const fechaClave = `${dia}-${fecha.getMonth()}-${fecha.getFullYear()}`;
        const nuevoRecordatorio = modalInput.value.trim();

        if (nuevoRecordatorio === '') {
            alert("Digite un recordatorio antes de guardar!");
            return;
        }

        if (!recordatorios[fechaClave]) {
            recordatorios[fechaClave] = [];
        }
        recordatorios[fechaClave].push(nuevoRecordatorio);
        modalInput.value = '';
        guardarRecordatorios(); // Guardar en localStorage
        mostrarRecordatorios(dia);
        mostrarTablaRecordatorios(); // Actualizar la tabla
        generarCalendario(); // Actualizar el calendario
    });
});
