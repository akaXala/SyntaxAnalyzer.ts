import { SimbolosEspeciales } from '@/ts/tools/SimbolosEspeciales';
import { Stack } from '@/ts/tools/Stack';

import JSON from '@/ts/AFD/AFD.json';

class LexicAnalyzer {
    private sigma: string;
    private isEdoAcept: boolean;
    private startLexema: number;
    private endLexema: number;
    private currentIndex: number;
    private token: number;
    private stack: Stack<number>; // stack para almacenar los índices
    private lastLexema: string;
    private afdTable: any;
    private tokenOmision: number;

    constructor();
    constructor(afdTable: any);
    constructor(afdTable: any, sigma: string);
    constructor(afdTable?: any, sigma?: string) {
        this.sigma = sigma || "";
        this.isEdoAcept = false;
        this.startLexema = 0;
        this.endLexema = -1;
        this.currentIndex = 0;
        this.token = -1;
        this.stack = new Stack<number>(); // stack para almacenar los índices
        this.lastLexema = "";
        this.afdTable = afdTable || null;
        this.tokenOmision = -2;
    }
    public setTokenOmision(token: number): void {
        this.tokenOmision = token;
    }
    //Retorna la instancia actual de la clase LexicAnalyzer
    public getState(): LexicAnalyzer {
        return this;
    }

    //Establece una instancia de un objeto LexicAnalyzer
    public setState(state: LexicAnalyzer): void {
        this.sigma = state.sigma;
        this.isEdoAcept = state.isEdoAcept;
        this.startLexema = state.startLexema;
        this.endLexema = state.endLexema;
        this.currentIndex = state.currentIndex;
        this.token = state.token;
        this.stack = state.stack;
        this.lastLexema = state.lastLexema;
        this.afdTable = state.afdTable;
        this.tokenOmision = state.tokenOmision;
    }

    // Asigna una tabla de un afd con las clases lexicas
    public setAfdTable(afdTable: any) {
        this.afdTable = afdTable;
        this.setSigma(this.sigma);
        this.tokenOmision = -2;
    }

    // Asigna un sigma para analizar
    public setSigma(sigma: string): void {
        this.sigma = sigma;
        this.isEdoAcept = false;
        this.startLexema = 0;
        this.endLexema = -1;
        this.currentIndex = 0;
        this.token = -1;
        this.stack.clear();
        this.lastLexema = "";
    }
    // Retorna el ultimo lexema analizado
    public yytext(): string {
        return this.lastLexema;
    }

    // Retorna el token del lexema analizado
    public yylex(): number {
        let lexema = "";

        this.stack.push(this.currentIndex);  // Guarda el índice actual en la stack

        if (this.currentIndex >= this.sigma.length) {
            lexema = "FIN";
            this.lastLexema = lexema;
            return SimbolosEspeciales.FIN;
        }

        this.startLexema = this.currentIndex;
        this.isEdoAcept = false;
        this.endLexema = -1;
        this.token = -1;

        let currentState = 0;

        while (this.currentIndex < this.sigma.length) {
            const currentChar = this.sigma.charCodeAt(this.currentIndex);
            //console.log("currentChar: ", String.fromCharCode(currentChar));
            //console.log("currentState: ", currentState);
            const transition = this.afdTable[currentState][currentChar];

            if (transition !== undefined && transition !== -1) {
                if (this.afdTable[transition][256] !== undefined && this.afdTable[transition][256] !== -1) {
                    this.isEdoAcept = true;
                    this.token = this.afdTable[transition][256];
                    this.endLexema = this.currentIndex;
                }
                this.currentIndex++;
                currentState = transition;
                continue;
            }
            break;
        }

        if (!this.isEdoAcept) {
            this.currentIndex = this.startLexema + 1;
            lexema = this.sigma.substring(this.startLexema, this.startLexema + 1);
            this.token = SimbolosEspeciales.TOKENERROR;
            this.lastLexema = lexema;
            return this.token;
        } else {
            lexema = this.sigma.substring(this.startLexema, this.endLexema + 1);
            this.currentIndex = this.endLexema + 1;
            this.lastLexema = lexema;
            //console.log("Token: ", this.token, "Lexema: ", lexema);
            if (this.token === this.tokenOmision)
                return this.yylex();  // Salta los tokens omitidos
            else
                return this.token;
        }
    }

    // Implementación de undoToken
    public undoToken(): boolean {
        if (this.stack.size() > 0) {
            const ultimoIndice = this.stack.pop();
            if (ultimoIndice !== undefined) {
                this.currentIndex = ultimoIndice;
                return true;
            }
        }
        return false;
    }
}

// Funcion de test para probar el analizador lexico
function testLexicAnalyzer(input: string) {  // Modificado para aceptar una cadena de entrada
    const lexicAnalyzer = new LexicAnalyzer(JSON);
    lexicAnalyzer.setSigma(input);  // Establece la cadena de entrada
    let token = lexicAnalyzer.yylex();
    const tokens: string[] = [];  // Array para almacenar los tokens

    while (token !== SimbolosEspeciales.FIN) {
        tokens.push(token.toString());  // Agrega el token al array
        token = lexicAnalyzer.yylex();
    }

    console.log("TokensLA: ", tokens);  // Muestra todos los tokens

    return tokens;  // Retorna el array de tokens

}

// Ejemplo de uso
//testLexicAnalyzer("");  // Llama a la función con una cadena de prueba

export { testLexicAnalyzer };
export { LexicAnalyzer };