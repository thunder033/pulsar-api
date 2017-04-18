// tslint:disable-next-line:no-namespace
export namespace Measured {
    class MeterState {
        public mean: number;
        public count: number;
        public currentRate: number;
        public '1MinuteRate': number;
        public '5MinuteRate': number;
        public '15MinuteRate': number;
    }

    class Meter {
        constructor(rateUnit?: number, tickInterval?: number);
        public mark(n: number): void;
        public reset(): void;
        public unref(): void;
        public ref(): void;
        public toJSON(): Measured.MeterState;
    }

    class HistogramState {
        public min: number;
        public max: number;
        public sum: number;
        public variance: number;
        public mean: number;
        public stddev: number;
        public count: number;
        public median: number;
        public p75: number;
        public p95: number;
        public p99: number;
        public p999: number;
    }

    class Histogram {
        constructor();
        public update(value: number, timestamp: string): void;
        public hasValues(): boolean;
        public reset(): void;
        public toJSON(): HistogramState;
    }

    class TimerState {
        public meter: Measured.MeterState;
        public histogram: Measured.HistogramState;
    }

    class Timer {
        constructor(meter?: Measured.Meter, histogram?: Measured.Histogram );
        public update(value: number): void;
        public start(): void;
        public resest(): void;
        public unref(): void;
        public ref(): void;
        public toJSON(): Measured.TimerState;
    }
}
