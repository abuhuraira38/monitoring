import {io, IO, map} from "fp-ts/IO";
import {Between, Config} from "./types";
import {create} from "fp-ts/Date";
import {dateToBetween} from "./time";
import {pipe} from "fp-ts/pipeable";
import {sequenceT} from "fp-ts/Apply";

const addToConfig = (between: Between, functionName: string) => ({
    between,
    functionName,
});

export const generateConfig = (): IO<Config> => {
    return pipe(
        sequenceT(io)(
            map(dateToBetween)(create),
            () => process.env.FUNCTION_NAME,
        ),
        map(([a, b]) => addToConfig(a, b))
    );
};
