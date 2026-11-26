# Architecture

```text
Browser -- HTTPS --> CloudFront --> Private S3 assets
Browser -- HTTPS --> API Gateway HTTP API --> Lambda --> DynamoDB
```

## Well-Architected design choices
- **Security:** private S3 origin through CloudFront OAC, S3 public access blocked, HTTPS enforced, DynamoDB encryption, Lambda table-scoped IAM grant, no secrets in browser assets.
- **Reliability:** DynamoDB point-in-time recovery, deletion protection, S3 versioning, retained data resources.
- **Performance efficiency:** CloudFront caching/compression, small Lambda footprint, DynamoDB on-demand capacity.
- **Cost optimization:** serverless services and DynamoDB pay-per-request; one-month log retention.
- **Operational excellence:** CloudWatch logs, health endpoint, infrastructure as code.

## Known demo limitations
The API starter is intentionally minimal. It uses a Scan for demonstration, wildcard CORS, and has no user authentication or per-user data isolation. Do not expose it to real personal data. For public production, add Cognito JWT authorization, restrict CORS to the CloudFront domain, use a user partition key, add throttling/WAF, alarms, tracing, and input validation.
