const TIPO_INFORMADO = 1;
const TIPO_DEDUCIDO = 2;
const TIPO_PRUEBA = 3;

class Movimiento {
    constructor(x, y, valor, tipo, padre) {
        // Para diagrama Trent...
        this.text = {
            x: x,
            y: y,
            valor: valor,
            tipo: tipo,
            padre: padre
        };
        this.innerHTML = "<p>" + Sudoku.traducirALetra(x + 1) + (y + 1) + ": " + valor + "</p>";
        this.children = new Array();
        
        switch(tipo) {
            case TIPO_INFORMADO:
                this.HTMLclass = "movimientoInformado";
                break;
            case TIPO_DEDUCIDO:
                this.HTMLclass = "movimientoDeducido";
                break;
            case TIPO_PRUEBA:
                this.HTMLclass = "movimientoPrueba";
                break;
        }
    }

    agregarHijo(hijo) {
        this.children.push(hijo);
    }

    observar(observacion, celdaObservacion = null) {
        this.text.observacion = observacion;
        this.text.celdaObservacion = celdaObservacion;
        this.HTMLclass = this.HTMLclass + " movimientoObservado";
    }

    toString() {
        return this.text.valor.toString();
    }
}