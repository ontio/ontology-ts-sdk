/*
 * Copyright (C) 2018 The ontology Authors
 * This file is part of The ontology library.
 *
 * The ontology is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ontology is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as CTX from 'milagro-crypto-js';
import * as utils from '../utils';

/**
 * Issuer
 *  Issuer in Anonymous Credential
 */
export class Issuer {

    sk: SecretKey;
    pk: IssuerPublicKey;
    // AttrMap: Map<string, number>;
    AttributeName: string[];

    param: CryptoSuite;

    constructor(curve: string) {
        this.param = new CryptoSuite(curve);
        this.sk = new SecretKey(this.param);
    }

    /* GenerateSk():SecretKey
     *  generate a random secret key
     */
    GenerateSk(): SecretKey {
        this.sk.Rand();
        return this.sk;
    }

    /* GenerateKeyPair()
     *  generate a random secret key
     */
    GenerateKeyPair() {
        this.sk = SecretKey.GenerateSk(this.param);
        this.pk = this.sk.GenerateIssuerPublicKey();
    }

    /* SetAttributeSet(AttributeName:string[])
     *  generate a random secret key
     */
    SetAttributeSet(AttributeName: string[]) {
        this.AttributeName = AttributeName;
        this.pk.GenerateAttr(AttributeName);
    }

    /* Sign(Nym, attrs):Credential
     *  sign a credential for a user
     */
    Sign(Nym: any, attrs: any[]): Credential {
        // random e, s
        const e = this.param.getRandBN();
        const s = this.param.getRandBN();
        const B = new this.param.ECP(); // B = g1 · HRand^s · Nym · MulAll(HAttrs[i]^(Attrs[i]))
        B.copy(this.param.g1);
        B.add(this.param.PAIR.G1mul(this.pk.h0, s));
        B.add(Nym);
        for (let i = 0; i < this.pk.attr.length; i++) {
            B.add(this.param.PAIR.G1mul(this.pk.h[i], attrs[i]));
        }

        let A = new this.param.ECP(); // A = B^(1/(e+x))
        const tmp = new this.param.BIG(); // tmp = (1/(e+x))
        tmp.copy(e);
        tmp.add(this.sk.value); // !!!!!!!!!!!
        tmp.invmodp(this.param.order);

        A = this.param.PAIR.G1mul(B, tmp);

        const cred = new Credential(this.param);
        cred.Set(A, B, e, s, attrs);
        return cred;
    }

    /* GetPk()
     *  get issuer's public key
     */
    GetPk(): IssuerPublicKey {
        return IssuerPublicKey.COPY(this.pk);
    }

    /* GenerateSk():SecretKey
     *  generate a random secret key
     */
    GenerateNonce(): any {
        const nonce = this.param.getRandBN();
        return nonce;
    }

    VerifyCredentialRequest(CR: any): boolean {
        return this.pk.VerifyCredentialRequest(CR);
    }

}

/**
 * User
 *  An user in Anonymous Credential
 *  Prover and Verifier are all user.
 */
export class User {

    attrs: any[];

    private sk: SecretKey;
    private Nym: any;
    // private pi: {
    //     C: any,
    //     S: any
    // };

    private Cred: Credential;

    private ipk: IssuerPublicKey;

    private param: CryptoSuite;

    constructor(curve: string) {
        this.param = new CryptoSuite(curve);
    }

    /* GenerateSk():SecretKey
     *  generate a random secret key
     */
    GenerateSk(): SecretKey {
        this.sk = SecretKey.GenerateSk(this.param);
        return this.sk;
    }

    /* SetIpk(ipk:IssuerPublicKey)
     *  save issuer's public key
     */
    SetIpk(ipk: IssuerPublicKey) {
        this.ipk = IssuerPublicKey.COPY(ipk);
    }

    GenerateCrendentialRequest(nonce: any): any {
        if (this.ipk === undefined) {
            // tslint:disable-next-line:no-console
            console.log('Please set ipk first.');
            return;
        }

        const ipk = this.ipk;
        const Nym = this.param.PAIR.G1mul(ipk.h_sk, this.sk.value); // Nym

        const r = this.param.getRandBN(); // r
        const t1 = this.param.PAIR.G1mul(ipk.h_sk, r); // t1

        const C = this.param.hashToBN(t1, ipk.h_sk, Nym, nonce);

        const S = this.param.BIG.modmul(C, this.sk.value, this.param.order);
        S.add(r);
        S.mod(this.param.order);

        const pi = {
            C,
            S
        };

        const attrs = this.param.genAttrBN(ipk.attr);

        this.Nym = Nym;
        this.attrs = attrs;

        const CR = {
            Nym,
            pi,
            nonce,
            attrs
        };

        return CR;
    }

