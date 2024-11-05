/* 

# Clase para el analizador sintáctico:



## Métodos:

First: El primer terminal encontrado en la regla de producción. En caso de que no hayan, se hacen las derivaciones hasta encontrar uno, 
en caso de que ese uno sea epsilon se revisa si hay más derivaciones, si no, se regresa epsilon.
Salida esperada: Set de terminales y/o epsilons.


Follow: El conjunto de terminales que pueden seguir a un no terminal en una derivación. 
Se revisa si el símbolo es el inicial, si lo es, se agrega "$" al conjunto.
Se recorren las reglas de producción, si el símbolo no está en la regla, se pasa a la siguiente.
Si el símbolo está al final de la regla, se revisa si el no terminal es el mismo, si no, se agrega el conjunto Follow del no terminal.

Salida esperada: Set de terminales.

*/



class NodeSimb {  // Qué era NodoSimb? xd. REVISAR
    nameSimb: string;
    terminal: boolean;
  
    constructor(nameSimb: string, terminal: boolean) {
      this.nameSimb = nameSimb;
      this.terminal = terminal;
    }
  }
  
  class SintaxAnalizer {
    G_Rules: Array<{ nameSimb: string; list: NodeSimb[] }> = [];
  
    constructor(rules: Array<{ nameSimb: string; list: NodeSimb[] }>) {
      this.G_Rules = rules;
    }
  
    first(L: NodeSimb[]): Set<string> {
      let R: Set<string> = new Set<string>();
      let L2: NodeSimb[];
  
      // Caso en que el primer símbolo en L es terminal
      if (L[0].terminal) {
        R.add(L[0].nameSimb);
        return R;
      }
  
      // Si L[0] es no terminal, se recorren las reglas de producción
      for (let i = 0; i < this.G_Rules.length; i++) {
        if (this.G_Rules[i].nameSimb === L[0].nameSimb) {
            // Donde R es el conjunto de terminales y/o epsilons
          // Añadir el conjunto First de la lista de la regla coincidente
          R = new Set([...R, ...this.first(this.G_Rules[i].list)]);
        }
      }
  
      // Si R no contiene "Epsilon", retornamos
      if (!R.has("Epsilon")) {
        return R;
      }
  
      // Si hay un solo elemento en L, retornamos
      if (L.length === 1) {
        return R;
      }
  
      // Eliminar "Epsilon" y calcular First del resto de la lista
      R.delete("Epsilon");
      // Revisar si es equivalente al metodo de C# de copyto
      L2 = [...L]; // Copia de L
      L2.shift();  // Remover el primer elemento de L 
      R = new Set([...R, ...this.first(L2)]);
  
      return R;
    }


    follow(simb: string): Set<string> {
        let R: Set<string> = new Set<string>();
        let RAux: Set<string>;
    
        // Agregar "$" si el símbolo es el inicial
        if (simb === this.G_Rules[0].nameSimb) {
          R.add("$");
        }
    
        for (let i = 0; i < this.G_Rules.length; i++) {
          const rule = this.G_Rules[i];
          const index = rule.list.findIndex((node) => node.nameSimb === simb);
    
          if (index === -1) {
            continue; // Si el símbolo no está en la regla, pasar a la siguiente
          }
    
          if (index + 1 === rule.list.length) {
            // Si el símbolo está al final de la regla
            if (rule.nameSimb !== simb) {
              R = new Set([...R, ...this.follow(rule.nameSimb)]);
            }
          } else {
            // Obtener el subconjunto a partir del símbolo encontrado
            const LAux = rule.list.slice(index + 1);
            RAux = this.first(LAux);
    
            if (!RAux.has("Epsilon")) {
              R = new Set([...R, ...RAux]);
            } else {
              RAux.delete("Epsilon");
              R = new Set([...R, ...RAux]);
    
              if (rule.nameSimb !== simb) {
                R = new Set([...R, ...this.follow(rule.nameSimb)]);
              }
            }
          }
        }
    
        return R;
      }

  }
  