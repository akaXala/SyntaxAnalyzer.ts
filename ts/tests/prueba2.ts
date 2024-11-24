import { Grammar } from '@/ts/Grammar';
//import { NodeSimb } from '@/ts/SyntaxAnalyzer';

function testGrammar() {
    // Crear una instancia de Grammar
    const grammar = new Grammar();


/*
< E > -> < T > < Ep >
< Ep > -> + < T > < Ep > | - < T > < Ep > | Epsilon
< T > -> < F > < T' >
< Tp > -> * < F > < Tp > | / < F > < Tp > | Epsilon
< F > -> ( < E > ) | Num
*/

// Por ejemplo, una gramática simple para expresiones aritméticas:
// grammar.addRule('<E> -> <T> | <E> + <T>');
// grammar.addRule('<T> -> <F> | <T> * <F>');
// grammar.addRule('<F> -> ( <E> ) | id');


    grammar.addRule('< E > -> < T > < Ep >');
    grammar.addRule('< Ep > -> + < T > < Ep > | - < T > < Ep > | Epsilon');
    grammar.addRule('< T > -> < F > < Tp >');
    grammar.addRule('< Tp > -> * < F > < Tp > | / < F > < Tp > | Epsilon');
    grammar.addRule('< F > -> ( < E > ) | Num');


    // Convertir a formato de SyntaxAnalyzer y mostrar el resultado
    const rules = grammar.toSyntaxAnalyzerFormat();
    console.log('Reglas convertidas:');
    rules.forEach(rule => {
        console.log(`${rule.nameSimb.nameSimb} ->`);
        console.log('  Símbolos:', rule.list.map(node => node.nameSimb).join(' '));
        console.log('  Es Terminal:', rule.list.map(node => node.terminal));
    });
}

export { testGrammar };