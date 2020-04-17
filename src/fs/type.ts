import { Address } from '../crypto';

export interface FileStore {
    fileHash: string;
    fileDesc: string;
    fileBlockCount: number;
    realFileSize: number;
    copyNumber: number;
    firstPdp: boolean;
    pdpInterval: number;
    timeExpired: number;
    pdpParam: string;
    storageType: number;
}

export interface FileRenewInterface {
    fileHash: string;
    renewTime: number;
}

export interface FileTransferInterface {
    fileHash: string;
    newOwner: Address;
}
