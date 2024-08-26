import { PermisoInterface } from "./permiso.interface";

export interface RolInterface {
    idRol?: any | null | undefined,
    nombreRol?: any | null | undefined,
    permisos?: PermisoInterface[] | null | undefined;
}