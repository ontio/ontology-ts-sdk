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
import { JsonKey, KeyParameters } from './Key';
import { KeyType } from './KeyType';
import { PrivateKey } from './PrivateKey';

/**
 * Interface for Key deserializers
 */
export interface KeyDeserializer {
    getType(): string;
    deserialize(json: JsonKey): PrivateKey;
}

/**
 * Default private key deserializer.
 */
export class DefaultKeyDeserializer implements KeyDeserializer {
    getType(): string {
        return '';
    }

    deserialize(json: JsonKey): PrivateKey {
        if (json.key != null) {
            return new PrivateKey(
                json.key,
                KeyType.fromLabel(json.algorithm),
                KeyParameters.deserializeJson(json.parameters)
            );
        } else {
            throw new Error('Unsupported Key type.');
        }
    }
}

/**
 * Registered key deserializers
 */
const keyDeserializers: KeyDeserializer[] = [];
const defaultKeyDeserializer = new DefaultKeyDeserializer();

/**
 * Registers new external deserializer for private keys.
 *
 * @param deserializer Deserializer instance
 */
export function registerKeyDeserializer(deserializer: KeyDeserializer) {
    keyDeserializers.push(deserializer);
}

/**
 * Creates PrivateKey from Json representation.
 *
 * @param json Json private key representation
 *
 */
export function deserializeFromJson(json: JsonKey): PrivateKey {
    if (json.external == null) {
        return defaultKeyDeserializer.deserialize(json);
    } else {
        for (const deserializer of keyDeserializers) {
            if (deserializer.getType() === json.external.type) {
                return deserializer.deserialize(json);
            }
        }

        throw new Error('Unsupported Key type.');
    }
}
