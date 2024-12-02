import * as fs from 'fs';
import * as path from 'path';
import { Stack } from '@/ts/tools/Stack';
import { SyntaxAnalyzer } from '@/ts/SyntaxAnalyzer';

class LL1 {
  parsingTable: { [nonTerminal: string]: { [terminal: string]: string[] } } = {};
  stack: Stack<string>;
  inputString: string[] = [];


  /*
  Conjuntos esperados por Grammar.ts

  TABLA DE PARSING O DE VALIDACIÓN DE GRAMÁTICA LL(1)
  File: /ts/output/parsingTable.json

  */


  firstSets: { [key: string]: Set<string> } = {
  };

  followSets: { [key: string]: Set<string> } = {
  };

  grammar: { [nonTerminal: string]: Array<Array<string>> } = {
  };


  // GRAMATICA DE ARITMÉTICA

  //firstSets: { [key: string]: Set<string> } = {
  //  E: new Set(['(', 'id']),
  //  Ep: new Set(['+', 'EPSILON']),
  //  T: new Set(['(', 'id']),
  //  Tp: new Set(['*', 'EPSILON']),
  //  F: new Set(['(', 'id']),
  //};

  //followSets: { [key: string]: Set<string> } = {
  //  E: new Set(['$', ')']),
  //  Ep: new Set(['$', ')']),
  //  T: new Set(['+', '$', ')']),
  //  Tp: new Set(['+', '$', ')']),
  //  F: new Set(['*', '+', '$', ')']),
  //};

  //grammar: { [nonTerminal: string]: string[][] } = {
  //  E: [['T', 'Ep']],
  //  Ep: [['+', 'T', 'Ep'], ['EPSILON']],
  //  T: [['F', 'Tp']],
  //  Tp: [['*', 'F', 'Tp'], ['EPSILON']],
  //  F: [['(', 'E', ')'], ['id']],
  //};




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
   Lp: new Set([',', 'EPSILON']),
 };
 
 followSets: { [key: string]: Set<string> } = {
   L: new Set(['$', ',']),
   Lp: new Set(['$', ',']),
 };
 
 grammar: { [nonTerminal: string]: string[][] } = {
   L: [['id', 'Lp']],
   Lp: [[',', 'id', 'Lp'], ['EPSILON']],
 };
 */




  // GRAMATICA DE EXPRESIONES BOOLEANAS
  /*
  firstSets: { [key: string]: Set<string> } = {
    B: new Set(['id']),
    Bp: new Set(['and', 'EPSILON']),
    L: new Set(['id']),
  };
  
  followSets: { [key: string]: Set<string> } = {
    B: new Set(['$', ')']),
    Bp: new Set(['$', ')']),
    L: new Set(['$', 'and', ')']),
  };
  
  grammar: { [nonTerminal: string]: string[][] } = {
    B: [['L', 'Bp']],
    Bp: [['and', 'L', 'Bp'], ['EPSILON']],
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
  init(SA: SyntaxAnalyzer): void {
    console.log(SA.G_Rules);
    const Rules = SA.getG_Rules();
    const findNode = (name: string) => Rules.find(r => r.nameSimb.nameSimb === name)?.nameSimb;
    const findNodes = (name: string) => SA.G_Rules.filter(r => r.nameSimb.nameSimb === name)
    const followSets: { [key: string]: Set<string> } = {};
    const firstSets: { [key: string]: Set<string> } = {};
    const grammar: { [nonTerminal: string]: Array<Array<string>> } = {}

    SA.nonTerminal.forEach((nonTerminal) => {
      let nodes = findNodes(nonTerminal);
      let production: string[];
      nodes.forEach((x) => {
        if (x.nameSimb.nameSimb === nonTerminal) {
          if (!grammar[nonTerminal]) grammar[nonTerminal] = []
          production = []
          x.list.forEach((y) => {
            //console.log(y.nameSimb, y.terminal);
            production.push(y.nameSimb)
          });
          //console.log(production);
          grammar[nonTerminal].push(production);
        };
      })
    });
    const noTerminals = [...SA.nonTerminal];
    for (let i = 0; i < noTerminals.length; i++) {

      const node = findNode(noTerminals[i]);
      followSets[noTerminals[i]] = SA.follow(node!);
      firstSets[noTerminals[i]] = SA.first([node!]);
    }
    this.followSets = followSets;
    this.firstSets = firstSets;
    this.grammar = grammar;
    console.log(":::Test:::");
    console.log(this.followSets);
    console.log(this.firstSets);
    console.log(this.grammar);
  }
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

          // Si el terminal es EPSILON, no agregarlo a la tabla
          if (terminal !== 'EPSILON') {
            table[nonTerminal][terminal] = production;
          }
        }

        // Si EPSILON está en el conjunto first, agregar la producción a la tabla para cada terminal en el conjunto follow
        if (firstSet.has('EPSILON')) {
          const followSet = this.followSets[nonTerminal];
          for (const terminal of followSet) {

            // Si el terminal es EPSILON, no agregarlo a la tabla
            table[nonTerminal][terminal] = ['EPSILON'];
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

  private getFirstSet(production: string[]): Set<string> {
    const firstSet = new Set<string>();

    // Iterar sobre los símbolos de la producción
    for (const symbol of production) {
      // Si el símbolo es un terminal, agregarlo al conjunto first y detener la iteración
      if (this.firstSets[symbol]) {
        for (const terminal of this.firstSets[symbol]) {
          firstSet.add(terminal);
        }

        // Si EPSILON no está en el conjunto first del símbolo, detener la iteración
        if (!this.firstSets[symbol].has('EPSILON')) {
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
        if (production) {
          this.stack.pop();
          if (!(production.length === 1 && production[0] === 'EPSILON')) {
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
  const SA = new SyntaxAnalyzer();
  let input = "<S> -> while <C> do <S> | <A>;\n" +
    "<C> -> id > id ;\n" +
    "<A> -> id := id"
  SA.setGrammar(input);
  SA.parse();
  parser.init(SA);
  parser.generateParsingTable();

  // input de aritmética
  //const inputString = 'id + id * id';

  // input de if-else
  //const inputString = 'if id = id then id := id else id := id';

  // input de listas
  //const inputString = 'id , id , id';

  // input de expresiones booleanas
  //const inputString = 'id and id and id';

  // input de while
  const inputString = 'while id > id do id := id';


  parser.parse(inputString);
}

export { LL1 };
export { testLL1 };