import CloudWatch, {GetMetricStatisticsInput, GetMetricStatisticsOutput} from "aws-sdk/clients/cloudwatch";

const cloudwatch = new CloudWatch({ region: 'eu-west-1'});

export const getCWMetrics = (params: GetMetricStatisticsInput): Promise<GetMetricStatisticsOutput> => {
    return cloudwatch.getMetricStatistics(params).promise()
};