    VerifyBBSplus(Cred: Credential): boolean {
        // pk   <- ipk.w
        // m    <- attrs
        // sig  <- (A,E,s)

        // check if
        // e(A, g2^E * pk) == e(B, g2)
        // and if
        // B == g1 * HRand^s * Nym * (h1^m1 * ... * hL^mL)

        const wg2e = new this.param.ECP2();
        wg2e.copy(this.ipk.w);
        wg2e.add(this.param.PAIR.G2mul(this.param.g2, Cred.sig.e));
        wg2e.affine(); // ~!!!!use affine() after ECP's mul operation, for pairing.

        const A = new this.param.ECP();
        A.copy(Cred.sig.A);
        A.affine();

        let left = this.param.PAIR.ate(wg2e, A);
        left = this.param.PAIR.fexp(left);

        const B = new this.param.ECP();
        B.copy(this.param.g1);
        B.add(this.param.PAIR.G1mul(this.ipk.h0, Cred.sig.s));
        B.add(this.Nym);

        for (let i = 0; i < Cred.attrs.length; i++) {
            B.add(this.param.PAIR.G1mul(this.ipk.h[i], Cred.attrs[i]));
        }

        B.affine();
        let right = this.param.PAIR.ate(this.param.g2, B);
        right = this.param.PAIR.fexp(right);

        return left.equals(right);
    }

    SetCredential(Cred: Credential) {
        this.Cred = new Credential(this.param);
        this.Cred.Copy(Cred);
        return true;
    }

