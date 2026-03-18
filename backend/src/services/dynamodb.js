'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

// ── Client setup ──────────────────────────────────────────────────────────────

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const client = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE = process.env.DYNAMODB_TABLE_NAME || 'Claims';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Write a new claim to DynamoDB.
 * @param {Object} claim — must include claimId
 */
async function createClaim(claim) {
  try {
    await client.send(
      new PutCommand({
        TableName: TABLE,
        Item: claim,
        ConditionExpression: 'attribute_not_exists(claimId)',
      }),
    );
    return claim;
  } catch (err) {
    console.error('[dynamodb] createClaim error:', err);
    throw new Error(`Failed to create claim: ${err.message}`);
  }
}

/**
 * Fetch a single claim by its partition key.
 * @param {string} claimId
 */
async function getClaimById(claimId) {
  try {
    const result = await client.send(
      new GetCommand({
        TableName: TABLE,
        Key: { claimId },
      }),
    );
    return result.Item || null;
  } catch (err) {
    console.error('[dynamodb] getClaimById error:', err);
    throw new Error(`Failed to fetch claim: ${err.message}`);
  }
}

/**
 * Query all claims belonging to a specific user via the userId GSI.
 * GSI name: UserIdIndex  |  GSI PK: userId
 * @param {string} userId
 */
async function getClaimsByUserId(userId) {
  try {
    const result = await client.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
        ScanIndexForward: false, // newest first
      }),
    );
    return result.Items || [];
  } catch (err) {
    console.error('[dynamodb] getClaimsByUserId error:', err);
    throw new Error(`Failed to fetch claims for user: ${err.message}`);
  }
}

/**
 * Return every claim in the table (for adjusters).
 * Uses a full Scan — acceptable at low volume; consider paginating for large tables.
 */
async function getAllClaims() {
  try {
    const result = await client.send(new ScanCommand({ TableName: TABLE }));
    return result.Items || [];
  } catch (err) {
    console.error('[dynamodb] getAllClaims error:', err);
    throw new Error(`Failed to scan claims: ${err.message}`);
  }
}

/**
 * Partially update a claim (status, adjusterNotes, documentKeys, updatedAt).
 * @param {string} claimId
 * @param {Object} updates  — object of fields to update
 */
async function updateClaim(claimId, updates) {
  // Build a dynamic UpdateExpression from the updates object
  const expressionParts = [];
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  Object.entries(updates).forEach(([key, value]) => {
    const nameToken = `#${key}`;
    const valueToken = `:${key}`;
    expressionParts.push(`${nameToken} = ${valueToken}`);
    ExpressionAttributeNames[nameToken] = key;
    ExpressionAttributeValues[valueToken] = value;
  });

  // Always stamp updatedAt
  expressionParts.push('#updatedAt = :updatedAt');
  ExpressionAttributeNames['#updatedAt'] = 'updatedAt';
  ExpressionAttributeValues[':updatedAt'] = new Date().toISOString();

  try {
    const result = await client.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { claimId },
        UpdateExpression: `SET ${expressionParts.join(', ')}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ConditionExpression: 'attribute_exists(claimId)',
        ReturnValues: 'ALL_NEW',
      }),
    );
    return result.Attributes;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new Error(`Claim not found: ${claimId}`);
    }
    console.error('[dynamodb] updateClaim error:', err);
    throw new Error(`Failed to update claim: ${err.message}`);
  }
}

module.exports = { createClaim, getClaimById, getClaimsByUserId, getAllClaims, updateClaim };
