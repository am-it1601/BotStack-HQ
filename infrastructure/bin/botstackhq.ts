#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BotStackHqBootstrapStack, EnvName } from '../lib/botstackhq-bootstrap-stack';
import { BotStackHqDnsStack } from '../lib/botstackhq-dns-stack';
import { BotStackHqEdgeCertStack } from '../lib/botstackhq-edge-cert-stack';
import { BotStackHqStack } from '../lib/botstackhq-stack';

const app = new cdk.App();

// Region locked to ap-south-1 (Mumbai) per ADD §18 Data Residency & Compliance.
// Hardcoded — never read from CDK_DEFAULT_REGION/AWS_REGION env vars to prevent
// accidental cross-region deploys when a shell session inherits a stale region.
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'ap-south-1',
};

const envName = (app.node.tryGetContext('envName') ?? 'development') as EnvName;
const envShort = { development: 'dev', staging: 'stg', production: 'prod' }[envName];

// The apex domain is a single global resource (one registered domain, one zone),
// so it is not env-suffixed. Overridable via `-c domainName=...` for non-prod zones.
const domainName = (app.node.tryGetContext('domainName') ?? 'botstackhq.com') as string;

new BotStackHqBootstrapStack(app, `BotStackHqBootstrap-${envShort}`, {
  envName,
  alertsEmail: 'amit.agarwal@ciphercru.com',
  env,
  description: `BotStackHQ ${envName} account bootstrap — SNS alerts topic + cost budget. Sprint 0.`,
});

const dnsStack = new BotStackHqDnsStack(app, 'BotStackHqDns', {
  env,
  domainName,
  crossRegionReferences: true,
  description: `BotStackHQ Route 53 hosted zone + ap-south-1 ACM certs (api, wh). ClickUp 86d34yd9d.`,
});

// CloudFront mandates us-east-1 certs; this stack is pinned there and validates
// against the ap-south-1 zone via cross-region references (ADD §10, §18).
new BotStackHqEdgeCertStack(app, 'BotStackHqEdgeCert', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  domainName,
  hostedZone: dnsStack.hostedZone,
  crossRegionReferences: true,
  description: `BotStackHQ us-east-1 ACM cert for CloudFront dashboard. ClickUp 86d34yd9d.`,
});

new BotStackHqStack(app, 'BotStackHqStack', { env });

app.synth();
