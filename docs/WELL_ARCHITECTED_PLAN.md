# Agent Toolkit Well-Architected Review plan

Do not pre-write findings. Run the actual Agent Toolkit Well-Architected Review skill against the deployed AWS account and record what it reports.

## Review evidence checklist
- [ ] Capture the account/region and deployed stack name (never publish account IDs).
- [ ] Run the review across cost optimization, security, performance efficiency and reliability/resilience.
- [ ] Save the full prioritized recommendations.
- [ ] Choose one finding that is relevant, measurable and safe to fix.
- [ ] Record baseline evidence (configuration, metric, or screenshot).
- [ ] Make one focused infrastructure/code change.
- [ ] Deploy and verify the change.
- [ ] Rerun the review and capture the result.
- [ ] Record any remaining risk or trade-off honestly.

## Candidate remediations if identified
1. DynamoDB recovery: this stack enables PITR and deletion protection already.
2. Logging: this stack configures one-month API log retention.
3. IAM: CDK grants table-level read/write permissions.
4. API exposure: add JWT authentication and restrict CORS before real users.
5. CloudFront/S3: verify private S3 and CloudFront OAC/HTTPS.

Only choose a recommendation that the review actually returned. If it recommends a control already present, explain the evidence and select another actionable finding.
