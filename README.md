ClaimIQ — Cloud-Based Insurance Claim Management System
A full-stack, cloud-native insurance claim management platform built on AWS. Policyholders can submit claims with supporting documents, and insurance adjusters can review, approve, or reject them through an administrative dashboard.

Live URLs
ServiceURLFrontendhttp://claimiq-frontend-ash.s3-website.ap-south-1.amazonaws.comBackend APIhttp://13.235.56.205:3000Health Checkhttp://13.235.56.205:3000/health

Note: The backend IP changes if the ECS task restarts. Run get-backend-ip.cmd to get the current IP.


Test Accounts
RoleEmailPasswordPolicyholdertest@example.comTest@1234Adjusteradjuster@example.comTest@1234

Architecture
React Frontend (S3 + CloudFront)
        │
        ▼
Amazon Cognito (Authentication + JWT)
        │
        ▼
Node.js / Express REST API (Docker → ECS Fargate)
        │
   ┌────┴────┐────────┐
   ▼         ▼        ▼
DynamoDB    S3      SES/SNS
(Claims)  (Docs)  (Notifications)
        │
        ▼
   CloudWatch (Logs + Monitoring)

Tech Stack
Frontend

React 19 + TypeScript
Vite
Tailwind CSS
TanStack Query (data fetching)
Zustand (state management)
AWS Amplify (Cognito auth)
Axios (HTTP client)
Framer Motion (animations)
Recharts (charts)

Backend

Node.js + Express
AWS SDK v3
aws-jwt-verify (Cognito JWT validation)
Docker (containerization)

AWS Services
ServicePurposeAmazon CognitoUser authentication, JWT tokens, role managementAmazon ECS FargateServerless container hosting for the backendAmazon ECRDocker image registryAmazon DynamoDBNoSQL database for claim recordsAmazon S3Encrypted document storage + frontend hostingAmazon SESEmail notifications on claim status changesAmazon CloudWatchApplication logs and monitoringAmazon VPCNetwork isolation and security

Project Structure
ClaimIQ/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js       # Cognito JWT verification
│   │   │   └── roleCheck.js  # Role-based access control
│   │   ├── routes/
│   │   │   ├── claims.js     # Claims CRUD endpoints
│   │   │   └── documents.js  # S3 pre-signed URL endpoints
│   │   ├── services/
│   │   │   ├── dynamodb.js   # DynamoDB operations
│   │   │   ├── s3.js         # S3 pre-signed URLs
│   │   │   └── ses.js        # Email notifications
│   │   └── index.js          # Express app entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── hooks/                # React Query hooks
│   ├── lib/                  # API client, auth, utilities
│   ├── pages/                # Route pages
│   │   ├── auth/             # Login, MFA
│   │   ├── policyholder/     # Claim submission, list
│   │   └── adjuster/         # Dashboard, queue, review
│   ├── store/                # Zustand state
│   └── types/                # TypeScript types
├── get-backend-ip.cmd        # Script to get current ECS IP
└── task-definition.json      # ECS task definition

Features
Policyholder Portal

Secure login via Amazon Cognito
Submit insurance claims (auto, home, health, life, travel)
Upload supporting documents directly to S3
Track claim status in real time
Receive email notifications on status changes

Adjuster Dashboard

View all submitted claims
Filter and search claim queue
Review claim details and documents
Approve, reject, or request more information
Add internal adjuster notes
Fraud risk scoring per claim


REST API Endpoints
MethodEndpointRoleDescriptionGET/healthPublicHealth checkPOST/claimsPolicyholderSubmit new claimGET/claimsBothList claims (scoped by role)GET/claims/:idBothGet claim detailPATCH/claims/:id/statusAdjusterUpdate claim statusPOST/claims/:id/upload-urlPolicyholderGet S3 pre-signed upload URLGET/claims/:id/download-urlBothGet S3 pre-signed download URL

DynamoDB Schema
Table: Claims
Partition Key: claimId (String)
GSI: userId-index on userId (String)
FieldTypeDescriptionclaimIdStringUUID, partition keyuserIdStringCognito sub, GSI keystatusStringsubmitted / under_review / approved / rejectedclaimTypeStringauto / home / health / life / traveldescriptionStringClaim descriptiondocumentKeysListS3 object keysadjusterNotesStringInternal notescreatedAtStringISO timestampupdatedAtStringISO timestamp

Local Development
Prerequisites

Node.js 20+
AWS CLI configured (aws configure)
Docker Desktop

Backend
bashcd backend
cp .env.example .env
# Fill in your AWS values in .env
npm install
npm run dev
Frontend
bashnpm install
# Create .env.local with your values (see .env.example)
npm run dev
Environment Variables
Backend (backend/.env):
envPORT=3000
AWS_REGION=ap-south-1
COGNITO_USER_POOL_ID=your_pool_id
COGNITO_CLIENT_ID=your_client_id
DYNAMODB_TABLE_NAME=Claims
S3_BUCKET_NAME=your_bucket_name
SES_SENDER_EMAIL=your_verified_email
Frontend (.env.local):
envVITE_API_BASE_URL=http://localhost:3000
VITE_MOCK=false
VITE_COGNITO_USER_POOL_ID=your_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
VITE_AWS_REGION=ap-south-1

Deployment
Backend (ECS Fargate)
bash# Build and push Docker image
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 927046305762.dkr.ecr.ap-south-1.amazonaws.com
docker build -t claimiq-backend ./backend
docker tag claimiq-backend:latest 927046305762.dkr.ecr.ap-south-1.amazonaws.com/claimiq-backend:latest
docker push 927046305762.dkr.ecr.ap-south-1.amazonaws.com/claimiq-backend:latest

# Deploy to ECS
aws ecs update-service --cluster claimiq-cluster --service claimiq-backend-service --force-new-deployment --region ap-south-1
Frontend (S3)
bashnpm run build
aws s3 sync dist/ s3://claimiq-frontend-ash --region ap-south-1
Get Current Backend IP
bash# Windows
get-backend-ip.cmd

Cost Management
Stop ECS when not in use to avoid charges:
bash# Stop
aws ecs update-service --cluster claimiq-cluster --service claimiq-backend-service --desired-count 0 --region ap-south-1

# Start
aws ecs update-service --cluster claimiq-cluster --service claimiq-backend-service --desired-count 1 --region ap-south-1

AWS Infrastructure Summary
ResourceNameECS Clusterclaimiq-clusterECS Serviceclaimiq-backend-serviceECR Repositoryclaimiq-backendDynamoDB TableClaimsS3 (Documents)claimiq-documents-ashS3 (Frontend)claimiq-frontend-ashCognito User Poolap-south-1_GDEQG1DlbCloudWatch Log Group/ecs/claimiq-backendRegionap-south-1 (Mumbai)

Academic Context
This project was built as part of a cloud computing assignment demonstrating:

Cloud-native application architecture
Containerization with Docker
Serverless container deployment (ECS Fargate)
AWS managed services integration
Role-based access control
Secure document storage
Real-time notifications
Application monitoring