    Prove(D: any[]) {
        const ipk = this.ipk;
        const Cred = this.Cred;

        const r1 = this.param.getRandBN(); // r1

        const A_ = this.param.PAIR.G1mul(Cred.sig.A, r1); // A'

        const r3 = new this.param.BIG(0); // r3
        r3.copy(r1);
        r3.invmodp(this.param.order);

        // tslint:disable-next-line:variable-name
        let _e = new this.param.BIG(0); // -e
        _e.copy(Cred.sig.e);
        _e = this.param.BIG.modneg(_e, this.param.order);

        const _A = this.param.PAIR.G1mul(A_, _e); // _A
        _A.add(this.param.PAIR.G1mul(Cred.sig.B, r1));

        const r2 = this.param.getRandBN(); // r2
        // tslint:disable-next-line:variable-name
        let _r2 = new this.param.BIG(0); // -r2
        _r2.copy(r2);
        _r2 = this.param.BIG.modneg(_r2, this.param.order);

        const B_ = this.param.PAIR.G1mul(Cred.sig.B, r1); // B'
        B_.add(this.param.PAIR.G1mul(ipk.h0, _r2));

        // tslint:disable-next-line:variable-name
        let s_ = this.param.BIG.modmul(r2, r3, this.param.order); // s'
        s_ = this.param.BIG.modneg(s_, this.param.order);
        s_.add(Cred.sig.s);
        s_.mod(this.param.order);

        // tslint:disable-next-line:variable-name
        const r_a = []; // r_a[]
        for (let i = 0; i < D.length; i++) {
            if (D[i] === 0) {
                r_a[i] = this.param.getRandBN();
            } else {
                r_a[i] = false;
            }
        }

        // tslint:disable-next-line:variable-name
        const r_e = this.param.getRandBN();
        // tslint:disable-next-line:variable-name
        const r_r2 = this.param.getRandBN();
        // tslint:disable-next-line:variable-name
        const r_r3 = this.param.getRandBN();
        // tslint:disable-next-line:variable-name
        const r_s_ = this.param.getRandBN();
        // tslint:disable-next-line:variable-name
        const r_sk = this.param.getRandBN();

        const E = this.param.PAIR.G1mul(ipk.h_sk, r_sk); // E

        const t1 = this.param.PAIR.G1mul(A_, r_e); // t1
        t1.add(this.param.PAIR.G1mul(ipk.h0, r_r2));

        const t2 = this.param.PAIR.G1mul(B_, r_r3); // t2
        t2.add(this.param.PAIR.G1mul(ipk.h0, r_s_));
        t2.add(this.param.PAIR.G1mul(E, new this.param.BIG(-1)));
        for (let i = 0; i < r_a.length; i++) {
            if (r_a[i] !== false) {
                t2.add(this.param.PAIR.G1mul(ipk.h[i], r_a[i]));
            }
        }

        // c' = H(A', _A, B', Nym, t1, t2, g1, HRand, h1, ... , hL, w)
        // tslint:disable-next-line:variable-name
        const c_ = this.param.hashToBN(
            A_,
            _A,
            B_,
            this.Nym,
            t1,
            t2,
            this.param.g1,
            ipk.h0,
            ipk.h,
            ipk.w
        );

        const nonce = this.param.getRandBN();
        // c = H(nonce, c', (D, I))
        const c = this.param.hashToBN(nonce, c_, D, this.attrs);

        // tslint:disable-next-line:variable-name
        const s_sk = new this.param.BIG(0);
        s_sk.copy(r_sk);
        s_sk.add(this.param.BIG.modmul(c, this.sk.value, this.param.order));
        s_sk.mod(this.param.order);

        // tslint:disable-next-line:variable-name
        const s_a = [];
        for (let i = 0; i < D.length; i++) {
            if (D[i] === 0) {
                s_a[i] = new this.param.BIG(0);
                s_a[i].copy(r_a[i]);
                s_a[i].sub(this.param.BIG.modmul(c, this.attrs[i], this.param.order));
                s_a[i].mod(this.param.order);
            } else {
                s_a[i] = false;
            }
        }

        // tslint:disable-next-line:variable-name
        const s_e = new this.param.BIG(0);
        s_e.copy(r_e);
        s_e.sub(this.param.BIG.modmul(c, Cred.sig.e, this.param.order));
        s_e.mod(this.param.order);

        // tslint:disable-next-line:variable-name
        const s_r2 = new this.param.BIG(0);
        s_r2.copy(r_r2);
        s_r2.add(this.param.BIG.modmul(c, r2, this.param.order));
        s_r2.mod(this.param.order);

        // tslint:disable-next-line:variable-name
        const s_r3 = new this.param.BIG(0);
        s_r3.copy(r_r3);
        s_r3.add(this.param.BIG.modmul(c, r3, this.param.order));
        s_r3.mod(this.param.order);

        // tslint:disable-next-line:variable-name
        const s_s_ = new this.param.BIG(0);
        s_s_.copy(r_s_);
        s_s_.sub(this.param.BIG.modmul(c, s_, this.param.order));
        s_s_.mod(this.param.order);

        const pi = {
            c,
            s_sk,
            s_a,
            s_e,
            s_r2,
            s_r3,
            s_s_,
            nonce
        };

        const proof = {
            A_,
            _A,
            B_,
            Nym: this.Nym,
            pi
        };

        return proof;
    }

