import CookieManager from '@preeternal/react-native-cookie-manager';
import type { Expense } from '../mocks/expenses';

const API_BASE_URL = 'http://localhost:8080/api';
const API_ORIGIN = 'http://localhost:8080';

export type ExpenseInput = Omit<Expense, 'id'>;

type CsrfResponse = {
  headerName: string;
  parameterName: string;
  token: string;
};

async function getErrorMessage(response: Response) {
  const body = await response.text();

  if (body) {
    try {
      const parsed: unknown = JSON.parse(body);
      if (
        parsed &&
        typeof parsed === 'object' &&
        'message' in parsed &&
        typeof parsed.message === 'string'
      ) {
        return parsed.message;
      }
    } catch {
      return body;
    }

    return body;
  }

  return `A API respondeu com status ${response.status}.`;
}

async function requireSuccessfulResponse(response: Response) {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

async function getCookieHeader(requireSession = false) {
  const cookies = await CookieManager.get(API_ORIGIN);
  if (requireSession && (!cookies.JSESSIONID || !cookies['XSRF-TOKEN'])) {
    throw new Error(
      'A sessão não foi estabelecida: a API precisa definir os cookies JSESSIONID e XSRF-TOKEN.',
    );
  }

  const cookieHeader = await CookieManager.getCookieHeader(API_ORIGIN);
  return cookieHeader || undefined;
}

function formBody(email: string, password: string) {
  return `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
    password,
  )}`;
}

async function requestLogin(
  email: string,
  password: string,
  csrf: Pick<CsrfResponse, 'headerName' | 'token'>,
) {
  const cookieHeader = await getCookieHeader();

  return fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'text/plain, application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      [csrf.headerName]: csrf.token,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: formBody(email, password),
  });
}

async function fetchCsrfToken() {
  const cookieHeader = await getCookieHeader();
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  await requireSuccessfulResponse(response);

  const csrf = (await response.json()) as Partial<CsrfResponse>;
  if (
    typeof csrf.token !== 'string' ||
    csrf.token.length === 0 ||
    typeof csrf.headerName !== 'string' ||
    csrf.headerName.length === 0
  ) {
    throw new Error('A resposta de CSRF da API está inválida.');
  }

  return {
    headerName: csrf.headerName,
    token: csrf.token,
  };
}

export async function login(email: string, password: string) {
  const csrf = await fetchCsrfToken();
  const response = await requestLogin(email, password, csrf);
  await requireSuccessfulResponse(response);
}

export async function register(name: string, email: string, password: string) {
  const csrf = await fetchCsrfToken();
  const cookieHeader = await getCookieHeader();
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'text/plain, application/json',
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (response.status !== 201) {
    throw new Error(await getErrorMessage(response));
  }
}

export async function getCsrfToken() {
  const csrf = await fetchCsrfToken();
  if (csrf.headerName !== 'X-XSRF-TOKEN') {
    throw new Error('A API retornou um header CSRF inesperado.');
  }

  await getCookieHeader(true);

  return csrf.token;
}

export async function createExpense(input: ExpenseInput, csrfToken: string) {
  const cookieHeader = await getCookieHeader(true);
  if (!cookieHeader) {
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      description: input.description,
      value: input.value,
      type: input.expenseType,
      paymentMethod: input.paymentMethod,
      dueDate: input.date,
    }),
  });

  await requireSuccessfulResponse(response);

  return {
    ...input,
    id: Date.now(),
  };
}

export async function logout(csrfToken: string) {
  const cookieHeader = await getCookieHeader(true);
  if (!cookieHeader) {
    throw new Error('Sua sessão expirou. Faça login novamente.');
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'text/plain, application/json',
      'X-XSRF-TOKEN': csrfToken,
      Cookie: cookieHeader,
    },
  });

  await requireSuccessfulResponse(response);

  await CookieManager.clearByName(API_ORIGIN, 'JSESSIONID');
  await CookieManager.clearByName(API_ORIGIN, 'XSRF-TOKEN');
}
