import { IGenerationLogItem } from './manager';

export function getFontSize(t: number): number {
    const val = 1 / (1 + Math.pow(Math.E, -t / 10)) * 15;
    if (val < 8) { return 8; }
    return val;
}        

/** Calculate distance between two points, pythagoras theorem */
export function distance(x1: number, y1: number, x2: number, y2: number) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}
  
  /** Get the angle from one point to another */
export function angleToPoint(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1);
}
  
export function radiansToDegrees(r: number) {
    return r / (Math.PI * 2) * 360;
}
  
export function calculateQ(values: IGenerationLogItem[], Q: number) {
    values.sort((a: IGenerationLogItem, b: IGenerationLogItem) => a.score - b.score);

    if (values.length === 0) { return 0; }

    const index = Math.floor(values.length * Q);

    if (values.length % 2) {
        return values[index].score;
    }
    if (index - 1 < 0) { return 0; }
    return (values[index - 1].score + values[index].score) / 2.0;
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*  why do we need this? 
    coz: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
    this function defaults a radix 10 (decimal system)    
*/
export function atoi (s: string | number, radix: number = 10): number {
    return parseInt(String(s), radix);
}