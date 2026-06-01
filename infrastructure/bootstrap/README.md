# Infrastructure Bootstrap

One-time AWS account setup that **cannot** live in CDK because it provisions the IAM identity and tooling that _runs_ CDK. Everything else (Lambdas, RDS, API Gateway, Secrets, Budgets, SNS, etc.) is provisioned via `cdk deploy` from `infrastructure/lib/`.

> ClickUp: parent task [86d34yd3b — [AWS] Account Setup & IAM Configuration](https://app.clickup.com/t/86d34yd3b)

## What lives here

| File                                                   | Purpose                                                                                                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [cdk-deployer-policy.json](./cdk-deployer-policy.json) | Least-privilege IAM policy attached to the `botstackhq-cdk-deployer` user. Scoped to CDK bootstrap resources (`cdk-*`) and BotStackHQ stacks/roles. |
| `README.md` (this file)                                | Step-by-step bootstrap procedure.                                                                                                                   |

## Account facts

- **Account:** `767397924159`
- **Primary region:** `ap-south-1` (Mumbai) — see ADD §18 (data residency)
- **IAM deployer user:** `botstackhq-cdk-deployer`
- **Local AWS profile name:** `botstackhq-deployer`

## Bootstrap procedure

Run these once, with an account-administrator profile (e.g. root with MFA, or the legacy admin user being decommissioned).

### 1. Create the deployer user + customer-managed policy

The policy exceeds the 2,048-byte limit for inline user policies, so it is created as a customer-managed policy (limit 6,144 bytes per version) and attached.

```bash
aws iam create-user \
  --user-name botstackhq-cdk-deployer \
  --tags Key=project,Value=botstackhq Key=managed-by,Value=bootstrap

aws iam create-policy \
  --policy-name botstackhq-cdk-deployer-policy \
  --policy-document file://infrastructure/bootstrap/cdk-deployer-policy.json \
  --description "Least-privilege CDK deploy policy for BotStackHQ. Scoped to cdk-* and BotStackHq* resources." \
  --tags Key=project,Value=botstackhq Key=managed-by,Value=bootstrap

aws iam attach-user-policy \
  --user-name botstackhq-cdk-deployer \
  --policy-arn arn:aws:iam::767397924159:policy/botstackhq-cdk-deployer-policy
```

To update the policy later, edit the JSON and run:

```bash
aws iam create-policy-version \
  --policy-arn arn:aws:iam::767397924159:policy/botstackhq-cdk-deployer-policy \
  --policy-document file://infrastructure/bootstrap/cdk-deployer-policy.json \
  --set-as-default
```

### 2. Generate access keys (one-time secret — capture immediately)

```bash
aws iam create-access-key --user-name botstackhq-cdk-deployer
```

Output contains `AccessKeyId` and `SecretAccessKey`. **Store both in 1Password / secrets vault immediately.** AWS does not show the secret again.

### 3. Configure local profile

```bash
aws configure set aws_access_key_id <AccessKeyId>     --profile botstackhq-deployer
aws configure set aws_secret_access_key <SecretAccessKey> --profile botstackhq-deployer
aws configure set region                ap-south-1     --profile botstackhq-deployer
aws configure set output                json           --profile botstackhq-deployer

# Verify
aws sts get-caller-identity --profile botstackhq-deployer
```

Expected: `Arn: arn:aws:iam::767397924159:user/botstackhq-cdk-deployer`.

### 4. Enable Cost Explorer (manual, console-only)

AWS does not expose an API to enable Cost Explorer on first use. As root:

1. Sign in to <https://console.aws.amazon.com/cost-management/home>
2. Click **Launch Cost Explorer** → wait ~24h for first data.

### 5. (Future) CDK bootstrap

Once Sprint 0 infra tasks pick up provisioning, run:

```bash
AWS_PROFILE=botstackhq-deployer npx cdk bootstrap aws://767397924159/ap-south-1
```

## Policy design notes

- **Scoped resource patterns:** the policy only permits actions on resources matching `cdk-*`, `CDKToolkit`, `BotStackHq*`, or `botstackhq-*`. No account-wide `Resource: "*"` except where AWS requires it (KMS create, identity calls, ECR auth tokens).
- **Bootstrap-time vs. deploy-time:** the policy supports both running `cdk bootstrap` (which creates IAM roles, S3 bucket, ECR repo, SSM param, KMS key — all named `cdk-*`) and ongoing `cdk deploy` (which assumes the bootstrap roles via `sts:AssumeRole`). After bootstrap, day-to-day deploys principally use the assumed roles.
- **Not in scope of this user:** account billing changes, organization-level operations, root credential management. Those stay with root.

## When to revisit

- Multi-account / multi-environment split (separate dev/staging/prod accounts).
- Migrating to a CI/CD deploy role with OIDC federation (GitHub Actions) — at that point the human user becomes optional.
- Tightening `s3:*` and `ecr:*` to specific actions once the resource patterns are stable.

These follow-ups are tracked in [../../context/Backlog.md](../../context/Backlog.md).
