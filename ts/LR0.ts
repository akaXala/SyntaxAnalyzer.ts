import { NodeSimb, SyntaxAnalyzer } from "@/ts/SyntaxAnalyzer";
import { ItemLR0, SetItemsLR0 } from "@/ts/tools/ItemLR0";
import { LexicAnalyzer } from "./tools/LexicAnalyzer";
import { Queue } from "./tools/Queue";
import * as fs from 'fs';
import * as path from 'path';

const DEBUGCERRADURA = false;
const DEBUGCREATETABLE = true;
const DEBUGSTARTSA = false;

const Test1 = '<Ep> -> <E>\n;' +
    '<E> -> <E> + <T> | <T>\n;' +
    '<T> -> <T> * <F> | <F>\n;' +
    '<F> -> ( <E> ) | id';
const Test2 = '<Ep> -> <E>\n;' +
    '<E> -> <E> OR <T> | <T>\n;' +
    '<T> -> <T> AND <C> | <C>\n;' +
    '<C> -> <C>+ | <C>* | <C>? | <F>\n;' +
    '<F> -> ( <E> ) | Simb;';

class LR0 {
    //Gramatica
    LA: LexicAnalyzer;
    SA: SyntaxAnalyzer;
    grammarRead: string;
    grammar: { [nonTerminal: string]: Array<Array<string>> };
    terminals: Set<string>;
    nonTerminals: Set<string>;
    sigma: string;
    table: Map<{ id: number, symbol: string }, string>;

    constructor() {
        this.LA = new LexicAnalyzer();
        this.SA = new SyntaxAnalyzer()
        this.grammar = {};
        this.terminals = new Set();
        this.nonTerminals = new Set();
        this.sigma = "";
        this.grammarRead = Test1;
        this.table = new Map();
    }
    private startSA(): void {
        this.SA.setGrammar(this.grammarRead);
        this.SA.parse();
        this.terminals = this.SA.getTerminals();
        this.nonTerminals = this.SA.getNonTerminals();

        if (DEBUGSTARTSA) console.log("terminals", this.terminals)
        if (DEBUGSTARTSA) console.log("nonTerminals", this.nonTerminals)
        if (DEBUGSTARTSA) console.log("Rules", this.SA.getG_Rules());
    }

    createLR0() {
        if (DEBUGCREATETABLE) console.log("-------Start DEBUG create table LR0-------")
        const C: Set<SetItemsLR0> = new Set<SetItemsLR0>();
        let Sj: SetItemsLR0 = new SetItemsLR0(0);
        let setItems: Set<ItemLR0> = new Set<ItemLR0>();
        const Q: Queue<SetItemsLR0> = new Queue<SetItemsLR0>();
        this.SA.setGrammar(this.grammarRead);
        this.startSA();

        //console.log(this.terminals)
        //console.log(this.nonTerminals)

        let j: number = 0;
        setItems.add(new ItemLR0(0, 0));
        Sj.items = this.cerradura(setItems);
        Sj.i = j++;
        C.add(Sj);
        Q.enqueue(Sj);
        const TableLR0: Map<{ id: number, symbol: string }, string> = new Map()
        if (DEBUGCREATETABLE) console.log("Start new table")
        while (!Q.isEmpty()) {
            Sj = Q.dequeue()!;
            let exist = false;
            setItems = new Set<ItemLR0>();
            for (const symbol of new Set([...this.nonTerminals, ...this.terminals])) {
                exist = false;
                setItems = this.goTo(Sj.items, symbol);
                if (setItems.size === 0) continue;
                for (const S of C) {
                    if (DEBUGCREATETABLE) console.log("With symbol : ", symbol, "\nS", S, "\nsetItems", setItems)
                    if (S.equalsItems(setItems)) {
                        if (DEBUGCREATETABLE) console.log("Exist")
                        TableLR0.set({ id: Sj.i, symbol: symbol }, "d" + (S.i));
                        exist = true;
                        break;
                    }
                }
                if (!exist) {
                    TableLR0.set({ id: Sj.i, symbol: symbol }, "d" + (j));
                    const SjAux = new SetItemsLR0(j);
                    SjAux.items = setItems;
                    C.add(SjAux);
                    Q.enqueue(SjAux);
                    j++;
                }
            }
        }

        for (const S of C) {
            for (const item of S.items) {
                if (item.getdotIndex() === this.SA.getG_Rules()[item.getruleNumber()].list.length) {
                    const symbols: Set<string> = this.SA.follow(this.SA.getG_Rules()[item.getruleNumber()].nameSimb);
                    if (item.getruleNumber() === 0) {
                        TableLR0.set({ id: S.i, symbol: "$" }, "ACEPTAR");
                    } else {
                        for (const column of symbols) {
                            TableLR0.set({ id: S.i, symbol: column }, "r" + item.getruleNumber());
                        }
                    }
                }
            }
        }
        if (DEBUGCREATETABLE) console.log(TableLR0);
        this.table = TableLR0;

        // Optionally save the parsing table to a JSON file
        const filePath = path.join('./ts/output', 'TableLR0.json');
        fs.writeFileSync(filePath, JSON.stringify(Array.from(TableLR0.entries()), null, 2), 'utf-8');
        if (DEBUGCREATETABLE) console.log(`Tabla de parsing guardada en: ${filePath}`);
    }

