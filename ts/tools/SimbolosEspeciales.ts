class SimbolosEspeciales {
    // Definimos los símbolos especiales como constantes
    public static readonly EPSILON: string = String.fromCharCode(949);
    public static readonly FIN: number = 0;
    // public static readonly FIN: string = String.fromCharCode(0);
    public static readonly TOKENERROR: number = 9999;

    public static readonly ERRORSA: string = '9999';
    // que OMITIR sea el valor ascii 32 (espacio)
    public static readonly OMITIR: number = 70;
}


export { SimbolosEspeciales };