# ClaimIQ — Backend API

Node.js + Express REST API for the ClaimIQ insurance claims management platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Auth | aws-jwt-verify (Cognito JWT) |
| Database | AWS DynamoDB (SDK v3 lib-dynamodb) |
| Storage | AWS S3 (pre-signed URLs) |
| Email | AWS SES |
| Config | dotenv |
| IDs | uuid v4 |

---

## Project Structure

```
backend/
├── src/
│   ├── index.js                 # Express entry point
│   ├── middleware/
│   │   ├── auth.js              # Cognito JWT verification → req.user
│   │   └── roleCheck.js        # Role-based access factory
│   ├── services/
│   │   ├── dynamodb.js         # DynamoDB helpers (CRUD)
│   │   ├── s3.js               # Pre-signed URL generation
│   │   └── ses.js              # Status-update email
│   └── routes/
│       ├── claims.js           # POST/GET/PATCH claim routes
│       └── documents.js        # Upload/download URL routes
├── .env.example
├── Dockerfile
└── README.md
```

---

## API Endpoints

| Method | Route | Role | Description |
|---|---|---|---|
| `GET` | `/health` | public | Health check |
| `POST` | `/claims` | policyholder | Submit new claim |
| `GET` | `/claims` | both | List claims (filtered by role) |
| `GET` | `/claims/:id` | both | Get single claim |
| `PATCH` | `/claims/:id/status` | adjuster | Update status + notes, send email |
| `POST` | `/claims/:id/upload-url` | policyholder | Get S3 pre-signed PUT URL |
| `GET` | `/claims/:id/download-url?key=` | both | Get S3 pre-signed GET URL |

### Response Shape (all routes)

```json
{
  "success": true,
  "data": { ... },
  "message": "Human-readable message"
}
```

---

## DynamoDB Setup

### Table: `Claims`

| Attribute | Type | Role |
|---|---|---|
| `claimId` | String | Partition key |
| `userId` | String | GSI partition key |
| `status` | String | `submitted \| under_review \| approved \| rejected` |
| `claimType` | String | `health \| auto \| home \| life \| travel \| other` |
| `description` | String | Free text |
| `documentKeys` | List<String> | S3 object keys |
| `adjusterNotes` | String | Adjuster comments |
| `createdAt` | String | ISO 8601 |
| `updatedAt` | String | ISO 8601 |

**GSI required:**

```
Index Name : UserIdIndex
PK         : userId (String)
Projection : ALL
```

Create via AWS CLI:
```bash
aws dynamodb create-table \
  --table-name Claims \
  --attribute-definitions \
      AttributeName=claimId,AttributeType=S \
      AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=claimId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[
    {
      "IndexName": "UserIdIndex",
      "KeySchema": [{"AttributeName":"userId","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"}
    }
  ]' \
  --region ap-south-1
```

---

## Running Locally

### 1. Configure mock AWS credentials

```bash
aws configure
# AWS Access Key ID     : test
# AWS Secret Access Key : test
# Default region name   : ap-south-1
# Default output format : json
```

For a fully local DynamoDB, install [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) and set:

```
# In .env
DYNAMODB_ENDPOINT=http://localhost:8000   # optional override (edit dynamodb.js to read this)
```

### 2. Create your `.env` file

```bash
cp .env.example .env
# Fill in your values
```

### 3. Install dependencies and start

```bash
cd backend
npm install
npm run dev     # uses node --watch (no nodemon needed)
# or
npm start
```

### 4. Test the health endpoint

```bash
curl http://localhost:3000/health
# {"success":true,"data":{"status":"ok","timestamp":"..."},"message":"ClaimIQ API is running"}
```

### 5. Call a protected endpoint (requires Cognito JWT)

```bash
TOKEN="eyJ..."    # Cognito access token from frontend

# List claims (adjuster sees all)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/claims

# Submit a claim (policyholder)
curl -X POST http://localhost:3000/claims \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"claimType":"health","description":"Hospital visit on 2026-03-01"}'

# Get upload URL
curl -X POST http://localhost:3000/claims/<claimId>/upload-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"invoice.pdf"}'

# Adjuster: update status
curl -X PATCH http://localhost:3000/claims/<claimId>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","adjusterNotes":"All documents verified."}'
```

---

## Docker

```bash
# Build image
docker build -t claimiq-backend ./backend

# Run (pass env vars)
docker run -p 3000:3000 \
  -e AWS_REGION=ap-south-1 \
  -e COGNITO_USER_POOL_ID=ap-south-1_XXXX \
  -e COGNITO_CLIENT_ID=XXXX \
  -e DYNAMODB_TABLE_NAME=Claims \
  -e S3_BUCKET_NAME=claimiq-documents \
  -e SES_SENDER_EMAIL=no-reply@yourdomain.com \
  claimiq-backend
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default 3000) | Server port |
| `AWS_REGION` | Yes | AWS region (e.g. `ap-south-1`) |
| `COGNITO_USER_POOL_ID` | Yes | Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Yes | Cognito App Client ID |
| `DYNAMODB_TABLE_NAME` | Yes | DynamoDB table name |
| `S3_BUCKET_NAME` | Yes | S3 bucket for documents |
| `SES_SENDER_EMAIL` | Yes | Verified SES sender address |
| `CORS_ORIGIN` | No (default `*`) | Allowed frontend origin |
