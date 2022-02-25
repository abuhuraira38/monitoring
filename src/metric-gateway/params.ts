import {Between, Metric} from "../util/types";
import {THREE_HOURS_IN_SECONDS} from "../util/constants";

export const generateCWMetricStatisticsParams = (metricName: Metric, between: Between) => (fun: string) => {
    return {
        StartTime: between.startTime,
        EndTime: between.endTime,
        MetricName: metricName,
        Namespace: 'AWS/Lambda',
        Period: THREE_HOURS_IN_SECONDS,
        Dimensions: [
            {
                Name: 'FunctionName',
                Value: fun,
            },
        ],
        Statistics: ['Sum'],
    };
};
