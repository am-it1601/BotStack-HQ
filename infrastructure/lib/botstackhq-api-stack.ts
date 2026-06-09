import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { EnvName } from './botstackhq-bootstrap-stack';

const ENV_SHORT: Record<EnvName, string> = {
  development: 'dev',
  staging: 'stg',
  production: 'prod',
};

export interface BotStackHqApiStackProps extends cdk.StackProps {
  envName: EnvName;
}

/**
 * The API tier (ADD §03, §05): the NestJS backend Lambda fronted by an
 * API Gateway REST API (all `/v1/*` traffic) and a WebSocket API (real-time
 * dashboard push). This task scaffolds the routes; the handlers behind them are
 * filled in by their dedicated tasks.
 *
 * REST: a single Lambda-proxy integration forwards every path to the backend
 * Lambda, which carries the `/v1` global prefix and Nest's own routing — so
 * adding an endpoint in NestJS needs no API Gateway change.
 *
 * WebSocket: the three platform routes (`$connect`, `$disconnect`, `$default`)
 * are mapped to the same backend Lambda. JWT authorisation on `$connect` and
 * connection-state persistence in RDS are wired in their later tasks (api_rules
 * §2).
 *
 * Deferred to the packaging/deploy task (see Backlog): production bundling of
 * the Lambda (node_modules + Prisma engine), VPC attachment via the Data
 * stack's `dbClientSecurityGroup`, and the JWT Lambda authorizer. The code
 * asset here points at the backend's compiled `dist/` so the stack synthesises;
 * it is not a deployable bundle on its own yet.
 *
 * ClickUp: 86d34ytmy.
 */
export class BotStackHqApiStack extends cdk.Stack {
  readonly backendFunction: lambda.Function;
  readonly restApi: apigw.LambdaRestApi;
  readonly webSocketApi: apigwv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: BotStackHqApiStackProps) {
    super(scope, id, props);

    const envShort = ENV_SHORT[props.envName];

    cdk.Tags.of(this).add('project', 'botstackhq');
    cdk.Tags.of(this).add('env', envShort);
    cdk.Tags.of(this).add('managed-by', 'cdk');

    // NestJS-on-Lambda via @vendia/serverless-express (ADD §04 Lambda Adapter).
    // The handler is exported from `src/lambda.ts` → compiled to `dist/lambda.js`.
    this.backendFunction = new lambda.Function(this, 'BackendFunction', {
      functionName: `botstackhq-${envShort}-backend`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'apps', 'backend', 'dist')),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      architecture: lambda.Architecture.ARM_64,
      description: 'BotStackHQ NestJS business-logic API (serverless-express).',
    });

    // REST API — Lambda-proxy for every route. NestJS owns the `/v1` prefix and
    // path routing, so the gateway needs no per-route config (api_rules §1).
    this.restApi = new apigw.LambdaRestApi(this, 'RestApi', {
      handler: this.backendFunction,
      restApiName: `botstackhq-${envShort}-api`,
      description: 'BotStackHQ REST API — proxies all /v1/* traffic to the backend Lambda.',
      proxy: true,
      deployOptions: { stageName: envShort },
    });

    // WebSocket API — the three platform routes mapped to the backend Lambda.
    const wsIntegration = (routeId: string): apigwv2.WebSocketRouteOptions => ({
      integration: new apigwv2Integrations.WebSocketLambdaIntegration(
        routeId,
        this.backendFunction,
      ),
    });

    this.webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi', {
      apiName: `botstackhq-${envShort}-ws`,
      description: 'BotStackHQ WebSocket API — real-time CA dashboard push.',
      connectRouteOptions: wsIntegration('ConnectIntegration'),
      disconnectRouteOptions: wsIntegration('DisconnectIntegration'),
      defaultRouteOptions: wsIntegration('DefaultIntegration'),
    });

    const wsStage = new apigwv2.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: envShort,
      autoDeploy: true,
    });

    new cdk.CfnOutput(this, 'RestApiUrl', {
      value: this.restApi.url,
      description: 'REST API invoke URL (append v1/... — e.g. <url>v1/health).',
    });
    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: wsStage.url,
      description: 'WebSocket API connection URL (wss://).',
    });
    new cdk.CfnOutput(this, 'BackendFunctionName', {
      value: this.backendFunction.functionName,
      description: 'NestJS backend Lambda function name.',
    });
  }
}
