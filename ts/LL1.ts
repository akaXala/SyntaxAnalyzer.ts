import * as fs from 'fs';
import * as path from 'path';
import { Stack } from '@/ts/tools/Stack';

class LL1 {
  parsingTable: { [nonTerminal: string]: { [terminal: string]: string[] } } = {};
  stack: Stack<string>;
  inputString: string[] = [];


  /*
  Conjuntos esperados por Grammar.ts

  TABLA DE PARSING O DE VALIDACIÓN DE GRAMÁTICA LL(1)
  File: /ts/output/parsingTable.json

  */

  // GRAMATICA DE ARITMÉTICA
  
  firstSets: { [key: string]: Set<string> } = {
    E: new Set(['(', 'id']),
    Ep: new Set(['+', 'Epsilon']),
    T: new Set(['(', 'id']),
    Tp: new Set(['*', 'Epsilon']),
    F: new Set(['(', 'id']),
  };

  followSets: { [key: string]: Set<string> } = {
    E: new Set(['$', ')']),
    Ep: new Set(['$', ')']),
    T: new Set(['+', '$', ')']),
    Tp: new Set(['+', '$', ')']),
    F: new Set(['*', '+', '$', ')']),
  };

  grammar: { [nonTerminal: string]: string[][] } = {
    E: [['T', 'Ep']],
    Ep: [['+', 'T', 'Ep'], ['Epsilon']],
    T: [['F', 'Tp']],
    Tp: [['*', 'F', 'Tp'], ['Epsilon']],
    F: [['(', 'E', ')'], ['id']],
  };
  



  // GRAMATICA DE IF-ELSE
  /*
  firstSets: { [key: string]: Set<string> } = {
    S: new Set(['if', 'id']),
    C: new Set(['id']),
    A: new Set(['id']),
  };
  
  followSets: { [key: string]: Set<string> } = {
    S: new Set(['$', 'else']),
    C: new Set(['then']),
    A: new Set(['$', 'else']),
  };
  
  grammar: { [nonTerminal: string]: string[][] } = {
    S: [['if', 'C', 'then', 'S', 'else', 'S'], ['A']],
    C: [['id', '=', 'id']],
    A: [['id', ':=', 'id']],
  };
  */
  




 // GRAMATICA DE LISTAS
 /*
 firstSets: { [key: string]: Set<string> } = {
  L: new Set(['id']),
  Lp: new Set([',', 'Epsilon']),
};

followSets: { [key: string]: Set<string> } = {
  L: new Set(['$', ',']),
  Lp: new Set(['$', ',']),
};

grammar: { [nonTerminal: string]: string[][] } = {
  L: [['id', 'Lp']],
  Lp: [[',', 'id', 'Lp'], ['Epsilon']],
};
*/




// GRAMATICA DE EXPRESIONES BOOLEANAS
/*
firstSets: { [key: string]: Set<string> } = {
  B: new Set(['id']),
  Bp: new Set(['and', 'Epsilon']),
  L: new Set(['id']),
};

followSets: { [key: string]: Set<string> } = {
  B: new Set(['$', ')']),
  Bp: new Set(['$', ')']),
  L: new Set(['$', 'and', ')']),
};

grammar: { [nonTerminal: string]: string[][] } = {
  B: [['L', 'Bp']],
  Bp: [['and', 'L', 'Bp'], ['Epsilon']],
  L: [['id']],
};
*/



// GRAMATICA DE WHILE
/*
firstSets: { [key: string]: Set<string> } = {
  S: new Set(['while', 'id']),
  C: new Set(['id']),
  A: new Set(['id']),
};

followSets: { [key: string]: Set<string> } = {
  S: new Set(['$', 'do']),
  C: new Set(['do']),
  A: new Set(['$', 'do']),
};

grammar: { [nonTerminal: string]: string[][] } = {
  S: [['while', 'C', 'do', 'S'], ['A']],
  C: [['id', '>', 'id']],
  A: [['id', ':=', 'id']],
};
*/



