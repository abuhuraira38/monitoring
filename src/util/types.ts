import {METRICS} from "./constants";
import {Datapoints} from "aws-sdk/clients/cloudwatch";

export type Metric = (typeof METRICS)[number]

export type Between = {
    readonly startTime: Date,
    readonly endTime: Date,
}

export type StatsResult = {
    readonly functionName: string,
    readonly metric: Metric,
    readonly data: Datapoints,
}



export type StatsSumResult = {
    readonly functionName: string,
    readonly metric: Metric,
    readonly sum: number,
}



export type Status = 'OK' | 'WARN' | 'ERR';

export type ReducedStats = {
    readonly status: Status,
    readonly message: string,
}



type StatusCode = 200 | 500;

export type HttpResult = {
    readonly statusCode: StatusCode,
    readonly body: string,
    readonly headers: Record<string, string>,
};

export type Config = {
    between: Between,
    functionName: string,
};
