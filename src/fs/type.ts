import { Address } from '../crypto';

export interface FileStore {
    fileHash: string;
    fileDesc: string;
    fileBlockCount: number;
    realFileSize: number;
    copyNumber: number;
    firstPdp: boolean;
    pdpInterval: number;
    timeExpired: Date;
    pdpParam: string;
    storageType: number;
}

export interface FileRenewInterface {
    fileHash: string;
    renewTime: Date;
}

export interface FileTransferInterface {
    fileHash: string;
    newOwner: Address;
}
