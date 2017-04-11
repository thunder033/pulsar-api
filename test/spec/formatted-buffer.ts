/**
 * Created by gjrwcs on 4/11/2017.
 */

import { only, skip, slow, suite, test, timeout } from 'mocha-typescript';
import { expect } from 'chai';
import { FormattedBuffer } from '../../src/formatted-buffer';
import {DataFormat} from 'pulsar-lib/dist/src/game-params';
import {Clock} from '../../src/clock';

class TestEntity {
    public id: string = 'testID';
    public type: number = 0;
    public timestamp: number = 1111;

    public sliceIndex: number = 100;
    public barOffset: number = 93.32;
    public stateValue: number = 18;
}

function getAvgTime(samples: Float64Array): number {
    let avgTime = 0;
    const l = samples.length;
    for (let i = 1; i < l; i ++) {
        avgTime += (samples[i] - samples[i - 1]) / l;
    }
    return avgTime * 1000;
}

@suite class FormattedBufferSpec {
    fBuffer: FormattedBuffer;
    metaData: FormattedBuffer;
    testEntity: TestEntity;

    before() {
        this.metaData = new FormattedBuffer(DataFormat.NETWORK_ENTITY);
    }

    @test 'Can instantiate FormattedBuffer w/o metadata'() {
        expect(this.metaData).to.be.instanceof(FormattedBuffer);
    }

    @test 'Can instantiate FormattedBuffer w/ metadata'() {
        const fBuffer = new FormattedBuffer(DataFormat.WARP_DRIVE, this.metaData);
        expect(fBuffer).to.be.instanceof(FormattedBuffer);
    }

    @test 'Parses field byte sizes from format type map'() {
        expect(this.metaData.getFieldPosition('id')).to.equal(0);
        expect(this.metaData.getFieldPosition('type')).to.equal(36);
        expect(this.metaData.getFieldPosition('timestamp')).to.equal(37);
        expect(this.metaData.getFieldPosition('format')).to.equal(45);
    }

    @test 'Updates buffer with current values'() {
        this.testEntity = new TestEntity();
        this.metaData.updateBuffer(this.testEntity);
        expect(this.metaData.getData().toString('utf8', 0, 36)).to.include(this.testEntity.id);
        expect(this.metaData.getData().readInt8(36)).to.equal(this.testEntity.type);
        expect(this.metaData.getData().readDoubleBE(37)).to.equal(this.testEntity.timestamp);
    }

    @skip @test 'Update performance'() {
        const fBuffer = new FormattedBuffer(DataFormat.WARP_DRIVE, this.metaData);
        const buffer = Buffer.alloc(fBuffer.getData().length);

        const testEntity = new TestEntity();
        fBuffer.updateBuffer(testEntity);
        const position = this.metaData.getData().length;
        const clock = new Clock();
        function updateBuffer() {
            buffer.writeDoubleBE(clock.now(), 1);
            buffer.writeInt16BE(testEntity.sliceIndex, position);
            buffer.writeDoubleBE(testEntity.sliceIndex, position + 2);
            buffer.writeInt8(testEntity.stateValue, position + 10);
        }

        function updateEntity(index) {
            if (index % 2 === 0) {
                testEntity.sliceIndex = 1125;
                testEntity.barOffset = -0.23423;
                testEntity.stateValue = 2;
            } else {
                testEntity.sliceIndex = 23;
                testEntity.barOffset = -0.4213;
                testEntity.stateValue = 1;
            }
        }

        const sampleCount = 25000;
        const samples = new Float64Array(sampleCount);
        for (let i = 0; i < sampleCount; i++) {
            updateEntity(i);
            fBuffer.updateBuffer(testEntity);
            samples[i] = clock.now();
        }
        console.log(`Formatter Buffer avg time: ${getAvgTime(samples)} ms (${sampleCount} samples)`);

        samples.fill(0);
        updateBuffer();
        for (let i = 0; i < sampleCount; i++) {
            updateEntity(i);
            updateBuffer();
            samples[i] = clock.now();
        }

        console.log(`Raw Buffer avg time: ${getAvgTime(samples)} ms (${sampleCount} samples)`);

        samples.fill(0);
        for (let i = 0; i < sampleCount; i++) {
            updateEntity(i);
            JSON.stringify(testEntity);
            samples[i] = clock.now();
        }

        console.log(`JSON Buffer avg time: ${getAvgTime(samples)} ms (${sampleCount} samples)`);
    }
}
