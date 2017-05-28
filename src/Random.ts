class Random {
    private static seed: number = 1;
    private static randomSeedStart: number = 100000;
    private static randomSeedEnd: number = 999999;

    static init(seed?: number) : void {
        if (seed == null) {
            this.seed = Math.floor((Math.random() * (this.randomSeedEnd - this.randomSeedStart + 1)) + this.randomSeedStart);
        }
        this.seed = seed;
    }

    private static next() : number {
        let x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    static getNext(start: number, end: number) { // returns next number inclusive
        return Math.floor((this.next() * (end - start + 1)) + start);
    }
}