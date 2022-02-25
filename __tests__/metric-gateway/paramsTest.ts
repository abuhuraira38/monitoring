import {generateCWMetricStatisticsParams} from "../../src/metric-gateway/params";
import {Metric} from "../../src/util/types";

const metrics: Metric[] = ['Invocations', 'Errors', 'Throttles'];

describe('generate cw metric statistics params', () => {
    metrics.forEach(m => {
        test(`should generate the right params for ${m}`, () => {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 1000);

            const result = generateCWMetricStatisticsParams(m, {startTime, endTime})('aFunction');

            expect(result.StartTime).toEqual(startTime);
            expect(result.EndTime).toEqual(endTime);
            expect(result.MetricName).toBe(m);
            expect(result.Namespace).toBe('AWS/Lambda');
            expect(result.Period).toBeTruthy();
            expect(result.Dimensions[0].Name).toBe('FunctionName');
            expect(result.Dimensions[0].Value).toBe('aFunction');
            expect(result.Statistics[0]).toBe('Sum');
        });
    });
});
