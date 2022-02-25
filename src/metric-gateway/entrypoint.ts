import * as TE from "fp-ts/lib/TaskEither";
import * as A from "fp-ts/Array";
import {Between, Metric, StatsResult} from "../util/types";
import {generateCWMetricStatisticsParams} from "./params";
import {getCWMetrics} from "./calls";
import {flow} from "fp-ts/function";
import {metricsToStatsResult} from "../transformations/transformations";

const getMetricInfo = (between: Between, fun: string) => (metricName: Metric): TE.TaskEither<string, StatsResult> => {
    const paramsForCW = generateCWMetricStatisticsParams(metricName, between);
    const metricToStatsResult = metricsToStatsResult(fun, metricName);

    return flow(
        paramsForCW,
        p => TE.tryCatch(() => getCWMetrics(p), String),
        TE.map(metricToStatsResult)
    )(fun);
};

export const retrieveMetrics = (between: Between, metrics: readonly Metric[]) => (fun: string): TE.TaskEither<string, StatsResult[]> => {
    return A.array.sequence(TE.taskEither)
        (metrics.map(getMetricInfo(between, fun)));
};