    cerradura(C: Set<ItemLR0>): Set<ItemLR0> {
        if (DEBUGCERRADURA) console.log("Entra A función con C:", C)
        let result: Set<ItemLR0> = new Set<ItemLR0>();
        const temp: Set<ItemLR0> = new Set<ItemLR0>();
        if (C.size === 0) return result;
        result = new Set<ItemLR0>([...result, ...C].filter(
            (item, index, self) => index === self.findIndex((t) => t.equals(item))
        ));
        for (const item of C) {
            const list: NodeSimb[] = this.SA.getG_Rules()[item.getruleNumber()].list;
            if (item.getdotIndex() < list.length) {
                const node: NodeSimb = list[item.getdotIndex()];
                if (!node.terminal) {
                    for (let i = 0; i < this.SA.getG_Rules().length; i++) {
                        if (this.SA.getG_Rules()[i].nameSimb.nameSimb === node.nameSimb) {
                            const aux: ItemLR0 = new ItemLR0(i, 0);
                            if (![...result].find(x => x.equals(aux))) {
                                temp.add(aux);
                            }
                        }
                    }
                }

            }
        }

        const newCerradura: Set<ItemLR0> = this.cerradura(temp);
        if (DEBUGCERRADURA) console.log("result:", result, "\nnewCerradura:", newCerradura)

        result = new Set<ItemLR0>([...result, ...newCerradura].filter(
            (item, index, self) => index === self.findIndex((t) => t.equals(item))
        ));
        if (DEBUGCERRADURA) console.log("result:", result)
        return result;
    }
    move(C: Set<ItemLR0>, symbol: string): Set<ItemLR0> {
        const result: Set<ItemLR0> = new Set<ItemLR0>();
        for (const item of C) {
            const list: NodeSimb[] = this.SA.getG_Rules()[item.getruleNumber()].list;
            if (item.getdotIndex() < list.length) {
                const NodeSimb = list[item.getdotIndex()];
                if (NodeSimb.nameSimb === symbol) {
                    result.add(new ItemLR0(item.getruleNumber(), item.getdotIndex() + 1));
                }
            }
        }
        return result;
    }
    goTo(C: Set<ItemLR0>, symbol: string): Set<ItemLR0> {
        return this.cerradura(this.move(C, symbol));
    }

}
function test() {
    const lr0 = new LR0();
    lr0.createLR0();
    //Example of how to read the JSON file
    console.log("Reading JSON file");
    const filePath = path.join('./ts/output', 'TableLR0.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const mapObject: Map<{ id: number, symbol: string }, string> = new Map(JSON.parse(data));
    console.log(mapObject);
}
export { test as LR0Test };