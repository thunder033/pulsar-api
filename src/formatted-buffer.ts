/**
 * Created by gjrwcs on 4/11/2017.
 */

import {
    BufferFormat, ByteSizes, DataType, FieldType, NUM_TYPE_BITS, SIZE_MASK,
    TYPE_MASK,
} from 'pulsar-lib/dist/src/game-params';
import {Clock} from './clock';

function getSize(type: DataType) {
    if (type > TYPE_MASK) {
        return (type & SIZE_MASK) >> NUM_TYPE_BITS;
    } else if (type < 0) {
        const typeCode = (~type) & TYPE_MASK;
        const numElems = (~type) & SIZE_MASK >> NUM_TYPE_BITS;
        return ByteSizes.get(typeCode) * numElems;
    } else {
        return ByteSizes.get(type);
    }
}

function getPrimitiveType(type: DataType) {
    return ((type >> 31) ^ type) & TYPE_MASK;
}

export class FormattedBuffer {

    // mapping of data types to buffer write methods
    private static readonly writeMethods: Map<DataType, string> = new Map<DataType, string>([
        [DataType.String, 'write'],
        [DataType.Float, 'writeFloatBE'],
        [DataType.Double, 'writeDoubleBE'],
        [DataType.Int8, 'writeInt8'],
        [DataType.Int16, 'writeInt16BE'],
        [DataType.Int32, 'writeInt32BE'],
    ]);

    private static clock: Clock = new Clock();

    private buffer: Buffer;
    private format: BufferFormat; // *ORDERED* listing of fields in the buffer
    private timestamp: number; // the last time the buffer was updated
    private fieldSizes: Map<string, number>;
    private positions: Map<string, number>;
    private arrayBuffers: Map<string, Buffer>;

    private updateOps: Function[];

    private metaDataLength: number;

    /**
     * Update the size map using the format map. Replaces any override size keys
     * ("key:size") in the format map with just the size (ex. id:36 -> id)
     * @param format {Map}
     * @param sizes {Map}
     */
    public static parseFieldSizes(format: BufferFormat, sizes) {
        // fields to delete at the end
        function assertValidSize(size: number, field: string) {
            if (isNaN(size) || size === 0) {
                throw new TypeError(`Buffer field ${field} resolved to invalid size: ${size}`);
            }
        }

        format.forEach((type: DataType, field) => {
            const size = getSize(type);
            assertValidSize(size, field);
            sizes.set(field, size);
        });
    }

    constructor(format: BufferFormat, metaData: FormattedBuffer = null) {
        this.format = new Map(format.entries());
        this.fieldSizes = new Map<string, number>();
        FormattedBuffer.parseFieldSizes(this.format, this.fieldSizes);

        this.positions = new Map<string, number>();

        const formatSize = this.getFormatSize(this.format);
        if (metaData instanceof FormattedBuffer) {
            this.metaDataLength = metaData.getData().length;
            this.buffer = Buffer.alloc(formatSize + this.metaDataLength);
            metaData.getData().copy(this.buffer, 0, 0, this.metaDataLength);
            metaData.positions.forEach((position, field) => {
                this.positions.set(field, position);
            });
        } else {
            this.metaDataLength = 0;
            this.buffer = Buffer.alloc(formatSize);
        }

        let position = this.metaDataLength;
        this.format.forEach((type, field) => {
            this.positions.set(field, position);
            position += this.fieldSizes.get(field);
        });

        this.updateOps = [];
        position = this.metaDataLength;
        this.format.forEach((type, field) => {
            const size = this.fieldSizes.get(field);
            const primitiveType = getPrimitiveType(type);
            const method = FormattedBuffer.writeMethods.get(primitiveType);
            if (type > 0) {
                this.updateOps.push(((p, m, f) => {
                    return (e) => this.buffer[m](e[f], p);
                })(position, method, field));
            } else {
                this.updateOps.push(((p, m, f, s) => {
                    return (e) => Buffer.from(e[f].buffer).copy(this.buffer, p, 0, s);
                })(position, method, field, size));
            }

            position += size;
        });
    }

    public getFieldPosition(field: string) {
        return this.positions.get(field);
    }

    public getData(): Buffer {
        return this.buffer;
    }

    /**
     * Calculate the total number of bytes required to store the format map
     * @param format {Map}
     * @returns {number} the size of the format
     */
    public getFormatSize(format: Map<string, FieldType>): number {
        let size = 0;
        format.forEach((type, field) => {
            size += this.fieldSizes.get(field);
        });

        return size;
    }

    /**
     * Iterate through all fields in the BNE format and write the current value to
     * the buffer
     */
    public updateBuffer(entity: any) {
        this.timestamp = FormattedBuffer.clock.now() || 0;
        this.buffer.writeDoubleBE(this.timestamp, this.getFieldPosition('timestamp'));
        const l = this.updateOps.length;
        for (let i = 0; i < l; i ++) {
            this.updateOps[i](entity);
        }
    }
}
