import {JwtPayload} from "./jwt-payload.class";
import {VcPayload} from "./vc-payload.class";
import {VpPayload} from "./vp-payload.class";

export enum PayloadType {
    VC,
    VP
}

export class PayloadFactory {
    public static payloadFromJson(json: any, payloadType: PayloadType): JwtPayload {
        switch (payloadType) {
            case PayloadType.VC:
                return VcPayload.payloadFromJson(json);
            case PayloadType.VP:
                return VpPayload.payloadFromJson(json);
        }
    }
}
