var sudoku = null;
var configSudoku = {
    chart: {
        container: "#flujoEfectuado",
        connectors: {
            type: "curve",
            style: {
                "stroke": "black",
                "stroke-width": 2,
                "arrow-end": "block-wide-long"
            }
        },
        callback: {
            onTreeLoaded: function() {
                $("#botonBuscarSolucion, #botonLimpiarTablero").prop("disabled", false);
                $("#imagenCargando").css("visibility", "hidden");
                
                $("#checkValorInformados").prop("disabled", false);
                $("#imagenCargandoCheckbox").css("visibility", "hidden");

                const $oNodes = $(".Treant .node");
                $oNodes.on("click", function (oEvent) {
                    const $oNode = $(this);

                    let infoNodo = $oNode.data("treenode").text;
                    imprimirTableroHTMLPopup(
                        Sudoku.armarMatrizPorPasos(infoNodo.x, infoNodo.y, infoNodo.valor, infoNodo.tipo, infoNodo.padre, infoNodo.observacion, infoNodo.celdaObservacion),
                        [infoNodo.x, infoNodo.y],
                        infoNodo.observacion
                    );
                });
            }
        }
    },
    nodeStructure: null
};

$().ready(function() {
    let datosDefecto = [
        [null, null,    6,    8, null, null, null,    9, null],
        [null,    8,    3,    4,    5, null, null,    6,    2],
        [   9, null, null,    2,    6, null,    8, null, null],
        
        [null, null, null, null,    8, null, null,    1,    9],
        [null,    9, null,    6,    4,    5, null, null, null],
        [null,    3, null, null, null, null,    6,    7, null],
        
        [null, null, null, null,    2, null, null, null, null],
        [   2, null,    9, null, null, null, null,    4,    3],
        [null, null,    5, null, null,    6,    9, null, null]];
        
    imprimirTableroHTML($("#tableroEntrada"), datosDefecto, "Tablero Inicial", null, null, true);
});

function inputOnFocus() {
    $(this).select();
}

