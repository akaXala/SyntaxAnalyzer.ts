import { SyntaxAnalyzer } from '@/ts/SyntaxAnalyzer';
const DEBUG: number = 5;
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
    let input: string;
    if (DEBUG == 1) {
        input = "<E> -> <E'>;\n" +
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
    }
    if (DEBUG == 2) {
        console.log("::: TEST 2 :::");//
        input = "<S> -> if <C> then <S> else <S> | <A>;\n" +
            "<C> -> id = id;\n" +
            "<A> -> id := id";

        console.log("--- INPUT ---");
        console.log(input);
        SA.setGrammar(input);
        SA.parse();
        console.log("--- OUTPUT ---");
        console.log(SA.nonTerminal);
        console.log(SA.terminal);
        console.log(SA.G_Rules);
    }
    if (DEBUG == 3) {
        console.log("::: TEST 3 :::");//
        input = "<L> -> id <Lp>;\n" +
            "<Lp> -> , id <Lp> | EPSILON";

        console.log("--- INPUT ---");
        console.log(input);
        SA.setGrammar(input);
        SA.parse();
        console.log("--- OUTPUT ---");
        console.log(SA.nonTerminal);
        console.log(SA.terminal);
        console.log(SA.G_Rules);
    }
    if (DEBUG == 4) {
        console.log("::: TEST 4 :::");//
        input = "<B> -> <L>  <Bp>;\n" +
            "<Bp> -> and <L> <Bp> | EPSILON;\n" +
            "<L> -> id"


        console.log("--- INPUT ---");
        console.log(input);
        SA.setGrammar(input);
        SA.parse();
        console.log("--- OUTPUT ---");
        console.log(SA.nonTerminal);
        console.log(SA.terminal);
        console.log(SA.G_Rules);

    }
    if (DEBUG == 5) {
        console.log("::: TEST 5 :::");//
        input = "<S> -> while <C> do <S> | <A>;\n" +
            "<C> -> id > id ;\n" +
            "<A> -> id := id"

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
}
export { recursiveDescent };