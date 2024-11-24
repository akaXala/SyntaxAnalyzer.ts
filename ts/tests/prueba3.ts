import { Grammar } from '@/ts/Grammar';
import { SyntaxAnalyzer } from '@/ts/SyntaxAnalyzer';

function testGrammarFirstFollow() {
    // Crear una instancia de Grammar
    const grammar = new Grammar();

    // Definir la gramática usando el formato de cadenas
    grammar.addRule('< E > -> < T > < Ep >');
    grammar.addRule('< Ep > -> + < T > < Ep > | - < T > < Ep > | Epsilon');
    grammar.addRule('< T > -> < F > < Tp >');
    grammar.addRule('< Tp > -> * < F > < Tp > | / < F > < Tp > | Epsilon');
    grammar.addRule('< F > -> ( < E > ) | Num');

    // Convertir a formato de SyntaxAnalyzer
    const rules = grammar.toSyntaxAnalyzerFormat();
    const analyzer = new SyntaxAnalyzer(rules);

    // Encontrar los nodos no terminales para las pruebas
    const findNode = (name: string) => rules.find(r => r.nameSimb.nameSimb === name)?.nameSimb;
    
    const E = findNode('E');
    const Ep = findNode('Ep');
    const T = findNode('T');
    const Tp = findNode('Tp');
    const F = findNode('F');

    if (!E || !Ep || !T || !Tp || !F) {
        console.error('Error: No se pudieron encontrar todos los símbolos no terminales');
        return;
    }

    // Pruebas del método FOLLOW
    console.log("Follow(E):", analyzer.follow(E)); // Esperado: { ")" , "$" }
    console.log("Follow(Ep):", analyzer.follow(Ep)); // Esperado: { ")" , "$" }
    console.log("Follow(T):", analyzer.follow(T)); // Esperado: { "+", "-", ")" , "$" }
    console.log("Follow(Tp):", analyzer.follow(Tp)); // Esperado: { "+", "-", ")" , "$" }
    console.log("Follow(F):", analyzer.follow(F)); // Esperado: { "*", "/", "+", "-", ")" , "$" }

    // Pruebas del método FIRST
    console.log("First(E):", analyzer.first([E])); // Esperado: { "(", "Num" }
    console.log("First(Ep):", analyzer.first([Ep])); // Esperado: { "+", "-", "Epsilon" }
    console.log("First(T):", analyzer.first([T])); // Esperado: { "(", "Num" }
    console.log("First(Tp):", analyzer.first([Tp])); // Esperado: { "*", "/", "Epsilon" }
    console.log("First(F):", analyzer.first([F])); // Esperado: { "(", "Num" }
}

export { testGrammarFirstFollow }; 