function inputKeyPress(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function inputOnChange() {
    let valor = $(this).val().trim();
    if (valor.length > 0) {
        $(this).parent().addClass("movimientoInformado");
    } else {
        $(this).parent().removeClass("movimientoInformado");
    }
}

function checkboxOnChange(element) {
    $("#flujoEfectuado").empty();
    $("#checkValorInformados").prop("disabled", true);
    $("#imagenCargandoCheckbox").css("visibility", "visible");

    setTimeout(function () {
        if ($(element).is(":checked")) {
            configSudoku.nodeStructure = sudoku.primerMovimiento;
            let miDiagrama = new Treant(configSudoku, null, $);
        } else {
            let primerMovimiento = _.cloneDeep(sudoku.primerMovimiento);
            while (primerMovimiento.children.length === 1 && primerMovimiento.text.tipo === 1) {
                primerMovimiento = primerMovimiento.children[0];
            }

            let movimientoAuxiliar = primerMovimiento;
            let movimientoNoInformado = primerMovimiento;
            while (movimientoAuxiliar.children.length === 1) {
                movimientoAuxiliar = movimientoAuxiliar.children[0];
                if (movimientoAuxiliar.text.tipo === 1 && movimientoAuxiliar.text.observacion === undefined) {
                    movimientoNoInformado.children = movimientoAuxiliar.children;
                } else {
                    movimientoNoInformado = movimientoAuxiliar;
                }
            }

            configSudoku.nodeStructure = primerMovimiento;
            let miDiagrama = new Treant(configSudoku, null, $);
        }
    }, 500);
}

function buscarSolucion() {
    $("#tableroResultado").empty();
    $("#contenedorFlujo").hide();

    $("#botonBuscarSolucion, #botonLimpiarTablero").prop("disabled", true);
    $("#imagenCargando").css("visibility", "visible");

    setTimeout(function () {
        let matriz = obtenerValores();
        sudoku = new Sudoku(matriz);

        if (sudoku.error === null) {
            imprimirTableroHTML($("#tableroResultado"), sudoku.matrizFinal, "Resultado");
        } else {
            imprimirTableroError($("#tableroResultado"), sudoku.primerMovimiento, "Resultado", "¡No se encontró solución para el sudoku!");
        }

        $("#contenedorFlujo").show();
        checkboxOnChange($("#checkValorInformados"));
    }, 500);
}

function obtenerValores() {
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

    let filas = $("#tableroEntrada table tr");
    for (let y = 0; y < filas.length; y++) {
        let celdas = $(filas[y]).find("td input");
        for (let x = 0; x < celdas.length; x++) {
            matriz[y - 1][x] = $(celdas[x]).val().trim().length > 0 ? parseInt($(celdas[x]).val().trim()) : null;
        }
    }

    return matriz;
}

function limpiarTablero() {
    $("#tableroEntrada input").val("").change();
}

function imprimirTableroHTMLPopup(matriz, marcarCelda, observacion = null) {
    $("#popupFondoOscuro").remove();
    $("#popupMatrizParcial").remove();

    let fondoOscuro = $("<div></div>")
        .attr("id", "popupFondoOscuro")
        .on("click", function() {
            $("#popupFondoOscuro").remove();
            $("#popupMatrizParcial").remove();
        });

    let matrizParcial = $("<div></div>").attr("id", "popupMatrizParcial");
    if (observacion === null) {
        matrizParcial.addClass("popupMatrizParcialSinObservacion");
    } else {
        matrizParcial.addClass("popupMatrizParcialConObservacion");
    }
    imprimirTableroHTML(matrizParcial, matriz, "Resolución Parcial", observacion, null, false, marcarCelda);

    $("body").append(fondoOscuro);
    $("body").append(matrizParcial);
}

function imprimirTableroError(elemento, primerMovimiento, textoTitulo, textoSubtitulo) {
    if (primerMovimiento !== null) {
        while (primerMovimiento.children.length > 0) {
            primerMovimiento = primerMovimiento.children[primerMovimiento.children.length - 1];
        }
    }

    let matriz = Sudoku.armarMatrizPorPasos(
        primerMovimiento.text.x, 
        primerMovimiento.text.y, 
        primerMovimiento.text.valor, 
        primerMovimiento.text.tipo, 
        primerMovimiento.text.padre, 
        primerMovimiento.text.observacion, 
        primerMovimiento.text.celdaObservacion);

    imprimirTableroHTML(elemento, matriz, textoTitulo, textoSubtitulo, primerMovimiento.text.observacion);
}

function imprimirTableroHTML(elemento, matriz, textoTitulo = null, textoSubtitulo = null, textoSubSubTitulo = null, editable = false, marcarCelda = null) {
    if (textoTitulo !== null) {
        let textoTituloHTML = $("<h1></h1>").text(textoTitulo);
        elemento.append(textoTituloHTML);
    }

    if (textoSubtitulo !== null) {
        let textoSubtituloHTML = $("<h3></h3>").text(textoSubtitulo);
        elemento.append(textoSubtituloHTML);
    }

    if (textoSubSubTitulo !== null) {
        let textoSubSubTituloHTML = $("<h4></h4>").text(textoSubSubTitulo);
        elemento.append(textoSubSubTituloHTML);
    }

    let tablaHTML = $("<table></table>");
    elemento.append(tablaHTML);

    // Fila para las letras A, B, C...
    let filaLetras = $("<tr></tr>");
    tablaHTML.append(filaLetras);
    for (let x = 0; x <= matriz[0].length; x++) {
        let columnaLetra = $("<td></td>").text(Sudoku.traducirALetra(x));
        filaLetras.append(columnaLetra);
    }

    let celdasAsociadasProblemas = new Array();
    for (let y = 0; y < matriz.length; y++) {
        let filaHTML = $("<tr></tr>").addClass("filaSudoku");
        tablaHTML.append(filaHTML);

        let columnaNumeros = $("<td></td>").addClass("celdaIndice");
        columnaNumeros.text(y + 1);
        filaHTML.append(columnaNumeros);

        for (let x = 0; x < matriz[y].length; x++) {
            let columnaHTML = $("<td></td>").addClass("columnaSudoku");

            filaHTML.append(columnaHTML);
            
            if (editable) {
                let inputHTML = $("<input></input>")
                    .attr("type", "text")
                    .attr("maxlength", "1")
                    .focus(inputOnFocus)
                    .keypress(function(event) { return inputKeyPress(event); })
                    .change(inputOnChange)
                    .val(matriz[y][x] !== null ? matriz[y][x] : "");

                if (inputHTML.val().trim().length > 0) {
                    columnaHTML.addClass("movimientoInformado");
                } 

                columnaHTML.append(inputHTML);
                
                columnaHTML.click(function() {
                    $(this).find("input").focus();
                });
                columnaHTML.addClass("punteroTexto");
            } else {
                let valor = "";
                if (matriz[y][x] != null) {
                    valor = matriz[y][x].toString().replace(/\,/g, ", ");
                    
                    if (matriz[y][x] instanceof Movimiento) {
                        switch(matriz[y][x].text.tipo) {
                            case TIPO_INFORMADO:
                                columnaHTML.addClass("movimientoInformado");
                                break;
                            case TIPO_DEDUCIDO:
                                columnaHTML.addClass("movimientoDeducido");
                                break;
                            case TIPO_PRUEBA:
                                columnaHTML.addClass("movimientoPrueba");
                                break;
                        }

                        if (matriz[y][x].text.observacion !== undefined && matriz[y][x].text.tipo === TIPO_INFORMADO) {
                            celdasAsociadasProblemas.push([matriz[y][x].text.x, matriz[y][x].text.y]);
                        }

                        if (matriz[y][x].text.celdaObservacion !== null && matriz[y][x].text.celdaObservacion !== undefined) {
                            celdasAsociadasProblemas.push(matriz[y][x].text.celdaObservacion);
                        }
                    }
                } 
                let textoHTML = $("<p></p>").text(valor);
                columnaHTML.append(textoHTML);
            }

            if (marcarCelda !== null && marcarCelda[0] === x && marcarCelda[1] == y) {
                columnaHTML.addClass("celdaMarcada");
            }
        }
    }

    let listaFilasSudoku = tablaHTML.find(".filaSudoku");
    for (let y = 0; y < listaFilasSudoku.length; y++) {
        let listaColumnasSudoku = $(listaFilasSudoku[y]).find(".columnaSudoku");
        for (let x = 0; x < listaColumnasSudoku.length; x++) {
            for (let i = 0; i < celdasAsociadasProblemas.length; i++) {
                if (celdasAsociadasProblemas[i][0] === x && celdasAsociadasProblemas[i][1] === y) {
                    $(listaColumnasSudoku[x]).addClass("movimientoObservado");
                }
            }
        }
    }
    
    if (editable) {
        let imagenCargando = $("<img></img>")
            .attr("id", "imagenCargando")
            .attr("src", "images/cargando.gif");
        elemento.append(imagenCargando);

        let botonProcesarHTML = $("<button></button>")
            .attr("id", "botonBuscarSolucion")
            .text("Buscar Solución...")
            .on("click", buscarSolucion);
        elemento.append(botonProcesarHTML);

        let botonLimpiarTablero = $("<button></button>")
            .attr("id", "botonLimpiarTablero")
            .text("Limpiar Tablero...")
            .on("click", limpiarTablero);
        elemento.append(botonLimpiarTablero);
    }
}