
import { testLL1 } from "@/ts/LL1";
import { recursiveDescent } from "@/ts/tests/prueba4";
import { testGrammarFirstFollow } from "@/ts/tests/prueba3";
import { LR0Test } from "@/ts/LR0";

export default function Page() {
    //recursiveDescent();
    //testLL1();
    //testGrammarFirstFollow();
    LR0Test();
    return <div>Page Content</div>;
}