    Verify(proof: any, D: any[], attrs: any[]): boolean {
        const ipk = this.ipk;

        // make sure A is not infinity
        const O = new this.param.ECP(0); // Add
        // let O = new this.param.ECP(1); // Muliply
        if (proof.A_.equals(O)) {
            // tslint:disable-next-line:no-console
            console.log('A\' == O return true, verify failed.');
            return false;
        }

        const A_ = new this.param.ECP();
        A_.copy(proof.A_);
        const w = new this.param.ECP2();
        w.copy(ipk.w);
        const _A = new this.param.ECP();
        _A.copy(proof._A);
        const g2Dup = new this.param.ECP2();
        g2Dup.copy(this.param.g2);

        A_.affine();
        w.affine();
        _A.affine();
        g2Dup.affine();

        let left = this.param.PAIR.ate(w, A_);
        let right = this.param.PAIR.ate(g2Dup, _A);

        left = this.param.PAIR.fexp(left);
        right = this.param.PAIR.fexp(right);

        if (!left.equals(right)) {
            // tslint:disable-next-line:no-console
            console.log('e(A\', w) == e(_A, g2) return false, verify failed.');
            return false;
        }

        _A.copy(proof._A);
        // tslint:disable-next-line:variable-name
        const _t1 = this.param.PAIR.G1mul(A_, proof.pi.s_e);
        _t1.add(this.param.PAIR.G1mul(ipk.h0, proof.pi.s_r2));
        _A.sub(proof.B_);
        _t1.add(this.param.PAIR.G1mul(_A, this.param.BIG.modneg(proof.pi.c, this.param.order)));

        // ~t2 : (B')^s_r3 · HRand^s_s' · HSk^(-s_sk) · MulAll(hi^(-s_ai)) · (g1·MulAll(hi^ai))^(-c)
        // tslint:disable-next-line:variable-name
        const _t2 = this.param.PAIR.G1mul(proof.B_, proof.pi.s_r3);
        _t2.add(this.param.PAIR.G1mul(ipk.h0, proof.pi.s_s_));
        _t2.add(
            this.param.PAIR.G1mul(ipk.h_sk, this.param.BIG.modneg(proof.pi.s_sk, this.param.order))
        );

        const sum = new this.param.ECP();
        sum.copy(this.param.g1);
        for (let i = 0; i < D.length; i++) {
            if (D[i] === 0) {
                _t2.add(this.param.PAIR.G1mul(ipk.h[i], proof.pi.s_a[i]));
            } else {
                sum.add(this.param.PAIR.G1mul(ipk.h[i], attrs[i]));
            }
        }

        _t2.add(this.param.PAIR.G1mul(sum, this.param.BIG.modneg(proof.pi.c, this.param.order)));

        const c1 = this.param.hashToBN(
            proof.A_,
            proof._A,
            proof.B_,
            proof.Nym,
            _t1,
            _t2,
            this.param.g1,
            ipk.h0,
            ipk.h,
            ipk.w
        );
        const c2 = this.param.hashToBN(proof.pi.nonce, c1, D, attrs);

        if (this.param.BIG.comp(c2, proof.pi.c) !== 0) {
            // tslint:disable-next-line:no-console
            console.log(
                // tslint:disable-next-line:max-line-length
                'c == H(nonce, H(A\', _A, B\', Nym, ~t1, ~t2, g1, HRand, h1, ... , hL, w), (D, I)) return false, verify failed.'
            );
            return false;
        }

        return true;
    }
}

/**
 * CryptoSuite
 *  contains everything in Paring Based Cryptography
 */
export class CryptoSuite {
    curve: string;
    ctx: any;
    order: any;
    PAIR: any;
    ECP: any;
    ECP2: any;
    BIG: any;
    rng: any;
    g1: any;
    g2: any;

    constructor(curve: string) {
        this.curve = curve;
        this.ctx = new CTX(curve);

        this.PAIR = this.ctx.PAIR;          // Set pairing interface
        this.ECP = this.ctx.ECP;            // Set G1 interface
        this.ECP2 = this.ctx.ECP2;          // Set G2 interface
        this.BIG = this.ctx.BIG;            // Set BN interface
        this.rng = new this.ctx.RAND();     // new random number generator

        this.g1 = this.getG1Generator();       // g1
        this.g2 = this.getG2Generator();       // g2
        this.order = this.getOrder(); // n
    }

    getG1Generator() {
        const g1 = new this.ctx.ECP(0);    // new G1
        const x = new this.ctx.BIG(0);
        const y = new this.ctx.BIG(0);
        x.rcopy(this.ctx.ROM_CURVE.CURVE_Gx);
        y.rcopy(this.ctx.ROM_CURVE.CURVE_Gy);
        g1.setxy(x, y);
        return g1;
    }

    getG2Generator() {
        const g2 = new this.ctx.ECP2(0);
        const x = new this.ctx.BIG(0);
        const y = new this.ctx.BIG(0);
        const qx = new this.ctx.FP2(0);
        const qy = new this.ctx.FP2(0);
        x.rcopy(this.ctx.ROM_CURVE.CURVE_Pxa);
        y.rcopy(this.ctx.ROM_CURVE.CURVE_Pxb);
        qx.bset(x, y);
        x.rcopy(this.ctx.ROM_CURVE.CURVE_Pya);
        y.rcopy(this.ctx.ROM_CURVE.CURVE_Pyb);
        qy.bset(x, y);
        g2.setxy(qx, qy);
        return g2;
    }

    getOrder() {
        const r = new this.ctx.BIG(0);     // new BN
        r.rcopy(this.ctx.ROM_CURVE.CURVE_Order);
        return r;
    }

