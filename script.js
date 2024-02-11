const canvas = document.getElementById('canvas');
if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
}
window.onload = function () {

    function Grafo() {
        this.nodos = [];
        this.aristas = [];

        this.agregarNodo = function (jugador) {
            this.nodos.push({ id: jugador.id, element: jugador });
        };
        this.agregarConexion = function (jugadorOrigen, jugadorDestino, peso) {
            this.aristas.push({
                jugadorOrigen: jugadorOrigen,
                jugadorDestino: jugadorDestino,
                peso: peso,
            });
        };
    }
    //instancia del grafo
    let grafo = new Grafo();

    const coordenadas = {};

    // seleccionar jugadores

    const todosLosJugadores = document.querySelectorAll('.player-user');
    const porteria = document.getElementById('portería');

    function inicializarArrastre() {
        const players = document.querySelectorAll('.draggable');

        players.forEach(player => {
            interact(player).draggable({
                listeners: {
                    // Llama a esta función en cada evento de arrastre (dragmove)
                    move: function (event) {
                        dragMoveListener(event);

                        // Después de arrastrar, vuelve a conectar jugadores con la pelota
                        conectarJugadoresConPelota();


                    },

                    // Llama a esta función cada q se acabe de arrastrar un elemento
                    end: function (event) {
                        obtenerPosicionesJugadores();
                        const jugadorConBalon = moverJugador();
                        const posicionPelota = obtenerPosicionPelota();

                        console.log(`Posición de la pelota: x=${posicionPelota.x}, y=${posicionPelota.y}`);
                        console.log(`El jugador más cercano a la pelota es el que tiene el ID: ${jugadorConBalon.id}`);
                        console.log(grafo);

                    }
                }
            });
        });
    }


    function obtenerPosicionesJugadores() {
        const field = document.querySelector('.field');
        const fieldPos = field.getBoundingClientRect();
        const jugadores = document.querySelectorAll('.player');

        jugadores.forEach((jugador, index) => {
            const posicion = jugador.getBoundingClientRect();
        });
    }
    obtenerPosicionesJugadores();

    function obtenerPosicionPelota() {
        const field = document.querySelector('.field');
        const fieldPos = field.getBoundingClientRect();
        const ball = document.getElementById('ball');
        const ballPos = ball.getBoundingClientRect();
        const relPosX = ballPos.x - fieldPos.x;
        const relPosY = ballPos.y - fieldPos.y;
        return { x: relPosX, y: relPosY };
    }

    function conectarJugadoresConPelota() {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        const field = document.querySelector('.field');
        const fieldPos = field.getBoundingClientRect();
        const posicionPelota = obtenerPosicionPelota();

        canvas.width = field.clientWidth;
        canvas.height = field.clientHeight;

        let jugadorMasCercano;
        let distanciaMasCorta = Infinity; // Inicializar con un valor grande

        const jugadoresRivales = document.querySelectorAll('.player.player-rival');
        const jugadoresAliados = document.querySelectorAll('.player.player-user');

        const DISTANCIA_CORTA_MAXIMA = 160;
        //une a la pelota
        jugadores.forEach((jugador) => {
            const jugadorPos = jugador.getBoundingClientRect();

            // Verifica si el jugador es de tu equipo
            if (jugador.classList.contains('player-user')) {
                // Calcular el centro de cada jugador con respecto al campo
                const jugadorCenterX = jugadorPos.left - fieldPos.left + jugadorPos.width / 2;
                const jugadorCenterY = jugadorPos.top - fieldPos.top + jugadorPos.height / 2;

                // Calcular la distancia entre la pelota y el jugador
                const distanciaX = Math.abs(posicionPelota.x - jugadorCenterX);
                const distanciaY = Math.abs(posicionPelota.y - jugadorCenterY);
                const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

                // Si esta distancia es la más corta hasta el momento, actualiza al jugador más cercano
                if (distancia < distanciaMasCorta) {
                    distanciaMasCorta = distancia;
                    jugadorMasCercano = jugador;
                }

                // Dibujar la línea de conexión en el canvas
                context.beginPath();
                context.moveTo(posicionPelota.x, posicionPelota.y); // Mover al centro de la pelota
                context.lineTo(jugadorCenterX, jugadorCenterY); // Línea al centro del jugador
                context.strokeStyle = 'blue';
                context.lineWidth = 2;
                context.stroke();
            }
        });


        //unir jugadores
        jugadores.forEach((jugadorA) => {
            if (jugadorA.id.includes('player')) {
                const jugadorAPos = jugadorA.getBoundingClientRect();

                jugadores.forEach((jugadorB) => {
                    if (jugadorB.id.includes('player') && jugadorA !== jugadorB) {
                        const jugadorBPos = jugadorB.getBoundingClientRect();

                        const jugadorACenterX = jugadorAPos.left - fieldPos.left + jugadorAPos.width / 2;
                        const jugadorACenterY = jugadorAPos.top - fieldPos.top + jugadorAPos.height / 2;

                        const jugadorBCenterX = jugadorBPos.left - fieldPos.left + jugadorBPos.width / 2;
                        const jugadorBCenterY = jugadorBPos.top - fieldPos.top + jugadorBPos.height / 2;

                        // Dibujar la línea de conexión entre los jugadores
                        context.beginPath();
                        context.moveTo(jugadorACenterX, jugadorACenterY);
                        context.lineTo(jugadorBCenterX, jugadorBCenterY);
                        context.strokeStyle = 'green';
                        context.lineWidth = 2;
                        context.stroke();
                    }
                });

                // Conectar jugador con la portería
                const jugadorACenterX = jugadorAPos.left - fieldPos.left + jugadorAPos.width / 2;
                const jugadorACenterY = jugadorAPos.top - fieldPos.top + jugadorAPos.height / 2;

                const porteriaPos = porteria.getBoundingClientRect();
                const porteriaCenterX = porteriaPos.left - fieldPos.left + porteriaPos.width / 2;
                const porteriaCenterY = porteriaPos.top - fieldPos.top + porteriaPos.height / 2;

                const distanciaPorteria = Math.sqrt(Math.pow(porteriaCenterX - jugadorACenterX, 2) + Math.pow(porteriaCenterY - jugadorACenterY, 2));

                // Verificar si la distancia a la portería es menor de 250
                if (distanciaPorteria < 250) {
                    context.beginPath();
                    context.moveTo(jugadorACenterX, jugadorACenterY);
                    context.lineTo(porteriaCenterX, porteriaCenterY);
                    context.strokeStyle = 'green';
                    context.lineWidth = 2;
                    context.stroke();
                    let peso = 10;

                    grafo.agregarConexion(jugadorA.id, 'porteria', peso);
                }
            }
        });

        todosLosJugadores.forEach((jugador) => {
            // Obtener las coordenadas del jugador
            const jugadorPos = jugador.getBoundingClientRect();

            // Añadir el nodo al grafo con las coordenadas
            grafo.agregarNodo({
                id: jugador.id,
                element: jugador,
                x: jugadorPos.left,
                y: jugadorPos.top
            });
        });
        const porteriaPos = porteria.getBoundingClientRect();
        // Añadir la portería al grafo
        grafo.agregarNodo({
            id: 'porteria',
            element: porteria,
            x: porteriaPos.left,
            y: porteriaPos.top
        });

        //obtener las coordenadas
        todosLosJugadores.forEach((jugador) => {
            const jugadorPos = jugador.getBoundingClientRect();
            coordenadas[jugador.id] = { x: jugadorPos.left, y: jugadorPos.top };
        });

        coordenadas['porteria'] = { x: porteriaPos.left, y: porteriaPos.top };


        jugadoresAliados.forEach((jugadorAliado1) => {
            const jugadorAliado1Pos = jugadorAliado1.getBoundingClientRect();
            const jugadorAliado1Center = {
                x: jugadorAliado1Pos.left - fieldPos.left + jugadorAliado1Pos.width / 2,
                y: jugadorAliado1Pos.top - fieldPos.top + jugadorAliado1Pos.height / 2,
            };

            jugadoresAliados.forEach((jugadorAliado2) => {
                if (jugadorAliado1 !== jugadorAliado2) {
                    const jugadorAliado2Pos = jugadorAliado2.getBoundingClientRect();
                    const jugadorAliado2Center = {
                        x: jugadorAliado2Pos.left - fieldPos.left + jugadorAliado2Pos.width / 2,
                        y: jugadorAliado2Pos.top - fieldPos.top + jugadorAliado2Pos.height / 2,
                    };

                    // Calcular la distancia entre los jugadores aliados
                    const distanciaX = Math.abs(jugadorAliado1Center.x - jugadorAliado2Center.x);
                    const distanciaY = Math.abs(jugadorAliado1Center.y - jugadorAliado2Center.y);
                    const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

                    // Calcular la cantidad de jugadores rivales cercanos al jugadorAliado2
                    conexiones = 1;
                    jugadoresRivales.forEach((jugadorRival) => {
                        const jugadorRivalPos = jugadorRival.getBoundingClientRect();
                        const jugadorRivalCenter = {
                            x: jugadorRivalPos.left - fieldPos.left + jugadorRivalPos.width / 2,
                            y: jugadorRivalPos.top - fieldPos.top + jugadorRivalPos.height / 2,
                        };

                        const distanciaXRival = Math.abs(jugadorAliado2Center.x - jugadorRivalCenter.x);
                        const distanciaYRival = Math.abs(jugadorAliado2Center.y - jugadorRivalCenter.y);
                        const distanciaRival = Math.sqrt(distanciaXRival * distanciaXRival + distanciaYRival * distanciaYRival);

                        if (distanciaRival < DISTANCIA_CORTA_MAXIMA) {
                            conexiones++;

                        }
                    });
                    let peso = distancia * conexiones;
                    // Agregar la conexión al grafo
                    grafo.agregarConexion(jugadorAliado1.id, jugadorAliado2.id, peso);
                }
            });
        });

        jugadoresAliados.forEach((jugadorAliado) => {
            const jugadorAliadoPos = jugadorAliado.getBoundingClientRect();
            const jugadorAliadoCenter = {
                x: jugadorAliadoPos.left - fieldPos.left + jugadorAliadoPos.width / 2,
                y: jugadorAliadoPos.top - fieldPos.top + jugadorAliadoPos.height / 2,
            };

            jugadoresRivales.forEach((jugadorRival) => {
                const jugadorRivalPos = jugadorRival.getBoundingClientRect();
                const jugadorRivalCenter = {
                    x: jugadorRivalPos.left - fieldPos.left + jugadorRivalPos.width / 2,
                    y: jugadorRivalPos.top - fieldPos.top + jugadorRivalPos.height / 2,
                };

                // Calcular la distancia entre el jugador aliado y el jugador rival
                const distanciaX = Math.abs(jugadorAliadoCenter.x - jugadorRivalCenter.x);
                const distanciaY = Math.abs(jugadorAliadoCenter.y - jugadorRivalCenter.y);
                const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

                // Dibujar la línea de conexión en el canvas solo si la distancia es corta
                if (distancia < DISTANCIA_CORTA_MAXIMA) {
                    context.beginPath();
                    context.moveTo(jugadorAliadoCenter.x, jugadorAliadoCenter.y);
                    context.lineTo(jugadorRivalCenter.x, jugadorRivalCenter.y);
                    context.strokeStyle = 'red';
                    context.lineWidth = 2;
                    context.stroke();
                }
            });
        });

        return jugadorMasCercano;
    }

    function moverJugador() {
        grafo = new Grafo();
        const jugadorCercano = conectarJugadoresConPelota();
        const field = document.querySelector('.field');
        const fieldPos = field.getBoundingClientRect();
        const posicionPelota = obtenerPosicionPelota();

        if (jugadorCercano && posicionPelota) {
            const jugadorPos = jugadorCercano.getBoundingClientRect();

            const offsetX = posicionPelota.x;
            const offsetY = posicionPelota.y;

            jugadorCercano.setAttribute('data-x', offsetX)
            jugadorCercano.setAttribute('data-y', offsetY)


            jugadorCercano.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
        return jugadorCercano;
    }

    Grafo.prototype.dijkstra = function (inicio) {
        const distancias = {};
        const visitados = {};
        const nodos = this.nodos.map(nodo => nodo.id);

        nodos.forEach(nodo => {
            distancias[nodo] = {
                distancia: Infinity,
                camino: [] // array pa almacenar el camino
            };
            visitados[nodo] = false;
        });

        distancias[inicio.id] = {
            distancia: 0,
            camino: [inicio.id]
        };

        while (true) {
            let nodoActual = null;
            let distanciaMinima = Infinity;

            nodos.forEach(nodo => {
                if (!visitados[nodo] && distancias[nodo].distancia < distanciaMinima) {
                    nodoActual = nodo;
                    distanciaMinima = distancias[nodo].distancia;
                }
            });

            if (nodoActual === null || distancias[nodoActual].distancia === Infinity) {
                break;
            }

            visitados[nodoActual] = true;

            this.aristas.forEach(arista => {
                if (arista.jugadorOrigen === nodoActual) {
                    const distancia = distancias[nodoActual].distancia + arista.peso;

                    if (distancia < distancias[arista.jugadorDestino].distancia) {
                        distancias[arista.jugadorDestino] = {
                            distancia: distancia,
                            camino: [...distancias[nodoActual].camino, arista.jugadorDestino]
                        };
                    }
                }
            });
        }

        return distancias;
    };

    function conectarPelotaConCamino(camino) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        let ultimoNodo;
        
        const field = document.querySelector('.field');
        const fieldPos = field.getBoundingClientRect();
    
        // Conectar todos los nodos en el camino
        for (let i = 0; i < camino.length - 1; i++) {
            const nodoActualId = camino[i];
            const nodoSiguienteId = camino[i + 1];
    
            const nodoActual = document.getElementById(nodoActualId);
            const nodoSiguiente = document.getElementById(nodoSiguienteId);
    
            if (nodoActual && nodoSiguiente) {
                const nodoActualPos = nodoActual.getBoundingClientRect();
                const nodoSiguientePos = nodoSiguiente.getBoundingClientRect();
    
                const nodoActualCenterX = nodoActualPos.left - fieldPos.left + nodoActualPos.width / 2;
                const nodoActualCenterY = nodoActualPos.top - fieldPos.top + nodoActualPos.height / 2;
    
                const nodoSiguienteCenterX = nodoSiguientePos.left - fieldPos.left + nodoSiguientePos.width / 2;
                const nodoSiguienteCenterY = nodoSiguientePos.top - fieldPos.top + nodoSiguientePos.height / 2;
    
                // Dibujar la línea de conexión en el canvas
                context.beginPath();
                context.moveTo(nodoActualCenterX, nodoActualCenterY); // Mover al centro del nodo actual
                context.lineTo(nodoSiguienteCenterX, nodoSiguienteCenterY); // Línea al centro del nodo siguiente
                context.strokeStyle = 'yellow';
                context.lineWidth = 3;
                context.stroke();
            }
            ultimoNodo = nodoActual;
        }
    
        // Conectar el último nodo en el camino con la portería

        const ultimoNodoPos = ultimoNodo.getBoundingClientRect();
        const ultimoNodoCenterX = ultimoNodoPos.left - fieldPos.left + ultimoNodoPos.width / 2;
        const ultimoNodoCenterY = ultimoNodoPos.top - fieldPos.top + ultimoNodoPos.height / 2;

        const porteriaPos = porteria.getBoundingClientRect();
        const porteriaCenterX = porteriaPos.left - fieldPos.left + porteriaPos.width / 2;
        const porteriaCenterY = porteriaPos.top - fieldPos.top + porteriaPos.height / 2;


        // Dibujar la línea de conexión desde el último nodo hasta la posición de la portería
        context.beginPath();
        context.moveTo(ultimoNodoCenterX, ultimoNodoCenterY);
        context.lineTo(porteriaCenterX, porteriaCenterY);
        context.strokeStyle = 'yellow';
        context.lineWidth = 3;
        context.stroke();
    }


    $("#btnCalcRoute").click(function (e) {
        var jugadorInicio = moverJugador();

        if (jugadorInicio) {
            var resultadosDijkstra = grafo.dijkstra(jugadorInicio);
            console.log('Distancias mínimas:', resultadosDijkstra);

            // Encontrar el camino hacia la portería
            const caminoHaciaPorteria = resultadosDijkstra['porteria'].camino;

            if (caminoHaciaPorteria.length === 0) {
                console.log('No hay ruta a la portería.');
            } else {
                console.log('Camino hacia la portería:', caminoHaciaPorteria);
                console.log('La distancia mínima a la portería es: ' + resultadosDijkstra['porteria'].distancia);
                conectarPelotaConCamino(caminoHaciaPorteria);
            }
        } else {
            console.log('No se puede determinar el jugador de inicio.');
        }
    });



    const jugadores = document.querySelectorAll('.player');
    inicializarArrastre();
    jugadorConBalon = moverJugador();

    console.log(`El jugador con el balón es el que tiene el ID: ${jugadorConBalon.id}`);
    console.log(grafo);
}