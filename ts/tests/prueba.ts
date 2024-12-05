import { SyntaxAnalyzer, NodeSimb } from "@/ts/SyntaxAnalyzer";






function testFollow() {
  // Creación de símbolos terminales y no terminales
  const epsilon = new NodeSimb("Epsilon", true);
  const plus = new NodeSimb("+", true);
  const minus = new NodeSimb("-", true);
  const mult = new NodeSimb("*", true);
  const div = new NodeSimb("/", true);
  const openParen = new NodeSimb("(", true);
  const closeParen = new NodeSimb(")", true);
  const num = new NodeSimb("Num", true);

  const E = new NodeSimb("E", false);
  const EPrime = new NodeSimb("E'", false);
  const T = new NodeSimb("T", false);
  const TPrime = new NodeSimb("T'", false);
  const F = new NodeSimb("F", false);

  // Definición de las reglas de la gramática
  const rules = [
    { nameSimb: E, list: [T, EPrime] },
    { nameSimb: EPrime, list: [plus, T, EPrime] },
    { nameSimb: EPrime, list: [minus, T, EPrime] },
    { nameSimb: EPrime, list: [epsilon] },
    { nameSimb: T, list: [F, TPrime] },
    { nameSimb: TPrime, list: [mult, F, TPrime] },
    { nameSimb: TPrime, list: [div, F, TPrime] },
    { nameSimb: TPrime, list: [epsilon] },
    { nameSimb: F, list: [openParen, E, closeParen] },
    { nameSimb: F, list: [num] },
  ];

  // Instancia del analizador sintáctico
  const analyzer = new SyntaxAnalyzer(rules);

  // Pruebas del método FOLLOW
  console.log("Follow(E):", analyzer.follow(E)); // Esperado: { ")" , "$" }
  console.log("Follow(E'):", analyzer.follow(EPrime)); // Esperado: { ")" , "$" }
  console.log("Follow(T):", analyzer.follow(T)); // Esperado: { "+", "-", ")" , "$" }
  console.log("Follow(T'):", analyzer.follow(TPrime)); // Esperado: { "+", "-", ")" , "$" }
  console.log("Follow(F):", analyzer.follow(F)); // Esperado: { "*", "/", "+", "-", ")" , "$" }

  // Pruebas del método FIRST
  console.log("First(E):", analyzer.first([E])); // Esperado: { "(", "Num" }
  console.log("First(E'):", analyzer.first([EPrime])); // Esperado: { "+", "-", "Epsilon" }
  console.log("First(T):", analyzer.first([T])); // Esperado: { "(", "Num" }
  console.log("First(T'):", analyzer.first([TPrime])); // Esperado: { "*", "/", "Epsilon" }
  console.log("First(F):", analyzer.first([F])); // Esperado: { "(", "Num" }
}

export { testFollow };
