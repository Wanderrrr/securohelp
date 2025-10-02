import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-for-dev-only-!';
const ALGORITHM = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes
const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

export async function encrypt(text: string): Promise<Buffer> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine IV and encrypted data
  const combined = Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
  return combined;
}

export async function decrypt(encryptedBuffer: Buffer): Promise<string> {
  // Extract IV and encrypted data
  const iv = encryptedBuffer.slice(0, 16);
  const encrypted = encryptedBuffer.slice(16);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Helper function for simple string encryption (for development)
export async function encryptString(text: string): Promise<string> {
  const encrypted = await encrypt(text);
  return encrypted.toString('base64');
}

export async function decryptString(encryptedText: string): Promise<string> {
  const buffer = Buffer.from(encryptedText, 'base64');
  return await decrypt(buffer);
}
