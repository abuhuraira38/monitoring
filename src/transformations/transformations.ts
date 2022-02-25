import {GetMetricStatisticsOutput} from "aws-sdk/clients/cloudwatch";
import {fold, Monoid, monoidSum} from "fp-ts/Monoid";
import { getStructMonoid } from 'fp-ts/lib/Monoid'
import {HttpResult, Metric, ReducedStats, StatsResult, StatsSumResult, Status} from "../util/types";
import { memoize } from 'fp-ts-std/Function'
import { eqString } from 'fp-ts/Eq'

export const metricsToStatsResult = (functionName: string, metricName: Metric) => (d: GetMetricStatisticsOutput): StatsResult => ({functionName, metric: metricName, data: d.Datapoints});

export const statsResultToStatsSumResult = (results: readonly StatsResult[]): StatsSumResult[] =>
    results.map(b => ({
        functionName: b.functionName,
        metric: b.metric,
        sum: fold(monoidSum)(b.data.map(d => d.Sum)),
    }));

const statusMonoid: Monoid<Status> = {
    concat: (x, y) =>
        x === 'ERR' || y === 'ERR' ? 'ERR'
            : (x === 'WARN' || y === 'WARN' ? 'WARN' : 'OK'),
    empty: 'OK'
};

const messageMonoid: Monoid<string> = {
    concat: (x, y) => (x + ' ' + y).trim(),
    empty: '',
};

const ReducedStatsMonoid: Monoid<ReducedStats> = getStructMonoid({
    status: statusMonoid,
    message: messageMonoid
});

const statsSumToStatusAndMessage = (invokes: number) => (s: StatsSumResult) => {
    let status: Status = 'OK';
    let message = '';

    switch (s.metric) {
        case 'Invocations': {
            status = invokes === 0 ? 'WARN' : 'OK';
            message = invokes === 0 ? 'not invoked' : 'invokes ok';
        }
            break;
        case 'Errors': {
            const percentage = invokes !== 0 ? s.sum / invokes * 100 : 0;
            status = percentage >= 5 ? 'ERR' : 'OK';
            message = percentage >= 5 ? 'throwing errors' : 'no errors';
        }
            break;
        case 'Throttles': {
            const percentage = invokes !== 0 ? s.sum / invokes * 100 : 0;
            status = percentage >= 1 ? 'WARN' : 'OK';
            message = percentage >= 1 ? 'being throttled' : 'no throttles';
        }
            break;
        default:
            const _exhaustiveCheck: never = s.metric;
            return _exhaustiveCheck;
    }

    return {
        status, message,
    }
};

//  if this is by function, additional logic is needed; temp export
export const statsReducer = (results: readonly StatsSumResult[]): ReducedStats => {
    const invocations = results
        .filter(m => m.metric === 'Invocations')
        .map(m => m.sum).shift() || 0;

    const singleStatsSumMapper = statsSumToStatusAndMessage(invocations);

    return fold(ReducedStatsMonoid)
        (results.map(singleStatsSumMapper));
};

// export const combined = (results: readonly StatsResult[]): ReducedStats => {
//     return flow(
//         statsResultToStatsSumResult,
//         statsReducer,
//     )(results);
// };

// export const combined = (results: readonly StatsResult[]): HttpResult => {
//     return flow(
//         statsResultToStatsSumResult,
//         statsReducer,
//         httpResultFromStats,
//     )(results);
// };

export const httpResultFromStats = (result: ReducedStats): HttpResult => ({
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
});

const reducedStatsForFailureNoMem = (message: string): ReducedStats => {
    console.log('Called no mem')
    return {
        status: 'ERR',
        message: `Could not retrieve info for this function. Error: ${message}`,
    }
};
export const reducedStatsForFailure = memoize(eqString)(reducedStatsForFailureNoMem);
