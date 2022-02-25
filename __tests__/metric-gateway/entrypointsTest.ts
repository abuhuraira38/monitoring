import {mocked} from 'ts-jest/utils';
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import {GetMetricStatisticsOutput} from "aws-sdk/clients/cloudwatch";
import {getCWMetrics} from "../../src/metric-gateway/calls";
import {retrieveMetrics} from "../../src/metric-gateway/entrypoint";
import {StatsResult} from "../../src/util/types";

jest.mock('../../src/metric-gateway/calls');

const getFromTaskEither = async (taskEither: TE.TaskEither<string, StatsResult[]>) => {
    return TE.getOrElseW(() => T.task.of('failed'))(taskEither)();
};

describe('retrieve metrics', () => {
    beforeEach( () => {
        mocked(getCWMetrics as any).mockClear();
    });

    test('should return metrics for a function', async () => {
        mocked(getCWMetrics as any).mockImplementation((): Promise<GetMetricStatisticsOutput> => {
            return Promise.resolve({
                Datapoints: [
                    {
                        Sum: 1,
                    }
                ]
            })
        });

        const result: any = await getFromTaskEither(
            retrieveMetrics({startTime: new Date(), endTime: new Date() }, ['Invocations'])('aFunction')
        );

        expect(result[0].functionName).toBe('aFunction');
        expect(result[0].metric).toBe('Invocations');
        expect(result[0].data).toEqual([{ Sum: 1} ])
    });
});
