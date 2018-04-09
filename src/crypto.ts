import { StringReader } from "./utils";

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

	static deserialize(sr : StringReader) {
		let pub = new PublicKey()
		const algorithm = parseInt(sr.read(1), 16)
		const curve = parseInt(sr.read(1),16)
		const pk = sr.read(33)
		pub.algorithm = algorithm
		pub.curve = curve
		pub.pk = pk
		return pub
	}
}

export enum PK_STATUS  {
	IN_USE = '01',
	REVOKED = '00'
}

export class PublicKeyStatus {
	pk : PublicKey
	status : string

	static deserialize(hexstr : string) : PublicKeyStatus {
		let ps = new PublicKeyStatus()
		const sr = new StringReader(hexstr)
		const status = sr.read(1)
		ps.status = status
		ps.pk = PublicKey.deserialize(sr)
		return ps
	}
}