class Sudoku {
    constructor(matriz) {
        this.primerMovimiento = null;
        this.matrizInicial = null;
        this.matrizFinal = null;
        this.error = null;
        try {
            let resultadoInicializacion = this.inicializarMatriz(matriz);
            this.matrizInicial = resultadoInicializacion[0];
            this.matrizFinal = this.procesarTablero(this.matrizInicial, resultadoInicializacion[1]);
            if (this.matrizFinal === null) {
                throw "No se encontró resultado posible para el sudoku";
            }
        } catch (err) {
            this.error = err;
        }
    }

    inicializarMatriz(matrizEntrada) {
        if (matrizEntrada.length !== 9) {
            throw "Las dimensiones de la matriz de entrada no son 9 x 9";
        }

        for (let y = 0; y < matrizEntrada.length; y++) {
            if (matrizEntrada[y].length !== 9) {
                throw "Las dimensiones de la matriz de entrada no son 9 x 9";
            }
        }

        let matriz = new Array();
        for (let y = 0; y < 9; y++) {
            let fila = new Array();
            for (let x = 0; x < 9; x++) {
                fila.push([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            }
            matriz.push(fila);
        }

        let movimientoAnterior = null
        for (let y = 0; y < matrizEntrada.length; y++) {
            for (let x = 0; x < matrizEntrada[y].length; x++) {
                if (matrizEntrada[y][x] !== null) {
                    movimientoAnterior = this.setearValor(matriz, x, y, matrizEntrada[y][x], TIPO_INFORMADO, movimientoAnterior);
                    if (this.primerMovimiento === null) {
                        this.primerMovimiento = movimientoAnterior;
                    }
                }
            }
        }

        if (this.primerMovimiento === null) {
            this.primerMovimiento = this.setearValor(matriz, 0, 0, 1, TIPO_DEDUCIDO, null);
            movimientoAnterior = this.primerMovimiento;
        }

        return [matriz, movimientoAnterior];
    }

    procesarTablero(matriz, movimientoAnterior = null) {
        let menorCantidad = this.buscarPosicionMenor(matriz);
        if (menorCantidad != null) {
            for (let i = 0; i < matriz[menorCantidad[1]][menorCantidad[0]].length; i++) {
                let valor = matriz[menorCantidad[1]][menorCantidad[0]][i];
                let posibleMatriz = _.cloneDeep(matriz);
                try {
                    let movimientoPrueba = this.setearValor(posibleMatriz, menorCantidad[0], menorCantidad[1], valor, TIPO_PRUEBA, movimientoAnterior);
                    let matrizResuelta = this.procesarTablero(posibleMatriz, movimientoPrueba);
                    if (matrizResuelta !== null) {
                        return matrizResuelta;
                    }
                } catch (err) {

                }
            }
            return null;
        } else {
            return matriz;
        }
    }

    setearValor(matriz, x, y, v, tipo = TIPO_INFORMADO, movimientoAnterior = null) {
        let movimientoActual = new Movimiento(x, y, v, tipo, movimientoAnterior);
        matriz[y][x] = movimientoActual;

        if (movimientoAnterior !== null) {
            movimientoAnterior.agregarHijo(movimientoActual);
        }

        let listaMovimientosSetear = new Array();
        this.quitarElementoHorizontal(matriz, x, y, v, movimientoActual, listaMovimientosSetear);
        this.quitarElementoVertical(matriz, x, y, v, movimientoActual, listaMovimientosSetear);
        this.quitarElementoCuadrante(matriz, x, y, v, movimientoActual, listaMovimientosSetear);

        let ultimoMovimiento = movimientoActual;
        for (let i = 0; i < listaMovimientosSetear.length; i++) {
            let elemento = listaMovimientosSetear[i];
            ultimoMovimiento = this.setearValor(matriz, elemento.x, elemento.y, elemento.v, TIPO_DEDUCIDO, ultimoMovimiento);
        }

        return ultimoMovimiento;
    }

    quitarElementoHorizontal(matriz, x, y, v, movimientoGenerador, listaMovimientosSetear) {
        for (let xd = 0; xd < 9; xd++) {
            if (xd !== x) {
                let posValor = -1;
                if (matriz[y][xd] instanceof Array) {
                    posValor = matriz[y][xd].indexOf(v);
                } else if (matriz[y][xd] instanceof Movimiento) {
                    posValor = matriz[y][xd].text.valor === v ? 0 : -1;
                }

                if (posValor !== -1) {
                    let ocurrioError = false;
                    if (matriz[y][xd] instanceof Array) {
                        matriz[y][xd].splice(posValor, 1);
                        if (matriz[y][xd].length === 1) {
                            listaMovimientosSetear.push({
                                x: xd,
                                y: y,
                                v: matriz[y][xd][0]
                            });
                        } else if (matriz[y][xd].length === 0) {
                            ocurrioError = true;
                        }
                    } else if (matriz[y][xd] instanceof Movimiento) {
                        ocurrioError = true;
                    }

                    if (ocurrioError) {
                        movimientoGenerador.observar(
                            "En la validación horizontal, la celda " + Sudoku.traducirALetra(xd + 1) + (y + 1) + " quedó sin posibles valores...",
                            [xd, y]);
                        throw movimientoGenerador.observacion;
                    }
                }
            }
        }
    }

    quitarElementoVertical(matriz, x, y, v, movimientoGenerador, listaMovimientosSetear) {
        for (let yd = 0; yd < 9; yd++) {
            if (yd !== y) {
                let posValor = -1;
                if (matriz[yd][x] instanceof Array) {
                    posValor = matriz[yd][x].indexOf(v);
                } else if (matriz[yd][x] instanceof Movimiento) {
                    posValor = matriz[yd][x].text.valor === v ? 0 : -1;
                }

                if (posValor !== -1) {
                    let ocurrioError = false;
                    if (matriz[yd][x] instanceof Array) {
                        matriz[yd][x].splice(posValor, 1);
                        if (matriz[yd][x].length === 1) {
                            listaMovimientosSetear.push({
                                x: x,
                                y: yd,
                                v: matriz[yd][x][0]
                            });
                        } else if (matriz[yd][x].length === 0) {
                            ocurrioError = true;
                        }
                    } else if (matriz[yd][x] instanceof Movimiento) {
                        ocurrioError = true;
                    }

                    if (ocurrioError) {
                        movimientoGenerador.observar(
                            "En la validación por cuadrante, la celda " + Sudoku.traducirALetra(x + 1) + (yd + 1) + " quedó sin posibles valores...",
                            [x, yd]);
                        throw movimientoGenerador.observacion;
                    }
                }
            }
        }
    }

    quitarElementoCuadrante(matriz, x, y, v, movimientoGenerador, listaMovimientosSetear) {
        let cuadranteX = Math.floor(x / 3);
        let cuadranteY = Math.floor(y / 3);
        for (let yd = cuadranteY * 3; yd < (cuadranteY + 1) * 3; yd++) {
            for (let xd = cuadranteX * 3; xd < (cuadranteX + 1) * 3; xd++) {
                if (yd !== y || xd !== x) {
                    let posValor = -1;
                    if (matriz[yd][xd] instanceof Array) {
                        posValor = matriz[yd][xd].indexOf(v);
                    } else if (matriz[yd][xd] instanceof Movimiento) {
                        posValor = matriz[yd][xd].text.valor === v ? 0 : -1;
                    }

                    if (posValor !== -1) {
                        let ocurrioError = false;
                        if (matriz[yd][xd] instanceof Array) {
                            matriz[yd][xd].splice(posValor, 1);
                            if (matriz[yd][xd].length === 1) {
                                listaMovimientosSetear.push({
                                    x: xd,
                                    y: yd,
                                    v: matriz[yd][xd][0]
                                });
                            } else if (matriz[yd][xd].length === 0) {
                                ocurrioError = true;
                            }
                        } else if (matriz[yd][xd] instanceof Movimiento) {
                            ocurrioError = true;
                        }

                        if (ocurrioError) {
                            movimientoGenerador.observar(
                                "En la validación por cuadrante, la celda " + Sudoku.traducirALetra(xd + 1) + (yd + 1) + " quedó sin posibles valores...",
                                [xd, yd]);
                            throw movimientoGenerador.observacion;
                        }
                    }
                }
            }
        }
    }

    buscarPosicionMenor(matriz) {
        let menorCantidad = null;
        for (let y = 0; y < matriz.length; y++) {
            for (let x = 0; x < matriz[y].length; x++) {
                if (matriz[y][x] instanceof Array && matriz[y][x].length > 1) {
                    if (menorCantidad === null || matriz[y][x].length < matriz[menorCantidad[1]][menorCantidad[0]].length) {
                        menorCantidad = [x, y];
                    }
                }
            }
        }
        return menorCantidad;
    }

    static imprimirTablero(matriz, texto) {
        console.log(texto);
        for (let y = 0; y < matriz.length; y++) {
            let impFila = "";
            for (let x = 0; x < matriz[y].length; x++) {
                impFila = impFila + " [" + matriz[y][x].toString().padStart(18) + "]";
            }
            console.log(impFila);
        }
    }

    static armarMatrizPorPasos(x, y, v, tipo, movimientoPadre, observacion, celdaObservacion) {
        let matriz = [
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
        
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
        
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null]
        ];

        if (x !== null && y !== null) {
            matriz[y][x] = new Movimiento(x, y, v, tipo, movimientoPadre);
            matriz[y][x].observar(observacion, celdaObservacion);
        }

        while (movimientoPadre != null) {            
            matriz[movimientoPadre.text.y][movimientoPadre.text.x] = movimientoPadre;
            movimientoPadre = movimientoPadre.text.padre;
        }
        
        return matriz;
    }

    static traducirALetra(x) {
        switch(x) {
            case 1:
                return "A";
            case 2:
                return "B";
            case 3:
                return "C";
            case 4:
                return "D";
            case 5:
                return "E";
            case 6:
                return "F";
            case 7:
                return "G";
            case 8:
                return "H";
            case 9:
                return "I";
            default:
                return "";
        }
    }

    static traducirANumero(x) {
        switch(x) {
            case "A":
                return 1;
            case "B":
                return 2;
            case "C":
                return 3;
            case "D":
                return 4;
            case "E":
                return 5;
            case "F":
                return 6;
            case "G":
                return 7;
            case "H":
                return 8;
            case "I":
                return 9;
            default:
                return null;
        }
    }
}