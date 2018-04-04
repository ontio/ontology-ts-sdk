export enum SignatureSchema {
    SHA224withECDSA  = 0,
	SHA256withECDSA,
	SHA384withECDSA,
	SHA512withECDSA,
	SHA3_224withECDSA,
	SHA3_256withECDSA,
	SHA3_384withECDSA,
	SHA3_512withECDSA,
	RIPEMD160withECDSA,

	SM3withSM2,

	SHA512withEDDSA
}

export enum CurveLabel {
	P224 = 1,
	P256 = 2,
	P384 = 3,
	P521 = 4,

	SM2P256V1 = 20,

	ED25519 = 25
}

export enum KeyType {
	PK_ECDSA = 0x12,
	PK_SM2 = 0x13,
	PK_EDDSA = 0x14,
}

export class PublicKey {
	algorithm: number
	curve: number
	pk: string
}