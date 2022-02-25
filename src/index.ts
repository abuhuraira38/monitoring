import * as TE from 'fp-ts/lib/TaskEither';
import * as T from 'fp-ts/lib/Task';
import {Config} from "./util/types";
import {METRICS} from "./util/constants";
import {retrieveMetrics} from "./metric-gateway/entrypoint";
import {pipe} from "fp-ts/pipeable";
import {httpResultFromStats, reducedStatsForFailure, statsReducer, statsResultToStatsSumResult} from "./transformations/transformations";
import {generateConfig} from "./util/config";

const checkLambda = (config: Config) => {
    return pipe(
        retrieveMetrics(config.between, METRICS)(config.functionName),
        TE.map(statsResultToStatsSumResult),
        TE.map(statsReducer),
        TE.fold(
            (message) => T.task.of(reducedStatsForFailure(message)),
            T.task.of),
    );
}

export const handler = async () => {
    return pipe(
        generateConfig(),
        T.fromIO,
        T.chain(checkLambda),
        T.map(httpResultFromStats),
    )();
};
