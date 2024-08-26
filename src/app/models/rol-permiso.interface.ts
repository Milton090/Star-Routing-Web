import { PermisoInterface } from "./permiso.interface";

export interface RolPermisoInterface {
    idRolPermiso?: string | null | undefined,
    idRol?: any | null | undefined,
    idPermiso?: any | null | undefined,
    permiso?: PermisoInterface | null | undefined
}