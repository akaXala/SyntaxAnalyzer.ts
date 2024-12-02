import { LexicAnalyzer } from "./LexicAnalyzer";
import JSON from "@/ts/AFD/Grammar.json"
const DEBUG = false;
/* 

# Clase para el analizador sintáctico:

## Métodos:

First: El primer terminal encontrado en la regla de producción. En caso de que no hayan, se hacen las derivaciones hasta encontrar uno, 
en caso de que ese uno sea epsilon se revisa si hay más derivaciones, si no, se regresa epsilon.
Salida esperada: Set de terminales y/o epsilons.


Follow: El conjunto de terminales que pueden seguir a un no terminal en una derivación. 
Se revisa si el símbolo es el inicial, si lo es, se agrega "$" al conjunto.
Se recorren las reglas de producción, si el símbolo no está en la regla, se pasa a la siguiente.
Si el símbolo está al final de la regla, se revisa si el no terminal es el mismo, si no, se agrega el conjunto Follow del no terminal.

Salida esperada: Set de terminales.

Ejemplo:
E -> E'
E' -> + T E' | epsilon
T -> T'
T' -> * F T' | epsilon
F -> ( E ) | id

Donde el follow de E' es {"$", ")"}
Donde el follow de T' es {"$", "+", ")"}
Donde el follow de E es {"$", ")"}
Donde el follow de T es {"$", "+", ")"}
Donde el follow de F es {"$", "+", "*", ")"}


Simbolos no especiales [\ -:]OR=OR[\?-\[]OR[\]-~]OR[-þ]
Simpolos especiales \\&(<OR>OR\\OR|OR-OR;)
ARROW -&>
NOTERMINAL <&[\ -~]OR[-þ]&>
TERMINAL (\\&(<OR>OR\\OR|OR-))OR([\ -;]OR=OR[\?-\[]OR[\]-~]OR[-þ])
OR \\|
DOTCOMMA \\;
OMIT ((\\ )+)OR(

)


*/
enum TOKEN {
  END = 0,
  NONTERMINAL = 10,
  OR = 20,
  FLECHA = 30,
  EPSILON = 40,
  DOTCOMMA = 50,
  TERMINAL = 60,
  OMIT = 70
}
interface Symbol {
  data: string;
}

class NodeSimb {
  nameSimb: string;
  terminal: boolean;
  // Donde se va a guardar el terminal?

  constructor(nameSimb: string, terminal: boolean) {
    this.nameSimb = nameSimb;
    this.terminal = terminal;
  }
}

class SyntaxAnalyzer {
  // Lista de reglas de producción
  G_Rules: Array<{ nameSimb: NodeSimb; list: NodeSimb[] }>;
  terminal: Set<string>;
  nonTerminal: Set<string>;
  grammar: string;
  LA: LexicAnalyzer;
  numberRules: number;



  constructor(rules?: Array<{ nameSimb: NodeSimb; list: NodeSimb[] }>) {
    //if(DEBUG)console.log(JSON)
    this.G_Rules = rules || [];
    this.grammar = "";
    this.nonTerminal = new Set<string>();
    this.terminal = new Set<string>();
    this.numberRules = 0;
    this.LA = new LexicAnalyzer(JSON);
    this.LA.setTokenOmision(TOKEN.OMIT);
  }
  public setGrammar(grammar: string): void {
    this.grammar = grammar;
    this.LA.setSigma(grammar);
  }

  first(L: NodeSimb[]): Set<string> {
    let R: Set<string> = new Set<string>();
    let L2: NodeSimb[];

    // Caso en que el primer símbolo en L es terminal
    if (L[0].terminal) {
      R.add(L[0].nameSimb);
      return R;
    }

    // Si L[0] es no terminal, se recorren las reglas de producción
    for (let i = 0; i < this.G_Rules.length; i++) {
      if (this.G_Rules[i].nameSimb.nameSimb === L[0].nameSimb) {
        // Donde R es el conjunto de terminales y/o epsilons
        // Añadir el conjunto First de la lista de la regla coincidente
        R = new Set([...R, ...this.first(this.G_Rules[i].list)]);
      }
    }

    // Si R no contiene "Epsilon", retornamos
    if (!R.has("Epsilon")) {
      return R;
    }

    // Si hay un solo elemento en L, retornamos
    if (L.length === 1) {
      return R;
    }

    // Eliminar "Epsilon" y calcular First del resto de la lista
    R.delete("Epsilon");
    // Revisar si es equivalente al metodo de C# de copyto
    L2 = [...L]; // Copia de L
    L2.shift();  // Remover el primer elemento de L 
    R = new Set([...R, ...this.first(L2)]);

    return R;
  }


