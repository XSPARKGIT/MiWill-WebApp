import {FirebaseError} from 'firebase/app';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {getFirebaseApp, isFirebaseConfigured} from '../firebase/client';

export type CreateAgentAccountResult = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
};

export type CreateAgentAccountInput = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  idNumber: string;
  phone: string;
  createdBy: string;
};

function getCallableFunctions() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error('Firebase is not configured.');
  }

  return getFunctions(app);
}

function mapCallableError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return error.message;
  }

  const details = error as {code?: string; message?: string};
  if (details.message) {
    return details.message;
  }

  return 'Request failed. Try again.';
}

export async function createAgentAccountCallable(
  input: CreateAgentAccountInput,
): Promise<CreateAgentAccountResult> {
  const callable = httpsCallable<CreateAgentAccountInput, CreateAgentAccountResult>(
    getCallableFunctions(),
    'createAgentAccount',
  );
  const result = await callable(input);
  return result.data;
}

export async function prepareAgentLoginCallable(): Promise<void> {
  const callable = httpsCallable(getCallableFunctions(), 'prepareAgentLogin');
  await callable({});
}

export async function completePasswordChangeCallable(uid: string): Promise<void> {
  const callable = httpsCallable<{uid: string}, {success: boolean}>(
    getCallableFunctions(),
    'completePasswordChange',
  );
  await callable({uid});
}

export async function getTotpEnrollmentQrCallable(uid: string): Promise<{
  qrCodeDataUrl: string;
  otpauthUrl: string;
}> {
  const callable = httpsCallable<{uid: string}, {qrCodeDataUrl: string; otpauthUrl: string}>(
    getCallableFunctions(),
    'getTotpEnrollmentQr',
  );
  const result = await callable({uid});
  return result.data;
}

export async function verifyTotpEnrollmentCallable(uid: string, code: string): Promise<void> {
  const callable = httpsCallable<{uid: string; code: string}, {success: boolean}>(
    getCallableFunctions(),
    'verifyTotpEnrollment',
  );
  await callable({uid, code});
}

export async function verifyTotpLoginCallable(uid: string, code: string): Promise<void> {
  const callable = httpsCallable<{uid: string; code: string}, {success: boolean}>(
    getCallableFunctions(),
    'verifyTotpLogin',
  );
  await callable({uid, code});
}

export function isAgentMfaConfigured(): boolean {
  return isFirebaseConfigured;
}

export {mapCallableError};
