# LaunchPad — Student Opportunity Command Center

A polished, interactive student opportunity tracker with a serverless AWS deployment path.

## What it does
- Discover and filter internships, campus ambassador programs, challenges and learning events.
- Save opportunities and track application status.
- Track learning streaks, completed challenges and earned badges.
- View a personal progress dashboard.
- Run locally in Demo Mode with sample data and browser local storage.
- Optionally connect to an AWS API backed by API Gateway, Lambda and DynamoDB.

## Architecture
- **Frontend:** static HTML/CSS/JavaScript hosted on private S3.
- **Delivery:** CloudFront with Origin Access Control and HTTPS.
- **API:** API Gateway HTTP API → Lambda.
- **Data:** DynamoDB with point-in-time recovery and encryption.
- **Operations:** CloudWatch log retention; least-privilege Lambda access.

See `docs/ARCHITECTURE.md` and `docs/WELL_ARCHITECTED_PLAN.md`.

## Run locally
Open `web/index.html` in a browser. Demo Mode works without AWS credentials or a backend.

For a local static server:
```bash
cd web
python -m http.server 8080
```
Then open http://localhost:8080.

## Deploy to AWS
Prerequisites: Node.js 20+, AWS CLI configured, AWS CDK v2.

```bash
cd infra
npm install
npx cdk bootstrap
npx cdk deploy
```

The stack outputs the CloudFront URL and API URL. Copy the API URL into `web/config.js` as `API_BASE_URL`, then upload the web files to the frontend bucket. The stack creates the bucket and distribution; the bucket name is shown in CloudFormation outputs.

```bash
aws s3 sync ../web s3://YOUR_FRONTEND_BUCKET --delete
```

If you change frontend files later, invalidate CloudFront:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Important
- Demo Mode is the default. It uses sample data and browser local storage; it does not send personal data to AWS.
- For the live API, set `API_BASE_URL` in `web/config.js` to the deployed API URL.
- This is a learning/demo starter, not a production identity system. Before public launch, add Amazon Cognito authentication, per-user authorization, abuse controls, and privacy/legal review.
- Do not put AWS access keys in frontend code.

## Suggested challenge workflow
1. Deploy the stack and seed/use a small amount of non-sensitive test data.
2. Run the AWS Agent Toolkit Well-Architected Review against the deployed environment.
3. Capture the actual findings. Do not claim a recommendation was made unless the tool reports it.
4. Select one finding that is safe and practical to remediate (for example, backup/PITR, log retention, least-privilege IAM, or CloudFront security).
5. Implement the change, rerun the review, and record the real before/after evidence.
6. Use `docs/SUBMISSION_DRAFT.md` as a starting point only; replace placeholders with your actual review output.

## Project structure
- `web/` interactive responsive app
- `backend/` Lambda API
- `infra/` AWS CDK infrastructure
- `docs/` architecture, review plan and submission guide
