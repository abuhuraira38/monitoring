import {dateToBetween} from "../../src/util/time";

describe('date to between', () => {
    test('should produce an end time equal to given and a start time three hours earlier', () => {
        const date = new Date(Date.UTC(2020, 10, 20, 10, 15, 30));

        const result = dateToBetween(date);

        expect(result.startTime.toISOString()).toBe('2020-11-20T07:15:30.000Z');
        expect(result.endTime.toISOString()).toBe('2020-11-20T10:15:30.000Z');
    });
});
