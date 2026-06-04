import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

/** Subdomain prefixes for the platform endpoints (per ADD §02, §10 and ClickUp 86d34yd9d). */
export const SUBDOMAINS = {
  /** CA dashboard (React app), served by CloudFront — cert lives in us-east-1. */
  dashboard: 'dashboard',
  /** Backend REST API (API Gateway, ap-south-1). */
  api: 'api',
  /** WhatsApp webhook endpoint (API Gateway, ap-south-1). */
  webhook: 'wh',
} as const;

export interface BotStackHqDnsStackProps extends cdk.StackProps {
  /** Registered apex domain, e.g. `botstackhq.com`. Sourced from CDK context. */
  domainName: string;
}

/**
 * Route 53 hosted zone + regional (ap-south-1) ACM certificates.
 *
 * The apex domain is a single global resource — one registered domain, one public
 * hosted zone. It is NOT multiplied per environment; dev/staging endpoints live as
 * additional records/certs under the same zone (see Backlog: multi-env subdomains).
 *
 * What this provisions:
 *   - Public hosted zone for the apex domain (NS + SOA records auto-created by Route 53).
 *   - One regional ACM cert covering `api.<domain>` (+ `wh.<domain>` as SAN) for the
 *     REST API and WhatsApp webhook API Gateway custom domains. DNS-validated in-zone.
 *
 * The CloudFront dashboard cert MUST be in us-east-1 — it is provisioned by
 * BotStackHqEdgeCertStack, which validates against this same zone.
 *
 * Subdomain alias (A/AAAA) records are added by the CloudFront and API Gateway
 * stacks that own those targets — they don't exist yet, so no alias records here.
 *
 * ClickUp: 86d34yd9d (subtasks 86d34yd9p, 86d34ydaa, 86d34ydb4).
 */
export class BotStackHqDnsStack extends cdk.Stack {
  readonly hostedZone: route53.PublicHostedZone;
  readonly regionalCertificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: BotStackHqDnsStackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('project', 'botstackhq');
    cdk.Tags.of(this).add('managed-by', 'cdk');

    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: props.domainName,
      comment: `BotStackHQ apex zone — managed by CDK. ClickUp 86d34yd9d.`,
    });

    this.regionalCertificate = new acm.Certificate(this, 'RegionalCertificate', {
      certificateName: `botstackhq-${props.domainName}-regional`,
      domainName: `${SUBDOMAINS.api}.${props.domainName}`,
      subjectAlternativeNames: [`${SUBDOMAINS.webhook}.${props.domainName}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: this.hostedZone.hostedZoneId,
      description: 'Route 53 public hosted zone ID for the apex domain.',
    });

    // The registered domain's nameservers must be pointed at these values
    // (Registered domains → botstackhq.com → Edit name servers) so the zone goes live.
    new cdk.CfnOutput(this, 'HostedZoneNameServers', {
      value: cdk.Fn.join(', ', this.hostedZone.hostedZoneNameServers ?? []),
      description: 'Authoritative nameservers — set these on the registered domain.',
    });

    new cdk.CfnOutput(this, 'RegionalCertificateArn', {
      value: this.regionalCertificate.certificateArn,
      description: 'ap-south-1 ACM cert for api + wh (API Gateway custom domains).',
    });
  }
}
