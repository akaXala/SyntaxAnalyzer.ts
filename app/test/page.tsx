
import { useEffect } from "react";
import { recursiveDescent } from "@/ts/tests/prueba4";

export default function Page() {
    recursiveDescent();
    return <div>Page Content</div>;
}
