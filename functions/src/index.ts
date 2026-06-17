import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {FieldValue, getFirestore, Timestamp} from 'firebase-admin/firestore';
import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {authenticator} from 'otplib';
import * as QRCode from 'qrcode';
import {randomBytes} from 'node:crypto';

initializeApp();

const db = getFirestore();
const auth = getAuth();

const MFA_APP_NAME = 'MiWill';
const MAX_TOTP_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

type CreateAgentAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  idNumber: string;
  phone?: string;
  createdBy: string;
};

function generateTempPassword(length = 14): string {
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = lowers + uppers + digits + symbols;

  const required = [
    lowers[randomBytes(1)[0] % lowers.length],
    uppers[randomBytes(1)[0] % uppers.length],
    digits[randomBytes(1)[0] % digits.length],
    symbols[randomBytes(1)[0] % symbols.length],
  ];

  const remaining = Array.from({length: length - required.length}, () => {
    return all[randomBytes(1)[0] % all.length];
  });

  const chars = [...required, ...remaining];
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomBytes(1)[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

function assertAuthenticated(authUid: string | undefined): asserts authUid is string {
  if (!authUid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
}

async function assertAdmin(authUid: string) {
  const user = await auth.getUser(authUid);
  if (user.customClaims?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin privileges are required.');
  }
}

function assertSelf(authUid: string, uid: string) {
  if (authUid !== uid) {
    throw new HttpsError('permission-denied', 'You can only perform this action for your own account.');
  }
}

function normalizeTotpCode(code: string): string {
  return String(code ?? '').replace(/\s+/g, '').trim();
}

function isLocked(lockedUntil: Timestamp | undefined): boolean {
  if (!lockedUntil) {
    return false;
  }

  return lockedUntil.toMillis() > Date.now();
}

export const createAgentAccount = onCall(async (request) => {
  assertAuthenticated(request.auth?.uid);
  const callerUid = request.auth.uid;
  await assertAdmin(callerUid);

  const input = request.data as CreateAgentAccountInput;
  const email = String(input.email ?? '').trim().toLowerCase();
  const firstName = String(input.firstName ?? '').trim();
  const lastName = String(input.lastName ?? '').trim();
  const dateOfBirth = String(input.dateOfBirth ?? '').trim();
  const idNumber = String(input.idNumber ?? '').trim();
  const phone = String(input.phone ?? '').trim();
  const createdBy = String(input.createdBy ?? '').trim();

  if (!email || !firstName || !lastName || !dateOfBirth || idNumber.length !== 13) {
    throw new HttpsError('invalid-argument', 'Missing or invalid agent profile fields.');
  }

  const existing = await db.collection('users').where('email', '==', email).limit(1).get();
  if (!existing.empty) {
    throw new HttpsError('already-exists', 'An account with this email already exists.');
  }

  const temporaryPassword = generateTempPassword();
  const userRecord = await auth.createUser({
    email,
    password: temporaryPassword,
    displayName: `${firstName} ${lastName}`.trim(),
  });

  await auth.setCustomUserClaims(userRecord.uid, {role: 'agent'});

  const secret = authenticator.generateSecret();

  await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userRecord.uid);
    transaction.set(userRef, {
      uid: userRecord.uid,
      email,
      firstName,
      lastName,
      dateOfBirth,
      idNumber,
      phone: phone || null,
      role: 'agent',
      status: 'pending_password_change',
      forcePasswordChange: true,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: createdBy || callerUid,
    });

    const secretRef = db.collection('agentSecrets').doc(userRecord.uid);
    transaction.set(secretRef, {
      secret,
      verified: false,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return {
    uid: userRecord.uid,
    email,
    firstName,
    lastName,
    temporaryPassword,
  };
});

export const completePasswordChange = onCall(async (request) => {
  assertAuthenticated(request.auth?.uid);

  const uid = String((request.data as {uid?: string})?.uid ?? '');
  if (!uid) {
    throw new HttpsError('invalid-argument', 'User id is required.');
  }

  assertSelf(request.auth.uid, uid);

  const userRef = db.collection('users').doc(uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    throw new HttpsError('not-found', 'User profile not found.');
  }

  const data = snapshot.data();
  if (data?.forcePasswordChange !== true) {
    throw new HttpsError('failed-precondition', 'Password change is not required for this account.');
  }

  await userRef.update({
    forcePasswordChange: false,
    status: 'pending_2fa_setup',
    passwordChangedAt: FieldValue.serverTimestamp(),
  });

  return {success: true};
});

export const getTotpEnrollmentQr = onCall(async (request) => {
  assertAuthenticated(request.auth?.uid);

  const uid = String((request.data as {uid?: string})?.uid ?? '');
  if (!uid) {
    throw new HttpsError('invalid-argument', 'User id is required.');
  }

  assertSelf(request.auth.uid, uid);

  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    throw new HttpsError('not-found', 'User profile not found.');
  }

  const userData = userSnap.data();
  if (userData?.status !== 'pending_2fa_setup') {
    throw new HttpsError('failed-precondition', 'Two-factor enrollment is not required for this account.');
  }

  const secretSnap = await db.collection('agentSecrets').doc(uid).get();
  if (!secretSnap.exists) {
    throw new HttpsError('not-found', 'TOTP secret not found.');
  }

  const secret = String(secretSnap.data()?.secret ?? '');
  if (!secret) {
    throw new HttpsError('failed-precondition', 'TOTP secret is missing.');
  }

  const email = String(userData?.email ?? '');
  const otpauthUrl = authenticator.keyuri(email, MFA_APP_NAME, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return {qrCodeDataUrl, otpauthUrl};
});

export const verifyTotpEnrollment = onCall(async (request) => {
  assertAuthenticated(request.auth?.uid);

  const uid = String((request.data as {uid?: string})?.uid ?? '');
  const code = normalizeTotpCode(String((request.data as {code?: string})?.code ?? ''));

  if (!uid || code.length !== 6) {
    throw new HttpsError('invalid-argument', 'A valid 6-digit code is required.');
  }

  assertSelf(request.auth.uid, uid);

  const userRef = db.collection('users').doc(uid);
  const secretRef = db.collection('agentSecrets').doc(uid);

  const [userSnap, secretSnap] = await Promise.all([userRef.get(), secretRef.get()]);

  if (!userSnap.exists || !secretSnap.exists) {
    throw new HttpsError('not-found', 'Enrollment record not found.');
  }

  if (userSnap.data()?.status !== 'pending_2fa_setup') {
    throw new HttpsError('failed-precondition', 'Two-factor enrollment is not required.');
  }

  const secret = String(secretSnap.data()?.secret ?? '');
  const isValid = authenticator.verify({token: code, secret});

  if (!isValid) {
    throw new HttpsError('invalid-argument', 'Invalid verification code.');
  }

  await db.runTransaction(async (transaction) => {
    transaction.update(secretRef, {
      verified: true,
      verifiedAt: FieldValue.serverTimestamp(),
      failedAttempts: 0,
      lockedUntil: null,
    });
    transaction.update(userRef, {
      status: 'active',
    });
  });

  return {success: true};
});

export const verifyTotpLogin = onCall(async (request) => {
  assertAuthenticated(request.auth?.uid);

  const uid = String((request.data as {uid?: string})?.uid ?? '');
  const code = normalizeTotpCode(String((request.data as {code?: string})?.code ?? ''));

  if (!uid || code.length !== 6) {
    throw new HttpsError('invalid-argument', 'A valid 6-digit code is required.');
  }

  assertSelf(request.auth.uid, uid);

  const secretRef = db.collection('agentSecrets').doc(uid);
  const secretSnap = await secretRef.get();

  if (!secretSnap.exists) {
    throw new HttpsError('failed-precondition', 'Two-factor authentication is not enrolled.');
  }

  const secretData = secretSnap.data() ?? {};

  if (secretData.verified !== true) {
    throw new HttpsError('failed-precondition', 'Two-factor authentication is not enrolled.');
  }

  if (isLocked(secretData.lockedUntil as Timestamp | undefined)) {
    throw new HttpsError(
      'resource-exhausted',
      'Too many failed attempts. Try again later.',
    );
  }

  const secret = String(secretData.secret ?? '');
  const isValid = authenticator.verify({token: code, secret});

  if (!isValid) {
    const failedAttempts = Number(secretData.failedAttempts ?? 0) + 1;
    const updates: Record<string, unknown> = {failedAttempts};

    if (failedAttempts >= MAX_TOTP_ATTEMPTS) {
      updates.lockedUntil = Timestamp.fromMillis(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      updates.failedAttempts = 0;
    }

    await secretRef.update(updates);
    throw new HttpsError('invalid-argument', 'Invalid verification code.');
  }

  await secretRef.update({
    failedAttempts: 0,
    lockedUntil: null,
    lastVerifiedAt: FieldValue.serverTimestamp(),
  });

  const mfaVerifiedAt = Date.now();
  const existingClaims = (await auth.getUser(uid)).customClaims ?? {};
  await auth.setCustomUserClaims(uid, {
    ...existingClaims,
    role: existingClaims.role ?? 'agent',
    mfaVerifiedAt,
  });

  return {success: true, mfaVerifiedAt};
});

/** Clears MFA session claim after email/password sign-in so agents must verify TOTP again. */
export const prepareAgentLogin = onCall(async (request) => {
  assertAuthenticated(request.auth?.uid);

  const uid = request.auth.uid;
  const user = await auth.getUser(uid);
  const claims = {...(user.customClaims ?? {})};

  if (claims.role !== 'agent') {
    return {success: true};
  }

  delete claims.mfaVerifiedAt;
  await auth.setCustomUserClaims(uid, claims);

  return {success: true};
});
