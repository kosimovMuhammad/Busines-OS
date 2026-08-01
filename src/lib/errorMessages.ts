type ErrorMessages = {
  generic: string;
  conflict: string;
  forbidden: string;
  aiUnavailable: string;
};

let current: ErrorMessages = {
  generic: "Something went wrong. Please try again.",
  conflict: "That already exists.",
  forbidden: "You don't have permission to do that.",
  aiUnavailable: "AI features are being activated.",
};

export function setErrorMessages(messages: ErrorMessages) {
  current = messages;
}

export function messageForStatus(status: number | string | undefined): string {
  if (status === 403) return current.forbidden;
  if (status === 409) return current.conflict;
  return current.generic;
}

export function aiUnavailableMessage(): string {
  return current.aiUnavailable;
}
