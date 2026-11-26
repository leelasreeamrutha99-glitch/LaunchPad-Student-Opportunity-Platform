import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export class LaunchpadStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const siteBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true, versioned: true, removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED, compress: true,
      },
      defaultRootObject: 'index.html',
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      enableIpv6: true,
      errorResponses: [{ httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: cdk.Duration.minutes(5) }],
    });
    const table = new dynamodb.Table(this, 'OpportunitiesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true, deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const fn = new lambda.Function(this, 'LaunchpadApi', {
      runtime: lambda.Runtime.NODEJS_22_X, handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      timeout: cdk.Duration.seconds(10), memorySize: 256,
      environment: { TABLE_NAME: table.tableName }, logRetention: logs.RetentionDays.ONE_MONTH,
    });
    table.grantReadWriteData(fn);
    const httpApi = new apigwv2.HttpApi(this, 'LaunchpadHttpApi', {
      corsPreflight: { allowHeaders: ['content-type'],
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.OPTIONS],
        allowOrigins: ['*'], maxAge: cdk.Duration.hours(1) },
    });
    httpApi.addRoutes({ path: '/{proxy+}',
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST, apigwv2.HttpMethod.OPTIONS],
      integration: new integrations.HttpLambdaIntegration('LaunchpadIntegration', fn) });
    httpApi.addRoutes({ path: '/health', methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('HealthIntegration', fn) });
    new cdk.CfnOutput(this, 'FrontendBucketName', { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, 'CloudFrontUrl', { value: `https://${distribution.distributionDomainName}` });
    new cdk.CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', { value: distribution.distributionId });
  }
}