  follow(simb: NodeSimb): Set<string> {
    let R: Set<string> = new Set<string>();
    let RAux: Set<string>;

    // Agregar "$" si el símbolo es el inicial
    if (simb.nameSimb === this.G_Rules[0].nameSimb.nameSimb) {
      R.add("$");
    }

    for (let i = 0; i < this.G_Rules.length; i++) {
      const rule = this.G_Rules[i];
      const index = rule.list.findIndex((node) => node.nameSimb === simb.nameSimb);

      if (index === -1) {
        continue;
      }

      if (index + 1 === rule.list.length) {
        // Si el símbolo está al final de la regla
        if (rule.nameSimb.nameSimb !== simb.nameSimb) {
          R = new Set([...R, ...this.follow(rule.nameSimb)]);
        }
      } else {
        const LAux = rule.list.slice(index + 1);
        RAux = this.first(LAux);

        if (!RAux.has("Epsilon")) {
          R = new Set([...R, ...RAux]);
        } else {
          RAux.delete("Epsilon");
          R = new Set([...R, ...RAux]);

          if (rule.nameSimb.nameSimb !== simb.nameSimb) {
            R = new Set([...R, ...this.follow(rule.nameSimb)]);
          }
        }
      }
    }

    return R;
  }
  public parse(): boolean {
    if (DEBUG) console.log("I'm in parse");
    if (this.g()) {
      const token = this.LA.yylex();
      if (DEBUG) console.log("\tparse:::G its true and next token is: " + token);
      if (token === TOKEN.END) {
        return true;
      }
    }
    if (DEBUG) console.log("\tparse:::G its false");
    return false;
  }
  private g(): boolean {
    if (DEBUG) console.log("I'm in G");
    if (this.rules()) {
      if (DEBUG) console.log("\tG:::Rules its true");
      return true;
    }
    if (DEBUG) console.log("\tG:::Rules its false");
    return false;
  }
  private rules(): boolean {
    if (DEBUG) console.log("I'm in Rules");
    if (this.rule()) {
      const token: number = this.LA.yylex();
      if (DEBUG) console.log("\trules:::Rule its true and next token is: " + token);
      if (token === TOKEN.DOTCOMMA) {
        if (this.rulesP()) {
          if (DEBUG) console.log("\trules:::RulesP its true");
          return true;
        }
      }
      //this.LA.undoToken()
    }
    if (DEBUG) console.log("\trules:::Rule its false");
    return false
  }

