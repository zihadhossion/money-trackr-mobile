import axios from 'axios';
import i18next from 'i18next';

/**
 * Axios overwrites `error.message` with "Request failed with status code 4xx"
 * (see axios/lib/core/settle.js), so the server's own message — which the
 * backend already translates via Accept-Language — only survives in
 * `error.response.data.message`. Always unwrap through here.
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
  const fallbackText = fallback ?? i18next.t('common.error_generic');

  if (axios.isAxiosError(error)) {
    // No response at all: DNS failure, timeout, airplane mode.
    if (!error.response) {
      return error.code === 'ECONNABORTED'
        ? i18next.t('common.error_timeout')
        : i18next.t('common.error_network');
    }

    const message = (error.response.data as { message?: unknown } | undefined)?.message;

    // ValidationPipe returns an array of constraint messages.
    if (Array.isArray(message)) {
      const joined = message.filter((m): m is string => typeof m === 'string').join('\n');
      if (joined) return joined;
    }
    if (typeof message === 'string' && message) return message;

    return fallbackText;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallbackText;
}
