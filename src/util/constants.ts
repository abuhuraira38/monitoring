export const METRICS = [
    'Invocations',
    'Errors',
    'Throttles',
] as const;

export const THREE_HOURS_IN_SECONDS = 10800;

const ONE_HOUR_EPOCH_MILLI = 60 * 60 * 1000;
export const THREE_HOURS_EPOCH_MILLI = 3 * ONE_HOUR_EPOCH_MILLI;
