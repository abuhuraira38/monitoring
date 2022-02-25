import {Between} from "./types";
import {THREE_HOURS_EPOCH_MILLI} from "./constants";

export const dateToBetween = (curr: Date): Between => ({
    startTime: new Date(Number(curr) - THREE_HOURS_EPOCH_MILLI),
    endTime: curr,
});
