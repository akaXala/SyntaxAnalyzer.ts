import { NodeSimb, SyntaxAnalyzer } from "@/ts/SyntaxAnalyzer";
import { ItemLR0, SetItemsLR0 } from "@/ts/tools/ItemLR0";
import { LexicAnalyzer } from "@/ts/tools/LexicAnalyzer";
import { Queue } from "@/ts/tools/Queue";
import { Stack } from "@/ts/tools/Stack";
import { SimbolosEspeciales } from "@/ts/tools/SimbolosEspeciales";
import * as fs from 'fs';
import * as path from 'path';
import { act } from "react";

const DEBUGCERRADURA = false;
const DEBUGCREATETABLE = false;
const DEBUGSTARTSA = false;
const DEBUGPARSE = false;

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
    private LA: LexicAnalyzer;
    private SA: SyntaxAnalyzer;
    private grammar: string;
    private terminals: Set<string>;
    private nonTerminals: Set<string>;
    private table: Map<{ id: number, symbol: string }, string>;
    private tokens: Map<number, string>;
    private tableProduction: Array<{ Stack: string, Sigma: string, action: string }>;

    constructor() {
        this.LA = new LexicAnalyzer();
        this.SA = new SyntaxAnalyzer()
        this.terminals = new Set();
        this.nonTerminals = new Set();
        this.grammar = "";
        this.table = new Map();
        this.tokens = new Map();
        this.tableProduction = new Array();
    }
    public getTableProduction(): Array<{ Stack: string, Sigma: string, action: string }> {
        return this.tableProduction
    }
    public getTable(): Map<string, string> {
        const result: Map<string, string> = new Map();
        for (const key of this.table.keys()) {
            const value = this.table.get(key);
            const HashKey = key.id.toString() + key.symbol;
            if (value !== undefined) result.set(HashKey, value);
        }
        return result;
    }
    public getTableSize(): { rows: number, columns: number } {
        let rows = 0;
        let columns = 0;
        columns = this.terminals.size + this.nonTerminals.size + 1;
        for (const key of this.table.keys()) {
            if (key.id > rows) rows = key.id;
        }
        return { rows: rows + 1, columns: columns + 1 };
    }
    public getTerminals(): Set<string> {
        return this.terminals;
    }
    public getNonTerminals(): Set<string> {
        return this.nonTerminals;
    }
    public getTableProductionString(): Array<{ Stack: string, Sigma: string, action: string }> {
        return this.tableProduction;
    }

    private startSA(): void {
        this.SA.setGrammar(this.grammar);
        this.SA.parse();
        this.terminals = this.SA.getTerminals();
        this.nonTerminals = this.SA.getNonTerminals();

        if (DEBUGSTARTSA) console.log("terminals", this.terminals)
        if (DEBUGSTARTSA) console.log("nonTerminals", this.nonTerminals)
        if (DEBUGSTARTSA) console.log("Rules", this.SA.getG_Rules());
    }
    public setGrammar(grammar: string): void {
        this.grammar = grammar;
    }
    public createLR0() {
        if (DEBUGCREATETABLE) console.log("-------Start DEBUG create table LR0-------")
        const C: Set<SetItemsLR0> = new Set<SetItemsLR0>();
        let Sj: SetItemsLR0 = new SetItemsLR0(0);
        let setItems: Set<ItemLR0> = new Set<ItemLR0>();
        const Q: Queue<SetItemsLR0> = new Queue<SetItemsLR0>();
        this.SA.setGrammar(this.grammar);
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
                        TableLR0.set({ id: S.i, symbol: "$" }, "ACCEPT");
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

    public initLA(tokens: Map<number, string>, tokenOmmit: number, AFD: any): void {
        this.tokens = tokens;
        tokens.set(0, '$')
        this.LA.setAfdTable(AFD);
        this.LA.setTokenOmision(tokenOmmit);
    }

    public parse(sigma: string): boolean {

        const Q: Stack<{ symbol: string, state: number }> = new Stack();
        let sigmaPost: string;
        let Token: number;

        const Serch = (id: number, symbol: string, table: Map<{ id: number, symbol: string }, string>): string | undefined => {
            for (const key of table.keys()) {
                if (key.id === id && key.symbol === symbol) {
                    return table.get(key)!;
                }
            }
            return undefined;
        }
        const StackParserString = (Q: Stack<{ symbol: string, state: number }>): string => {
            let result = "";
            for (const item of Q.storage) {
                result += '[' + item.symbol + item.state.toString() + '] ';
            }
            return result
        }

        //Init sigmaPost to make the table production
        this.LA.setSigma(sigma);
        Token = this.LA.yylex();
        sigmaPost = "";
        while (Token != 0) {
            sigmaPost += this.LA.yytext();
            Token = this.LA.yylex();
        } sigmaPost += '$';
        this.LA.setSigma(sigma);
        if (DEBUGPARSE) console.log(sigmaPost);

        //Init Stack
        Q.push({ symbol: "$", state: 0 });
        Token = this.LA.yylex();
        while (Token != SimbolosEspeciales.TOKENERROR) {

            //Get the action from the table
            const tokenSymbol: string | undefined = this.tokens.get(Token);
            const action = Serch(Q.peek()!.state, tokenSymbol!, this.table);
            if (DEBUGPARSE) console.log(`Token: ${Token} => ${this.tokens.get(Token)}`);
            if (DEBUGPARSE) console.log(`Key {id: ${Q.peek()!.state}, symbol: ${this.tokens.get(Token)}} => ${action}`);

            //add to the table production
            this.tableProduction.push({ Stack: StackParserString(Q), Sigma: sigmaPost, action: action! });

            if (tokenSymbol === undefined || action === undefined) { //Error
                if (DEBUGPARSE && tokenSymbol === undefined) console.log("Token no identificado por analizaor sintacticco")
                else if (DEBUGPARSE && action === undefined) console.log("Error Sintacticamente")
                return false;
            } else if (action![0] == 'r') { //Reduce
                const rule = this.SA.getG_Rules()[parseInt(action!.substring(1))];
                for (let i = 0; i < rule.list.length; i++) Q.pop();
                Q.push({ symbol: rule.nameSimb.nameSimb, state: parseInt(Serch(Q.peek()!.state, rule.nameSimb.nameSimb, this.table)!.substring(1)) });
                this.LA.undoToken();
            } else if (action![0] == 'd') { //Derivate
                const derivation = parseInt(action!.substring(1));
                sigmaPost = sigmaPost.substring(this.LA.yytext().length);
                Q.push({ symbol: tokenSymbol!, state: derivation });
            } else {//Accept
                return true;
            }
            Token = this.LA.yylex();
        }
        if (DEBUGPARSE) console.log("Error token no identificado por analizador lexico");
        return false;
    }

    private cerradura(C: Set<ItemLR0>): Set<ItemLR0> {
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
    private move(C: Set<ItemLR0>, symbol: string): Set<ItemLR0> {
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
    private goTo(C: Set<ItemLR0>, symbol: string): Set<ItemLR0> {
        return this.cerradura(this.move(C, symbol));
    }

}
function test() {
    const grammarInput: string = Test1;
    const sigmaInput: string = "5+3.5*(73)";
    const tokensInput: Map<number, string> = new Map([[10, "+"], [20, "*"], [30, "("], [40, ")"], [50, "id"]]);
    const tokenOmmitInput: number = 60; // o -2
    //AFD que el usuario debe proporcionar
    const filePath = path.join('./ts/AFD', 'AFD.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const AFDInput = JSON.parse(data);

    const lr0 = new LR0();
    lr0.setGrammar(grammarInput);
    lr0.createLR0();
    lr0.initLA(tokensInput, tokenOmmitInput, AFDInput);
    if (lr0.parse(sigmaInput)) {
        console.log("Cadena de entrada correcta")
        const tableProduction: Array<{ Stack: string, Sigma: string, action: string }> = lr0.getTableProduction();
        const table: Map<string, string> = lr0.getTable();
        const terminals: Set<string> = lr0.getTerminals();
        const nonTerminals: Set<string> = lr0.getNonTerminals();
        console.log("Tabla de Producción")
        console.log("Stack -> Sigma -> Action")
        for (const item of tableProduction) {
            console.log(item.Stack, "->", item.Sigma, "->", item.action)
        }
        console.log("Terminales")
        for (const item of terminals) {
            console.log(item)
        }
        console.log("No Terminales")
        for (const item of nonTerminals) {
            console.log(item)
        }
        console.log("Tabla de Parsing")
        const tableSize = lr0.getTableSize();
        let cabecera = "";
        for (const symbol of [...terminals, "$", ...nonTerminals])
            cabecera += '\t' + symbol;
        cabecera += '\t';
        console.log(cabecera)
        let row = "";
        for (let i = 0; i < tableSize.rows; i++) {
            row = i.toString();
            for (const symbol of [...terminals, "$", ...nonTerminals]) {
                //Numero de estado + symbol = valor de la tabla
                const key = i.toString() + symbol
                const value = table.get(key)
                if (value === undefined) row += '\t' + "_";
                else row += '\t' + table.get(i.toString() + symbol)
            }
            console.log(row);
        }

    } else {
        console.log("Error en la cadena de entrada")
    }
}
export { test as LR0Test };