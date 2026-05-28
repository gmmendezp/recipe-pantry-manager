const fallbackAuthErrorMessage = 'Unable to continue. Please try again.';

function getMessagesFromIssueArray(value: unknown) {
  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .map((issue) =>
      issue.message && typeof issue.message === 'string'
        ? issue.message
        : undefined,
    )
    .filter((message): message is string => !!message)
    .join('\n');
}

export function getAuthErrorMessage(
  error: unknown,
  fallbackMessage = fallbackAuthErrorMessage,
) {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  let errorMessage: string = error.message || fallbackMessage;

  try {
    const parsed = JSON.parse(error.message);
    errorMessage = getMessagesFromIssueArray(parsed) || errorMessage;
  } catch {
    // The message was already plain text.
  }

  return errorMessage;
}
