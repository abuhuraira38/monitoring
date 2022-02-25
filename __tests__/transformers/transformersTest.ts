import {
    httpResultFromStats, metricsToStatsResult,
    reducedStatsForFailure, statsReducer, statsResultToStatsSumResult,
} from "../../src/transformations/transformations";
import {ReducedStats, StatsResult, StatsSumResult} from "../../src/util/types";
import {GetMetricStatisticsOutput} from "aws-sdk/clients/cloudwatch";

describe('http result from stats', () => {
    test('should return a status code, headers and body', () => {
        const reducedStats: ReducedStats = {
            status: 'WARN',
            message: 'just a message',
        };

        const result = httpResultFromStats(reducedStats)

        expect(result.statusCode).toBe(200);
        expect(result.body).toBe("{\"status\":\"WARN\",\"message\":\"just a message\"}");
        expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });
});

describe('reduced stats for failure', () => {
    test('should return an err with the given stack name and message', () => {
        const result = reducedStatsForFailure('failure message');

        expect(result.status).toBe('ERR');
        expect(result.message).toEqual("Could not retrieve info for this function. Error: failure message");
    });
});

describe('metrics to stats result', () => {
    test('should map function, metric and metric statistics to stats result', () => {
        const data = {
            Datapoints: [
                {
                    Sum: 1
                },
                {
                    Sum: 3
                },
            ]
        };

        const result = metricsToStatsResult('aFunction', 'Invocations')(data as GetMetricStatisticsOutput);

        expect(result.functionName).toBe('aFunction');
        expect(result.metric).toBe('Invocations');
        expect(result.data).toEqual([{"Sum": 1}, {"Sum": 3}]);
    });
});

describe('stats result to stats sum result', () => {
    test('should change stats result to stats sum result', () => {
        const data: StatsResult = {
            functionName: 'aFunction',
            metric: 'Invocations',
            data: [
                {
                    Sum: 1
                },
                {
                    Sum: 3
                },
            ]
        };

        const results = statsResultToStatsSumResult([data]);

        const first = results[0];

        expect(first.functionName).toBe('aFunction');
        expect(first.metric).toBe('Invocations');
        expect(first.sum).toBe(4);
    });
});

describe('stats reducer', () => {
    test('should return ok if there are invocations and few errors and no throttles', () => {
        const data: StatsSumResult[] = [
            {
                functionName: 'first',
                metric: 'Invocations',
                sum: 70,
            },
            {
                functionName: 'second',
                metric: 'Errors',
                sum: 2,
            },
        ];

        const result = statsReducer(data);

        expect(result.status).toBe('OK');
        expect(result.message).toEqual("invokes ok no errors");
    });

    test('should return warn if there are no invocations and no errors or throttles', () => {
        const data: StatsSumResult[] = [
            {
                functionName: 'first',
                metric: 'Invocations',
                sum: 0,
            },
            {
                functionName: 'second',
                metric: 'Errors',
                sum: 0,
            },
        ];

        const result = statsReducer(data);

        expect(result.status).toBe('WARN');
        expect(result.message).toEqual("not invoked no errors");
    });

    test('should return err if there are too many errors', () => {
        const data: StatsSumResult[] = [
            {
                functionName: 'second',
                metric: 'Errors',
                sum: 5,
            },
            {
                functionName: 'second',
                metric: 'Invocations',
                sum: 90,
            }
        ];

        const result = statsReducer(data);

        expect(result.status).toBe('ERR');
        expect(result.message).toEqual("throwing errors invokes ok");
    });

    test('should return warn if there are too many throttles', () => {
        const data: StatsSumResult[] = [
            {
                functionName: 'second',
                metric: 'Errors',
                sum: 3,
            },
            {
                functionName: 'second',
                metric: 'Invocations',
                sum: 75,
            },
            {
                functionName: 'second',
                metric: 'Throttles',
                sum: 2,
            }
        ];

        const result = statsReducer(data);

        expect(result.status).toBe('WARN');
        expect(result.message).toEqual("no errors invokes ok being throttled");
    });
});
