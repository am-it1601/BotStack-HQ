import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { SUBDOMAINS } from './botstackhq-dns-stack';

export interface BotStackHqEdgeCertStackProps extends cdk.StackProps {
  /** Registered apex domain, e.g. `botstackhq.com`. */
  domainName: string;
  /** The hosted zone from BotStackHqDnsStack, used for DNS validation. */
  hostedZone: route53.IHostedZone;
}

/**
 * us-east-1 ACM certificate for the CloudFront-served dashboard.
 *
 * CloudFront only accepts certificates from us-east-1, regardless of the origin's
 * region — so this lives in its own stack pinned to us-east-1 while the rest of the
 * platform stays in ap-south-1 (ADD §18). The cert is DNS-validated against the
 * hosted zone owned by BotStackHqDnsStack (Route 53 is global). Sharing the zone
 * across regions requires `crossRegionReferences: true` on both stacks.
 *
 * ClickUp: 86d34yd9d (subtask 86d34ydb4).
 */
export class BotStackHqEdgeCertStack extends cdk.Stack {
  readonly dashboardCertificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: BotStackHqEdgeCertStackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('project', 'botstackhq');
    cdk.Tags.of(this).add('managed-by', 'cdk');

    this.dashboardCertificate = new acm.Certificate(this, 'DashboardCertificate', {
      certificateName: `botstackhq-${props.domainName}-dashboard-edge`,
      domainName: `${SUBDOMAINS.dashboard}.${props.domainName}`,
      validation: acm.CertificateValidation.fromDns(props.hostedZone),
    });

    new cdk.CfnOutput(this, 'DashboardCertificateArn', {
      value: this.dashboardCertificate.certificateArn,
      description: 'us-east-1 ACM cert for the CloudFront dashboard distribution.',
    });
  }
}
