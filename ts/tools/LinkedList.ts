/*

1. Clase Node: Cada nodo almacena un valor genérico (value) y un puntero (next) al siguiente nodo.

2. Clase LinkedList: Define los métodos necesarios para manipular la lista enlazada:
    - append: Agrega un nuevo nodo al final de la lista.
    - remove: Elimina el primer nodo que contiene el valor especificado.
    - find: Busca un nodo con un valor específico.
    - print: Imprime los valores de la lista en la consola.

    Notas:
        Esta es una implementación básica de una lista enlazada simple (singly linked list).
        Puedes extender esta implementación para crear una lista doblemente enlazada (doubly linked list) 
        añadiendo un puntero al nodo anterior (prev) en cada nodo y adaptando los métodos según sea necesario.

*/


// Clase para representar un nodo de la lista
class ListNode<T> {
    value: T;
    next: ListNode<T> | null;

    constructor(value: T) {
        this.value = value;
        this.next = null;
    }
}

// Clase para representar la lista enlazada
class LinkedList<T> {
    head: ListNode<T> | null = null;

    // Método para agregar un nodo al final de la lista
    append(value: T): void {
        const newNode = new ListNode(value);
        if (this.head === null) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next !== null) {
                current = current.next;
            }
            current.next = newNode;
        }
    }

    // Método para eliminar un nodo de la lista
    remove(value: T): void {
        if (this.head === null) return;

        if (this.head.value === value) {
            this.head = this.head.next;
            return;
        }

        let current = this.head;
        while (current.next !== null && current.next.value !== value) {
            current = current.next;
        }

        if (current.next !== null) {
            current.next = current.next.next;
        }
    }

    // Método para buscar un valor en la lista
    find(value: T): ListNode<T> | null {
        let current = this.head;
        while (current !== null) {
            if (current.value === value) return current;
            current = current.next;
        }
        return null;
    }

    // Método para imprimir los valores de la lista
    print(): void {
        let current = this.head;
        while (current !== null) {
            console.log(current.value);
            current = current.next;
        }
    }
}

// // Ejemplo de uso
// const list = new LinkedList<number>();
// list.append(1);
// list.append(2);
// list.append(3);
// list.print(); // Output: 1 2 3
