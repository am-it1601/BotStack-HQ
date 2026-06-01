import * as cdk from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export type EnvName = 'development' | 'staging' | 'production';

const ENV_SHORT: Record<EnvName, string> = {
  development: 'dev',
  staging: 'stg',
  production: 'prod',
};

export interface BotStackHqBootstrapStackProps extends cdk.StackProps {
  envName: EnvName;
  alertsEmail: string;
  monthlyCostCapUsd?: number;
}

/**
 * Account-level bootstrap: SNS alerts topic + AWS Budgets cost notifications.
 *
 * The word "bootstrap" appears in three distinct places in this repo — don't conflate:
 *   1. `infrastructure/bootstrap/`   = one-time AWS account setup (IAM user that runs CDK).
 *   2. `cdk bootstrap` (CLI command) = CDK's own CDKToolkit stack (assets bucket, deploy roles).
 *   3. This stack                    = Sprint 0 foundational account resources (SNS, budgets, secrets).
 *
 * AWS Budgets is global; the stack itself is deployed in `ap-south-1` per ADD §18,
 * but the budget applies to total account spend across all regions/services.
 *
 * One MONTHLY cost budget with notifications at $50, $100, $200 (expressed as % of
 * the cap) — one budget is cheaper and semantically cleaner than three.
 *
 * ClickUp: 86d34yd4v (parent 86d34yd3b).
 */
export class BotStackHqBootstrapStack extends cdk.Stack {
  readonly alertsTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: BotStackHqBootstrapStackProps) {
    super(scope, id, props);

    const envShort = ENV_SHORT[props.envName];
    const namePrefix = `botstackhq-${envShort}`;
    const cap = props.monthlyCostCapUsd ?? 200;

    cdk.Tags.of(this).add('project', 'botstackhq');
    cdk.Tags.of(this).add('env', envShort);
    cdk.Tags.of(this).add('managed-by', 'cdk');

    this.alertsTopic = new sns.Topic(this, 'AccountAlertsTopic', {
      topicName: `${namePrefix}-account-alerts`,
      displayName: `BotStackHQ ${props.envName} — account alerts`,
    });
    this.alertsTopic.addSubscription(new subs.EmailSubscription(props.alertsEmail));

    this.alertsTopic.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'AllowAwsBudgetsToPublish',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('budgets.amazonaws.com')],
        actions: ['sns:Publish'],
        resources: [this.alertsTopic.topicArn],
      }),
    );

    const dollarThresholds = [50, 100, 200];
    new budgets.CfnBudget(this, 'MonthlyCostBudget', {
      budget: {
        budgetName: `${namePrefix}-monthly-cost`,
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: cap, unit: 'USD' },
        costTypes: {
          includeCredit: false,
          includeRefund: false,
          includeUpfront: true,
          includeRecurring: true,
          includeOtherSubscription: true,
          includeSupport: true,
          includeSubscription: true,
          includeTax: true,
          useBlended: false,
          useAmortized: false,
        },
      },
      notificationsWithSubscribers: dollarThresholds.map((dollar) =>
        actualSpendNotification((dollar / cap) * 100, this.alertsTopic.topicArn),
      ),
    });

    new cdk.CfnOutput(this, 'AlertsTopicArn', {
      value: this.alertsTopic.topicArn,
      description: 'SNS topic for account-level alerts (billing now; ops alarms later).',
    });
    new cdk.CfnOutput(this, 'MonthlyCostBudgetUsd', {
      value: `${cap}`,
      description: 'Monthly cost cap. Notifications at $50, $100, $200.',
    });
  }
}

function actualSpendNotification(
  percent: number,
  snsTopicArn: string,
): budgets.CfnBudget.NotificationWithSubscribersProperty {
  return {
    notification: {
      notificationType: 'ACTUAL',
      comparisonOperator: 'GREATER_THAN',
      threshold: percent,
      thresholdType: 'PERCENTAGE',
    },
    subscribers: [{ subscriptionType: 'SNS', address: snsTopicArn }],
  };
}
