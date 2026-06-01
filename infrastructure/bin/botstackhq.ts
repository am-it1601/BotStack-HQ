#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BotStackHqBootstrapStack, EnvName } from '../lib/botstackhq-bootstrap-stack';
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

new BotStackHqBootstrapStack(app, `BotStackHqBootstrap-${envShort}`, {
  envName,
  alertsEmail: 'amit.agarwal@ciphercru.com',
  env,
  description: `BotStackHQ ${envName} account bootstrap — SNS alerts topic + cost budget. Sprint 0.`,
});

new BotStackHqStack(app, 'BotStackHqStack', { env });

app.synth();
