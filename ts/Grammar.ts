import { NodeSimb } from "@/ts/SyntaxAnalyzer";
import { LinkedList, ListNode } from "@/ts/tools/LinkedList";

interface Production {
  symbols: string[];  // Cada símbolo de la producción
  isTerminal: boolean[];  // Indica si cada símbolo es terminal o no
}

class Grammar {
  private nonTerminals: string[] = [];  // Array para símbolos no terminales
  private productions: Map<string, LinkedList<Production>> = new Map();  // Map de no terminal a sus producciones

  constructor() {
    this.nonTerminals = [];
    this.productions = new Map();
  }

  // Método para limpiar el nombre del símbolo (remover < > y espacios)
  private cleanSymbolName(symbol: string): string {
    return symbol.replace(/[<>\s]/g, '');
  }

  // Método para agregar una nueva regla de producción
  addRule(rule: string): void {
    // Separar la parte izquierda y derecha de la regla
    const [leftSide, rightSide] = rule.split('->').map(s => s.trim());
    
    // Limpiar el nombre del no terminal
    const cleanLeftSide = this.cleanSymbolName(leftSide);
    
    // Agregar el no terminal al array si no existe
    if (!this.nonTerminals.includes(cleanLeftSide)) {
      this.nonTerminals.push(cleanLeftSide);
      this.productions.set(cleanLeftSide, new LinkedList<Production>());
    }

    // Separar las diferentes producciones (separadas por |)
    const productions = rightSide.split('|').map(p => p.trim());
    
    // Procesar cada producción
    for (const prod of productions) {
      const symbols: string[] = [];
      const isTerminal: boolean[] = [];
      
      // Procesar los símbolos de la producción
      let currentSymbol = '';
      let inBrackets = false;
      
      for (let i = 0; i < prod.length; i++) {
        const char = prod[i];
        
        if (char === '<') {
          if (currentSymbol.trim()) {
            symbols.push(currentSymbol.trim());
            isTerminal.push(true);
            currentSymbol = '';
          }
          inBrackets = true;
        } else if (char === '>') {
          symbols.push(this.cleanSymbolName(currentSymbol));
          isTerminal.push(false);
          currentSymbol = '';
          inBrackets = false;
        } else {
          currentSymbol += char;
        }
      }
      
      // Agregar el último símbolo si existe
      if (currentSymbol.trim()) {
        symbols.push(currentSymbol.trim());
        isTerminal.push(true);
      }

      // Agregar la producción a la lista enlazada
      this.productions.get(cleanLeftSide)?.append({ symbols, isTerminal });
    }
  }

  // Método para convertir la gramática al formato requerido por SyntaxAnalyzer
  toSyntaxAnalyzerFormat(): Array<{ nameSimb: NodeSimb; list: NodeSimb[] }> {
    const rules: Array<{ nameSimb: NodeSimb; list: NodeSimb[] }> = [];

    for (const nonTerminal of this.nonTerminals) {
      const productionList = this.productions.get(nonTerminal);
      if (!productionList || !productionList.head) continue;

      let current: ListNode<Production> | null = productionList.head;
      while (current !== null) {
        const production = current.value;
        const nodeList: NodeSimb[] = production.symbols.map((symbol, index) => 
          new NodeSimb(symbol, production.isTerminal[index])
        );

        rules.push({
          nameSimb: new NodeSimb(nonTerminal, false),
          list: nodeList
        });

        current = current.next;
      }
    }

    return rules;
  }
}

export { Grammar };