  private rulesP(): boolean {
    if (DEBUG) console.log("I'm in RulesP");
    const currentLA: LexicAnalyzer = new LexicAnalyzer();
    currentLA.setState(this.LA.getState());
    if (this.rule()) {
      if (DEBUG) console.log("\tRulesP:::Rule its true");
      const token: number = this.LA.yylex();
      if (DEBUG) console.log("\tRulesP:::token is: " + token, this.LA.yytext());
      if (token === TOKEN.DOTCOMMA) {
        if (this.rulesP()) {
          if (DEBUG) console.log("\tRulesP:::RulesP its true");
          return true;
        }
      }
      this.LA.undoToken();
      return true;
    }
    if (DEBUG) console.log("\tRulesP:::Rule its false");
    this.LA.setState(currentLA.getState());
    return true;
  }
  private rule(): boolean {
    if (DEBUG) console.log("I'm in Rule");
    const nonTerminal: Symbol = { data: "" };
    if (this.leftSide(nonTerminal)) {
      if (DEBUG) console.log("\tRule:::LeftSide its true");
      const token: number = this.LA.yylex();
      if (DEBUG) console.log("\tRule:::Token: " + token);
      if (token === TOKEN.FLECHA) {
        if (this.rightSides(nonTerminal)) {
          if (DEBUG) console.log("\tRule:::RightSides its true");
          return true;
        }
        if (DEBUG) console.log("\tRule:::RightSides its false");
      }
    }
    if (DEBUG) console.log("\tRule:::LeftSide its false");
    return false;
  }
  private leftSide(nonTerminal: Symbol): boolean {
    if (DEBUG) console.log("I'm in LeftSide");
    const token: number = this.LA.yylex();
    if (DEBUG) console.log("Token: " + token);
    if (token === TOKEN.NONTERMINAL) {
      nonTerminal.data = this.LA.yytext();
      nonTerminal.data = nonTerminal.data.substring(1, nonTerminal.data.length - 1);
      nonTerminal.data.replace(/(?<!\\)\\(?!\\)/g, "");
      this.nonTerminal.add(nonTerminal.data);
      if (DEBUG) console.log("NONTERMINAL: " + nonTerminal.data);
      return true;
    }
    //this.LA.undoToken();
    return false;
  }
  private rightSides(nonTerminal: Symbol): boolean {
    if (DEBUG) console.log("I'm in RightSides");
    const list: NodeSimb[] = new Array<NodeSimb>();
    if (this.rightSide(list)) {
      if (DEBUG) console.log("\tRightSides:::RightSide its true");
      this.G_Rules[this.numberRules++] = { nameSimb: new NodeSimb(nonTerminal.data, false), list: list };
      if (this.rightSidesP(nonTerminal)) {
        if (DEBUG) console.log("\tRightSides:::RightSidesP its true");
        return true;
      }
    }
    return false;
  }
  private rightSidesP(nonTerminal: Symbol): boolean {
    if (DEBUG) console.log("I'm in RightSidesP");
    const list: NodeSimb[] = new Array<NodeSimb>();
    const token: number = this.LA.yylex();
    if (DEBUG) console.log("\tRightSidesP:::Token: " + token);
    if (token === TOKEN.OR) {
      if (this.rightSide(list)) {
        if (DEBUG) console.log("\tRigthSidesP:::RightSide its true");
        this.G_Rules[this.numberRules++] = { nameSimb: new NodeSimb(nonTerminal.data, false), list: list };
        if (this.rightSidesP(nonTerminal)) {
          if (DEBUG) console.log("\tRightSidesP:::RightSidesP its true");
          return true;
        }
      }
      //return false;
    }
    if (DEBUG) console.log("\tRightSidesP:::Undo Token");
    this.LA.undoToken();
    return true;
  }
  private rightSide(list: NodeSimb[]): boolean {
    if (DEBUG) console.log("I'm in RightSide");
    if (this.symbols(list)) {
      if (DEBUG) console.log("\tRightSide:::symbols its true");
      return true;
    }
    if (DEBUG) console.log("\tRightSide:::symbols its false");
    return false;
  }
  private symbols(list: NodeSimb[]): boolean {
    if (DEBUG) console.log("I'm in Symbols");
    const symbol: NodeSimb = new NodeSimb("", false);
    const token: number = this.LA.yylex();
    if (DEBUG) console.log("\tsymbols:::Token: " + token);
    switch (token) {
      case TOKEN.NONTERMINAL:
        symbol.nameSimb = this.LA.yytext();
        symbol.nameSimb = symbol.nameSimb.substring(1, symbol.nameSimb.length - 1);
        symbol.nameSimb.replace(/(?<!\\)\\(?!\\)/g, "");
        if (DEBUG) console.log("\tsymbols:::NONTERMINAL", symbol.nameSimb);
        this.nonTerminal.add(symbol.nameSimb);
        break;
      case TOKEN.EPSILON:
      case TOKEN.TERMINAL:
        symbol.nameSimb = this.LA.yytext();
        symbol.nameSimb.replace(/(?<!\\)\\(?!\\)/g, "");
        symbol.terminal = true;
        if (DEBUG) console.log("\tsymbols:::TERMINAL", symbol.nameSimb);
        this.terminal.add(symbol.nameSimb);
        break;
      default:
        this.LA.undoToken();
        if (DEBUG) console.log("symbols:::Undo Token");
        return false;
    }
    if (this.symbolsP(list)) {
      if (DEBUG) console.log("symbols:::SymbolsP its true");
      list.push(symbol);
      return true;
    }
    if (DEBUG) console.log("symbols:::SymbolsP its false");
    return false;
  }
  private symbolsP(list: NodeSimb[]): boolean {
    if (DEBUG) console.log("I'm in SymbolsP");
    const symbol: NodeSimb = new NodeSimb("", false);
    const token: number = this.LA.yylex();
    if (DEBUG) console.log("\tSymbolsP:::Token: " + token);
    switch (token) {
      case TOKEN.NONTERMINAL:
        symbol.nameSimb = this.LA.yytext();
        symbol.nameSimb = symbol.nameSimb.substring(1, symbol.nameSimb.length - 1);
        symbol.nameSimb.replace(/(?<!\\)\\(?!\\)/g, "");
        if (DEBUG) console.log("\tSymbolsP:::NONTERMINAL", symbol.nameSimb);
        this.nonTerminal.add(symbol.nameSimb);
        break;
      case TOKEN.EPSILON:
      case TOKEN.TERMINAL:
        symbol.nameSimb = this.LA.yytext();
        symbol.nameSimb.replace(/(?<!\\)\\(?!\\)/g, "");
        symbol.terminal = true;
        if (DEBUG) console.log("\tSymbolsP:::TERMINAL", symbol.nameSimb);
        this.terminal.add(symbol.nameSimb);
        break;
      default:
        if (DEBUG) console.log("\tSymbolsP:::Undo Token");
        this.LA.undoToken();
        return true;
    }
    if (this.symbolsP(list)) {
      if (DEBUG) console.log("\tSymbolsP:::SymbolsP its true");
      list.push(symbol);
      return true;
    }
    if (DEBUG) console.log("\tSymbolsP:::SymbolsP its false");
    return false;
  }

}


export { NodeSimb };
export { SyntaxAnalyzer };