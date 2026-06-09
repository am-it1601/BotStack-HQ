import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvName } from './botstackhq-bootstrap-stack';

const ENV_SHORT: Record<EnvName, string> = {
  development: 'dev',
  staging: 'stg',
  production: 'prod',
};

export interface BotStackHqNetworkStackProps extends cdk.StackProps {
  envName: EnvName;
}

/**
 * The platform VPC (ap-south-1) that stateful and compute resources attach to.
 *
 * Deliberately minimal for the MVP data tier:
 *   - Two AZs — the minimum RDS requires for a DB subnet group, even though the
 *     instance itself is Single-AZ at MVP (ADD §06).
 *   - `natGateways: 0` — RDS needs no outbound internet, and a NAT gateway is
 *     ~$32/mo each, which would dominate the $200 account budget (Bootstrap
 *     stack). Isolated (no-egress) subnets are correct and cheapest here.
 *     Compute that later needs both RDS and the internet adds VPC endpoints or
 *     a NAT in its own task.
 *   - Only PRIVATE_ISOLATED subnets — no public subnets, no internet gateway.
 *     RDS is never publicly accessible (ADD §17, infra code standards).
 *
 * ClickUp: 86d34yr3z.
 */
export class BotStackHqNetworkStack extends cdk.Stack {
  readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: BotStackHqNetworkStackProps) {
    super(scope, id, props);

    const envShort = ENV_SHORT[props.envName];

    cdk.Tags.of(this).add('project', 'botstackhq');
    cdk.Tags.of(this).add('env', envShort);
    cdk.Tags.of(this).add('managed-by', 'cdk');

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: `botstackhq-${envShort}-vpc`,
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'db',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'Platform VPC id (private-isolated subnets, no NAT).',
    });
  }
}
