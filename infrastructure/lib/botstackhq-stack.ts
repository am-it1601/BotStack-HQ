import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Root CloudFormation stack for BotStackHQ ComplianceStack (Phase 1).
 *
 * This is the scaffold. Resources — API Gateway (REST + WebSocket), Lambda
 * functions, EventBridge Scheduler, SQS queues, RDS PostgreSQL + pgvector, S3,
 * CloudFront, Secrets Manager — are added in their dedicated infrastructure
 * tasks per the ADD (§02 architecture diagram, §15 CI/CD).
 */
export class BotStackHqStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'Primary region — ap-south-1 (Mumbai) per ADD §18.',
    });
  }
}
