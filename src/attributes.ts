import { ITableAttribute } from "vortex-api/lib/types/api";

export const tableAttributes: {[name: string]: ITableAttribute} = {
    game: {
        id: 'cncr-game',
        placement: 'table',
        name: 'Game',
        help: 'The game this mod is installed for.',
        edit: {},
        isToggleable: true,
        isSortable: true,
        isGroupable: true
    },
}