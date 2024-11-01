// Prueba2

class prueba2 {
    mundo: Set<string> = new Set();

    constructor() {
        this.mundo.add("mundo");
    }

    getMundo(): Set<string> {
        return this.mundo;
    }
}

export default prueba2;