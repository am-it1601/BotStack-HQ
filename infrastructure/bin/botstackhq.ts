#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BotStackHqStack } from '../lib/botstackhq-stack';

const app = new cdk.App();

new BotStackHqStack(app, 'BotStackHqStack', {
  // Region locked to ap-south-1 (Mumbai) per ADD §18 Data Residency & Compliance.
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'ap-south-1',
  },
});

app.synth();
