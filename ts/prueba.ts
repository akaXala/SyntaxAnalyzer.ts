// Prueba
import prueba2 from "@/ts/tools/prueba2";

class Prueba {
    hola: Set<string> = new Set();
    pr = new prueba2();

    constructor() {
        this.hola.add("Hola ");
    }

    imprimirHolaMundo(): void {
        const hola = Array.from(this.hola).join(''); // Convierte el Set a string
        const mundo = Array.from(this.pr.getMundo()).join(''); // Obtiene el Set de prueba2 y lo convierte a string
        console.log(hola + mundo); // Imprime "Hola mundo"
    }
}

export default Prueba;