    getRandBN(): any {
        const buf = utils.generateRandomArray(256);
        this.rng.clean();
        this.rng.seed(256, buf);
        const r = this.BIG.randomnum(this.order, this.rng);
        return r;
    }

    getRandG1(): any {
        const r = this.getRandBN();
        const g = this.PAIR.G1mul(this.g1, r);
        return g;
    }

    getRandG2(): any {
        const r = this.getRandBN();
        const g = this.PAIR.G2mul(this.g2, r);
        return g;
    }

    hashToBN(...points: any[]): any {
        let all: any[] = [];
        let tmp: ConcatArray<any> = [];
        points.forEach((p) => {
            if (Array.isArray(p)) {
                if (typeof p[0] === 'number') {
                    all = all.concat(p);
                    tmp = [];
                } else {
                    p.forEach((pp) => {
                        pp.toBytes(tmp);
                        all = all.concat(tmp);
                        tmp = [];
                    });
                }
            } else {
                p.toBytes(tmp);
                all = all.concat(tmp);
                tmp = [];
            }
        });
        const H = new this.ctx.HASH256();
        H.process_array(all);
        const R = H.hash();
        const C = this.BIG.fromBytes(R);
        C.mod(this.order);
        return C;
    }

    genAttrBN(attrs: any): any {
        const HAttr = [];

        for (let i = 0; i < attrs.length; i++) {
            const t = this.getRandBN();
            HAttr[i] = t;
        }

        return HAttr;
    }

    genAttrElement(attrs: any): any {
        const HAttr = [];

        for (let i = 0; i < attrs.length; i++) {
            const t = this.getRandG1();
            HAttr[i] = t;
        }

        return HAttr;
    }
}

/**
 * CryptoBase
 *  contains a refrence to a CryptoSuite instance.
 */
export class CryptoBase {
    param: CryptoSuite;
    constructor(param: CryptoSuite) {
        this.param = param;
    }
}

export class SecretKey extends CryptoBase {
    /*
     * GenerateSk():SecretKey
     * Generate a random secret key.
     */
    static GenerateSk(param: CryptoSuite): SecretKey {
        const x = param.getRandBN(); // isk
        const sk = new SecretKey(param);
        sk.setValue(x);
        return sk;
    }

    value: any;

    constructor(param: CryptoSuite) {
        super(param);
        this.value = new this.param.BIG(0);
    }

    setValue(v: any) {
        this.value.copy(v);
    }

    GenerateIssuerPublicKey(): IssuerPublicKey {
        const x = this.value;
        const w = this.param.PAIR.G2mul(this.param.g2, x); // w
        let r = this.param.getRandBN(); // random number
        // tslint:disable-next-line:variable-name
        const _g1 = this.param.PAIR.G1mul(this.param.g1, r);
        // tslint:disable-next-line:variable-name
        const _g2 = this.param.PAIR.G1mul(_g1, x);

        // zkp - pi
        r = this.param.getRandBN();
        const t1 = this.param.PAIR.G2mul(this.param.g2, r);
        const t2 = this.param.PAIR.G1mul(_g1, r);

        const C = this.param.hashToBN(t1, t2, this.param.g2, _g1, w, _g2);

        const S = this.param.BIG.modmul(C, x, this.param.order);
        S.add(r);
        S.mod(this.param.order);

        const pi = {
            C,
            S
        };

        const pk = new IssuerPublicKey(this.param);
        pk.SetBasicValue(w, _g1, _g2, pi);
        return pk;
    }

    /*
     * ToBytes()
     *  convert secret key to string format.
     *  TODO:: add serialize function.
     */
    ToBytes() {
        if (this.value === undefined) {
            return '';
        }
        return this.value.toBytes();
    }

    /*
     * FromString(s: any)
     *  convert string to a SecretKey.
     *  TODO:: add unserialize function.
     */
    FromBytes(s: any) {
        this.value = this.param.BIG.fromBytes(s);
        return this.value.toString();
    }

    /*
     * GenerateSk():SecretKey
     * Generate a random secret key.
     */
    Rand() {
        const x = this.param.getRandBN(); // isk
        this.setValue(x);
    }

}

export class IssuerPublicKey extends CryptoBase {
    /*
     * COPY(target: IssuerPublicKey):IssuerPublicKey
     *  copy and return a new public key
     */
    static COPY(target: IssuerPublicKey): IssuerPublicKey {
        const pk = new IssuerPublicKey(target.param);
        pk.SetBasicValue(target.w, target._g1, target._g2, target.pi);
        pk.SetAttrValue(target.h0, target.h_sk, target.h, target.attr);
        return pk;
    }