  constructor(private outputDir: string = './') {
    this.stack = new Stack<string>();
  }

/*

### 1. generateParsingTable()
Este método construye la tabla de parsing LL(1), que es esencial para que el analizador sintáctico sepa qué reglas aplicar en cada paso del análisis.

#### Pasos detallados:

1. Inicialización de la tabla:
   typescript
   const table: { [nonTerminal: string]: { [terminal: string]: string[] } } = {};
   
   Se crea una tabla vacía, que tendrá como claves los no terminales de la gramática y, para cada uno de ellos, un conjunto de entradas que indican qué producción aplicar para cada terminal posible.

2. Recorrer cada no terminal y sus producciones:
   typescript
   for (const [nonTerminal, productions] of Object.entries(this.grammar)) {
     table[nonTerminal] = {};
   
   La gramática está almacenada como un objeto donde cada clave es un no terminal y su valor es un arreglo de producciones. Por ejemplo, E: [['T', 'Ep']].

3. Procesar las producciones para cada no terminal:
   Cada producción de un no terminal es analizada para calcular qué terminales pueden aparecer en el inicio de una derivación a partir de esa producción. Esto se hace utilizando el conjunto First.

   - Para cada producción, obtiene su conjunto First mediante la función getFirstSet:
     typescript
     const firstSet = this.getFirstSet(production);
     

   - Si el conjunto First de la producción contiene terminales, se agregan a la tabla:
     typescript
     for (const terminal of firstSet) {
       if (terminal !== 'Epsilon') {
         table[nonTerminal][terminal] = production;
       }
     }
     

     Es decir, se agregan las producciones a la tabla para cada terminal que esté en el conjunto First de la producción. Si un no terminal produce una secuencia que empieza con un terminal, la tabla indica que esa producción se debe aplicar cuando se encuentre ese terminal en la entrada.

   - Manejo de Epsilon: Si un conjunto First contiene Epsilon, entonces debemos considerar los terminales del conjunto Follow del no terminal. Esto se hace para manejar el caso en que la producción puede generar una secuencia vacía.

     typescript
     if (firstSet.has('Epsilon')) {
       const followSet = this.followSets[nonTerminal];
       for (const terminal of followSet) {
         table[nonTerminal][terminal] = ['Epsilon'];
       }
     }
     

     En este paso, se agrega la producción Epsilon a la tabla para todos los terminales en el conjunto Follow de ese no terminal. Esto permite que el analizador maneje producciones que pueden ser vacías (como Epsilon).

4. Guardar la tabla de parsing:
   Finalmente, la tabla generada se guarda como un archivo JSON en el directorio especificado (outputDir), lo que permite almacenarla y usarla posteriormente en el proceso de análisis sintáctico.

   typescript
   fs.writeFileSync(filePath, JSON.stringify(this.parsingTable, null, 2), 'utf-8');


*/
  generateParsingTable(): void {
    const table: { [nonTerminal: string]: { [terminal: string]: string[] } } = {};

    // Inicializar la tabla con un objeto vacío para cada no terminal
    for (const [nonTerminal, productions] of Object.entries(this.grammar)) {
      table[nonTerminal] = {};

      for (const production of productions) {
        // Obtener el conjunto first de la producción
        const firstSet = this.getFirstSet(production);

        // Agregar la producción a la tabla para cada terminal en el conjunto first
        for (const terminal of firstSet) {

          // Si el terminal es Epsilon, no agregarlo a la tabla
          if (terminal !== 'Epsilon') {
            table[nonTerminal][terminal] = production;
          }
        }

        // Si Epsilon está en el conjunto first, agregar la producción a la tabla para cada terminal en el conjunto follow
        if (firstSet.has('Epsilon')) {
          const followSet = this.followSets[nonTerminal];
          for (const terminal of followSet) {

            // Si el terminal es Epsilon, no agregarlo a la tabla
            table[nonTerminal][terminal] = ['Epsilon'];
          }
        }
      }
    }

    // Guardar la tabla de parsing
    this.parsingTable = table;

    // Guardar la tabla de parsing en un archivo JSON
    const filePath = path.join(this.outputDir, 'parsingTable.json');
    fs.writeFileSync(filePath, JSON.stringify(this.parsingTable, null, 2), 'utf-8');
    console.log(`Tabla de parsing guardada en: ${filePath}`);
  }


