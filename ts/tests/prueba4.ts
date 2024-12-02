import { SyntaxAnalyzer } from '@/ts/SyntaxAnalyzer';

/*
SyntaxAnalyzer
E -> E'
E' -> + T E' | epsilon
T -> T'
T' -> * F T' | epsilon
F -> ( E ) | id
*/
export default function recursiveDescent() {
    const SA: SyntaxAnalyzer = new SyntaxAnalyzer();
    let input: string =
        "<E> -> <E'>;\n" +
        "<E'> -> + <T> <E'> | EPSILON;\n" +
        "<T> -> <T'>;\n" +
        "<T'> -> * <F> <T'> | EPSILON;\n" +
        "<F> -> ( <E> ) | id\n";
    console.log("::: TEST 1 :::");//
    console.log("--- INPUT ---");
    console.log(input);

    /*SA.setGrammar(input);
    let token = SA.LA.yylex();
    console.log(token, SA.LA.yytext());
    while (token != 0) {
        token = SA.LA.yylex();
        console.log(token, SA.LA.yytext());
    }*/
    SA.setGrammar(input);
    SA.parse();

    console.log("--- OUTPUT ---");

    console.log(SA.nonTerminal);
    console.log(SA.terminal);
    console.log(SA.G_Rules);

    console.log("::: TEST 2 :::");//
    //input = 
    console.log("--- INPUT ---");
    console.log(input);
    SA.setGrammar(input);
    SA.parse();
    console.log("--- OUTPUT ---");
    console.log(SA.nonTerminal);
    console.log(SA.terminal);
    console.log(SA.G_Rules);
    //console.log(SA.grammar)
}
export { recursiveDescent };