import * as fs from 'fs';
import * as path from 'path';
import { Stack } from '@/ts/tools/Stack';
import { SyntaxAnalyzer } from '@/ts/SyntaxAnalyzer';
import { testLexicAnalyzer } from '@/ts/tools/LexicAnalyzer';

// LL1 Parser Class
class LL1 {
  parsingTable: { [nonTerminal: string]: { [terminal: string]: string[] } } = {};
  stack: Stack<string>;
  inputString: string[] = [];

  firstSets: { [key: string]: Set<string> } = {};
  followSets: { [key: string]: Set<string> } = {};
  grammar: { [nonTerminal: string]: Array<Array<string>> } = {};

  terminals: Set<string> = new Set();
  nonTerminals: Set<string> = new Set();

  constructor(private outputDir: string = './') {
    this.stack = new Stack<string>();
  }

  // Initialize the LL1 parser with the syntax analyzer
  init(SA: SyntaxAnalyzer): void {
    const Rules = SA.getG_Rules();

    const findNode = (name: string) =>
      Rules.find((r) => r.nameSimb.nameSimb === name)?.nameSimb;
    const findNodes = (name: string) =>
      SA.G_Rules.filter((r) => r.nameSimb.nameSimb === name);

    const followSets: { [key: string]: Set<string> } = {};
    const firstSets: { [key: string]: Set<string> } = {};
    const grammar: { [nonTerminal: string]: Array<Array<string>> } = {};

    // Build the grammar and collect non-terminals
    SA.nonTerminal.forEach((nonTerminal) => {
      this.nonTerminals.add(nonTerminal); // Collect non-terminals
      let nodes = findNodes(nonTerminal);
      nodes.forEach((x) => {
        if (x.nameSimb.nameSimb === nonTerminal) {
          if (!grammar[nonTerminal]) grammar[nonTerminal] = [];
          const production: string[] = [];
          x.list.forEach((y) => {
            production.push(y.nameSimb);
            // Collect terminals (symbols that are not non-terminals and not EPSILON)
            if (!this.nonTerminals.has(y.nameSimb) && y.nameSimb !== 'EPSILON') {
              this.terminals.add(y.nameSimb);
            }
          });
          grammar[nonTerminal].push(production);
        }
      });
    });

    // Calculate FIRST and FOLLOW sets
    const noTerminals = [...this.nonTerminals];
    for (let i = 0; i < noTerminals.length; i++) {
      const node = findNode(noTerminals[i]);
      followSets[noTerminals[i]] = SA.follow(node!);
      firstSets[noTerminals[i]] = SA.first([node!]);
    }
    this.followSets = followSets;
    this.firstSets = firstSets;
    this.grammar = grammar;
  }

  // Generate the parsing table
  generateParsingTable(): void {
    const table: { [nonTerminal: string]: { [terminal: string]: string[] } } = {};

    for (const [nonTerminal, productions] of Object.entries(this.grammar)) {
      table[nonTerminal] = {};

      for (const production of productions) {
        // Get FIRST set of the production
        const firstSet = this.getFirstSet(production);

        // Add production to the table for each terminal in FIRST set
        for (const terminal of firstSet) {
          if (terminal !== 'EPSILON') {
            table[nonTerminal][terminal] = production;
          }
        }

        // If EPSILON is in FIRST set, add production for each terminal in FOLLOW set
        if (firstSet.has('EPSILON')) {
          const followSet = this.followSets[nonTerminal];
          for (const terminal of followSet) {
            table[nonTerminal][terminal] = ['EPSILON'];
          }
        }
      }
    }

    // Save the parsing table
    this.parsingTable = table;

    // Optionally save the parsing table to a JSON file
    const filePath = path.join(this.outputDir, 'parsingTable.json');
    fs.writeFileSync(filePath, JSON.stringify(this.parsingTable, null, 2), 'utf-8');
    console.log(`Tabla de parsing guardada en: ${filePath}`);
  }

  // Compute FIRST set for a production
  private getFirstSet(production: string[]): Set<string> {
    const firstSet = new Set<string>();

    for (const symbol of production) {
      if (this.firstSets[symbol]) {
        for (const terminal of this.firstSets[symbol]) {
          firstSet.add(terminal);
        }

        if (!this.firstSets[symbol].has('EPSILON')) {
          break;
        }
      } else {
        firstSet.add(symbol);
        break;
      }
    }

    return firstSet;
  }

  // Parse the tokens
  parse(tokens: string[]): void {
    this.stack.clear();
    this.stack.push('$'); // End of input symbol
    const startSymbol = Object.keys(this.parsingTable)[0];
    this.stack.push(startSymbol);
    this.inputString = tokens;
    this.inputString.push('$'); // Add end of input symbol

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

      // Display current stack, input, and action
      console.log(
        formatRow(this.stack.storage.join(' '), this.inputString.join(' '), action)
      );

      if (stackTop === '$' && inputSymbol === '$') {
        action = 'Aceptar';
        console.log(
          formatRow(this.stack.storage.join(' '), this.inputString.join(' '), action)
        );
        break;
      } else if (stackTop === inputSymbol) {
        this.stack.pop();
        this.inputString.shift();
        action = `Coincidir '${inputSymbol}'`;
      } else if (this.nonTerminals.has(stackTop)) {
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
}

// Function to test the LL1 parser with input from the lexical analyzer
function testLL1(inputString: string): void {
  const outputDir = './ts/output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const parser = new LL1(outputDir);
  const SA = new SyntaxAnalyzer();

  // Define your grammar here
  let input =
    '<E> -> <T> <Ep>\n;' +
    '<Ep> -> + <T> <Ep> | EPSILON\n;' +
    '<T> -> <F> <Tp>\n;' +
    '<Tp> -> * <F> <Tp> | EPSILON\n;' +
    '<F> -> ( <E> ) | id;';
  SA.setGrammar(input);
  SA.parse();
  parser.init(SA);
  parser.generateParsingTable();

  // Mapping of tokens from the lexical analyzer to the grammar terminals
  const tokenMap: { [key: string]: string } = {
    '50': 'id',    // '50' is the code for 'id'
    '10': '+',     // '+' operator
    '20': '*',     // '*' operator
    '30': '(',     // '(' left parenthesis
    '40': ')',     // ')' right parenthesis
    // Add other tokens as necessary
  };

  // Get tokens from the lexical analyzer
  const tokensLA = testLexicAnalyzer(inputString); // e.g., returns ["50", "10", "50"]

  // Map tokens to parser terminals
  const parserTokens = tokensLA.map((token) => {
    const terminal = tokenMap[token];
    if (terminal) {
      return terminal;
    } else {
      console.warn(`Advertencia: Token no reconocido: '${token}'`);
      return 'UNKNOWN'; // Agregamos un token 'UNKNOWN' para manejarlo en el parser
    }
    
  });

  // Display the tokens obtained and mapped
  //console.log('Tokens del analizador léxico:', tokensLA);
  console.log('Tokens para el parser:', parserTokens);

  // Parse the tokens
  parser.parse(parserTokens);

  // Additional logic for displaying results or handling errors can be added here
}

export { LL1 };
export { testLL1 };