    w: any;
    // tslint:disable-next-line:variable-name
    _g1: any;
    // tslint:disable-next-line:variable-name
    _g2: any;
    pi: {
        C: any,
        S: any
    };
    h0: any;
    // tslint:disable-next-line:variable-name
    h_sk: any;
    h: any;
    attr: any[];

    constructor(param: CryptoSuite) {
        super(param);

        this.w = new this.param.ECP2();
        this._g1 = new this.param.ECP();
        this._g2 = new this.param.ECP();

        const C = new this.param.BIG();
        const S = new this.param.BIG();
        this.pi = {C, S};

        this.h0 = new this.param.ECP();
        this.h_sk = new this.param.ECP();
        this.attr = [];
    }

    /*
     * SetBasicValue(w, _g1, _g2, pi)
     *  set basic values of the public key
     */
    // tslint:disable-next-line:variable-name
    SetBasicValue(w: any, _g1: any, _g2: any, pi: any) {
        this.w.copy(w);
        this._g1.copy(_g1);
        this._g2.copy(_g2);
        this.pi.C.copy(pi.C);
        this.pi.S.copy(pi.S);
    }

    /*
     * SetAttrValue(h0, h_sk, h, attr)
     *  set basic values of the public key
     */
    // tslint:disable-next-line:variable-name
    SetAttrValue(h0: any, h_sk: any, h: any[], attr: any[]) {
        this.h0.copy(h0);
        this.h_sk.copy(h_sk);
        this.h = [];
        this.attr = [];

        for (let i = 0; i < h.length; i++) {
            this.h[i] = new this.param.ECP();
            this.h[i].copy(h[i]);
        }
        for (let i = 0; i < attr.length; i++) {
            this.attr[i] = attr[i];
        }
    }

    /*
     * GenerateAttr(AttributeName)
     *  generates
     *    ipk.h0: rand G1
     *    ipk.h_sk: rand G1
     *    ipk.h[]: Rand G1 array, match to AttributeName
     */
    GenerateAttr(AttributeName: any) {
        const HAttr = this.param.genAttrElement(AttributeName);
        const h0 = this.param.getRandG1();
        // tslint:disable-next-line:variable-name
        const h_sk = this.param.getRandG1();
        const h: any[] = [];

        HAttr.forEach((a: any) => {
            h.push(a);
        });

        this.h0 = h0;
        this.h_sk = h_sk;
        this.h = h;
        this.attr = AttributeName;
    }

    /*
     * VerifyCredentialRequest(Nym, pi, n)
     *  verifies user's credential request
     */
    VerifyCredentialRequest(CR: any): boolean {
        const C = new this.param.BIG(0);
        C.copy(CR.pi.C);

        // tslint:disable-next-line:variable-name
        const _t1 = this.param.PAIR.G1mul(this.h_sk, CR.pi.S);
        _t1.add(this.param.PAIR.G1mul(CR.Nym, this.param.BIG.modneg(C, this.param.order)));

        const _C = this.param.hashToBN(_t1, this.h_sk, CR.Nym, CR.nonce);

        return this.param.BIG.comp(CR.pi.C, _C) === 0;
    }

}

/**
 * Credential
 *  The credential generated from issuer
 */
export class Credential extends CryptoBase {
    sig: {
        A: any,
        B: any,
        e: any,
        s: any
    };
    attrs: any[];

    constructor(param: CryptoSuite) {
        super(param);
        const A = new this.param.ECP();
        const B = new this.param.ECP();
        const e = new this.param.BIG();
        const s = new this.param.BIG();
        this.sig = {A, B, e, s};
        this.attrs = [];
    }

    Set(A: any, B: any, e: any, s: any, attrs: any) {
        this.sig.A.copy(A);
        this.sig.B.copy(B);
        this.sig.e.copy(e);
        this.sig.s.copy(s);

        for (let i = 0; i < attrs.length; i++) {
            this.attrs[i] = new this.param.BIG();
            this.attrs[i].copy(attrs[i]);
        }
    }

    Copy(target: Credential) {
        this.Set(target.sig.A, target.sig.B, target.sig.e, target.sig.s, target.attrs);
    }

}
