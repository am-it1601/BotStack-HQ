import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { EnvName } from './botstackhq-bootstrap-stack';

const ENV_SHORT: Record<EnvName, string> = {
  development: 'dev',
  staging: 'stg',
  production: 'prod',
};

export interface BotStackHqDataStackProps extends cdk.StackProps {
  envName: EnvName;
  /** Platform VPC (from BotStackHqNetworkStack) — RDS lands in its isolated subnets. */
  vpc: ec2.IVpc;
}

/**
 * The platform data tier: RDS PostgreSQL 16 + pgvector (ADD §06, §17).
 *
 * Configuration is driven by ADD §06:
 *   - db.t4g.medium (Graviton burstable), Single-AZ at MVP.
 *   - gp3 storage, 100 GB initial with autoscaling to 500 GB.
 *   - 7-day automated backup retention.
 *   - At-rest encryption with a customer-managed KMS key (rotation on).
 *   - Private (isolated subnets), never publicly accessible.
 *
 * Credentials reuse the placeholder secret the Bootstrap stack already created
 * (`botstackhq/<env>/database/credentials`) — attaching the instance backfills
 * host/port/dbInstanceIdentifier into that secret, so the canonical secret name
 * the backend expects (`DATABASE_SECRET_NAME`) stays stable.
 *
 * The 11 domain schemas, the pgvector extension, and RLS policies are NOT created
 * here — they live in the Prisma initial migration and are applied post-deploy
 * via `prisma migrate deploy` run from inside the VPC (see report / Backlog).
 *
 * pgvector needs no parameter-group preload; `CREATE EXTENSION vector` (run by
 * the migration) is sufficient on RDS PostgreSQL 16.
 *
 * ClickUp: 86d34yr3z.
 */
export class BotStackHqDataStack extends cdk.Stack {
  readonly instance: rds.DatabaseInstance;
  /** Attach this SG to compute (Lambda) that needs DB access — it is granted 5432 ingress. */
  readonly dbClientSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: BotStackHqDataStackProps) {
    super(scope, id, props);

    const envShort = ENV_SHORT[props.envName];
    const isProd = props.envName === 'production';
    const removalPolicy = isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;

    cdk.Tags.of(this).add('project', 'botstackhq');
    cdk.Tags.of(this).add('env', envShort);
    cdk.Tags.of(this).add('managed-by', 'cdk');

    // At-rest encryption key (ADD §06). Customer-managed so we own rotation.
    const encryptionKey = new kms.Key(this, 'RdsEncryptionKey', {
      alias: `botstackhq-${envShort}-rds`,
      description: `BotStackHQ ${props.envName} RDS at-rest encryption key.`,
      enableKeyRotation: true,
      removalPolicy,
    });

    // DB SG holds no inline ingress; access is granted only to the client SG.
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: `botstackhq-${envShort}-rds`,
      description: 'BotStackHQ RDS — ingress only from the DB client security group.',
      allowAllOutbound: false,
    });

    // Seam for future compute: anything that attaches this SG may reach Postgres.
    this.dbClientSecurityGroup = new ec2.SecurityGroup(this, 'DbClientSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: `botstackhq-${envShort}-rds-client`,
      description: 'Attach to Lambda/compute that needs RDS access (granted 5432 to the DB SG).',
      allowAllOutbound: true,
    });

    dbSecurityGroup.addIngressRule(
      this.dbClientSecurityGroup,
      ec2.Port.tcp(5432),
      'PostgreSQL from DB client security group',
    );

    // Reuse the placeholder secret created by the Bootstrap stack.
    const credentialsSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'DbCredentials',
      `botstackhq/${envShort}/database/credentials`,
    );

    this.instance = new rds.DatabaseInstance(this, 'Postgres', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE4_GRAVITON,
        ec2.InstanceSize.MEDIUM,
      ),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [dbSecurityGroup],
      publiclyAccessible: false,
      multiAz: false,
      credentials: rds.Credentials.fromSecret(credentialsSecret),
      databaseName: 'botstackhq',
      port: 5432,
      allocatedStorage: 100,
      maxAllocatedStorage: 500,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      storageEncryptionKey: encryptionKey,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: isProd,
      removalPolicy,
    });

    new cdk.CfnOutput(this, 'DbEndpoint', {
      value: this.instance.dbInstanceEndpointAddress,
      description: 'RDS PostgreSQL endpoint host (private — reachable inside the VPC only).',
    });
    new cdk.CfnOutput(this, 'DbPort', {
      value: this.instance.dbInstanceEndpointPort,
      description: 'RDS PostgreSQL port.',
    });
    new cdk.CfnOutput(this, 'DbCredentialsSecretName', {
      value: credentialsSecret.secretName,
      description: 'Secrets Manager name for the DB credentials (host/port backfilled by RDS).',
    });
    new cdk.CfnOutput(this, 'DbClientSecurityGroupId', {
      value: this.dbClientSecurityGroup.securityGroupId,
      description: 'Attach to compute needing RDS access (granted 5432 to the DB SG).',
    });
    new cdk.CfnOutput(this, 'RdsEncryptionKeyArn', {
      value: encryptionKey.keyArn,
      description: 'Customer-managed KMS key encrypting RDS storage at rest.',
    });
  }
}
