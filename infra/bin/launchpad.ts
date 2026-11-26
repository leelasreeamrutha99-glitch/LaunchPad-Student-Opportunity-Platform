#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LaunchpadStack } from '../lib/launchpad-stack';
const app = new cdk.App();
new LaunchpadStack(app, 'LaunchpadWellArchitectedStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
