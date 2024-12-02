
import { testLL1 } from "@/ts/LL1";
import { recursiveDescent } from "@/ts/tests/prueba4";
import { testGrammarFirstFollow } from "@/ts/tests/prueba3";

export default function Page() {
    //recursiveDescent();
    testLL1();
    //testGrammarFirstFollow();
    return <div>Page Content</div>;
}