  /*
  Calcula el conjunto First de una producción específica.

  Itera sobre los símbolos de la producción:
  Si es un terminal, lo agrega directamente al conjunto First.
  Si es un no terminal, agrega todos los terminales de su conjunto First. Si contiene Epsilon, continúa con el siguiente símbolo de la producción.
  Si el símbolo es Epsilon, lo agrega al conjunto First.
  Retorna el conjunto: Devuelve el conjunto First de la producción.

  */
  private getFirstSet(production: string[]): Set<string> {
    const firstSet = new Set<string>();

    // Iterar sobre los símbolos de la producción
    for (const symbol of production) {
      // Si el símbolo es un terminal, agregarlo al conjunto first y detener la iteración
      if (this.firstSets[symbol]) {
        for (const terminal of this.firstSets[symbol]) {
          firstSet.add(terminal);
        }

        // Si Epsilon no está en el conjunto first del símbolo, detener la iteración
        if (!this.firstSets[symbol].has('Epsilon')) {
          break;
        }
        // Si el símbolo es un no terminal, agregar el conjunto first del no terminal al conjunto first de la producción
      } else {
        firstSet.add(symbol);
        break;
      }
    }

    return firstSet;
  }

  parse(input: string): void {
    this.stack.clear(); // Limpia la pila antes de usarla
    this.stack.push('$'); // Agrega el símbolo de fin de cadena a la pila
    const startSymbol = Object.keys(this.parsingTable)[0];
    this.stack.push(startSymbol);
    this.inputString = input.split(' ');
    this.inputString.push('$'); // Agrega el símbolo de fin de cadena al final de la cadena de entrada

    const colWidths = {
      pila: 30,
      entrada: 30,
      accion: 40,
    };

    const formatRow = (pila: string, entrada: string, accion: string): string => {
      return (
        pila.padEnd(colWidths.pila) +
        entrada.padEnd(colWidths.entrada) +
        accion.padEnd(colWidths.accion)
      );
    };

    console.log(formatRow('Pila', 'Entrada', 'Acción'));
    console.log('-'.repeat(colWidths.pila + colWidths.entrada + colWidths.accion));


    while (!this.stack.isEmpty()) {
      const stackTop = this.stack.peek()!;
      const inputSymbol = this.inputString[0];
      let action = '';

      // Actualizamos aquí: convertimos la pila en una cadena legible
      console.log(
        formatRow(this.stack.storage.join(' '), this.inputString.join(' '), action)
      );

      // Si el símbolo en el tope de la pila y el símbolo de entrada son iguales a '$', aceptar
      if (stackTop === '$' && inputSymbol === '$') {
        action = 'Aceptar';
        console.log(
          formatRow(this.stack.storage.join(' '), this.inputString.join(' '), action)
        );
        break;

        // Si el símbolo en el tope de la pila y el símbolo de entrada son iguales, desapilar y avanzar
      } else if (stackTop === inputSymbol) {
        this.stack.pop();
        this.inputString.shift();
        action = `Coincidir '${inputSymbol}'`;

        // Si el símbolo en el tope de la pila es un no terminal
      } else if (this.isNonTerminal(stackTop)) {
        const production = this.parsingTable[stackTop][inputSymbol];
        // Si la producción existe en la tabla de parsing, desapilar y apilar la producción
        if (production) {
          this.stack.pop();
          // Si la producción no es Epsilon, apilar los símbolos de la producción en orden inverso
          if (!(production.length === 1 && production[0] === 'Epsilon')) {
            for (let i = production.length - 1; i >= 0; i--) {
              this.stack.push(production[i]);
            }
          }
          action = `${stackTop} → ${production.join(' ')}`;
        } else {
          action = `Error: no se puede emparejar '${stackTop}' con '${inputSymbol}'`;
          console.error(action);
          console.log(
            formatRow(this.stack.storage.join(' '), this.inputString.join(' '), action)
          );
          break;
        }
      } else {
        action = `Error: símbolo inesperado '${stackTop}'`;
        console.error(action);
        console.log(
          formatRow(this.stack.storage.join(' '), this.inputString.join(' '), action)
        );
        break;
      }

      console.log(
        formatRow(this.stack.storage.join(' '), this.inputString.join(' '), action)
      );
    }
  }

  isNonTerminal(symbol: string): boolean {
    return this.parsingTable.hasOwnProperty(symbol);
  }
}

function testLL1(): void {
  const outputDir = './ts/output'; // Directorio donde se guardará el JSON
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const parser = new LL1(outputDir);
  parser.generateParsingTable();

  // input de aritmética
  const inputString = 'id + id * id';
  
  // input de if-else
  //const inputString = 'if id = id then id := id else id := id';

  // input de listas
  //const inputString = 'id , id , id';

  // input de expresiones booleanas
  //const inputString = 'id and id and id';

  // input de while
  // const inputString = 'while id > id do id := id';


  parser.parse(inputString);
}

export { LL1 };
export { testLL1 };