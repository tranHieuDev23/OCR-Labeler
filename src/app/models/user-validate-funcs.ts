const USERNAME_REGEX = /^([a-z]|[A-Z]|[0-9])+$/;

export function validateUsername(username: string): { [k: string]: boolean } | null {
    if (!username || username.length === 0) {
        return { error: true, required: true };
    }
    if (username.length < 6) {
        return { error: true, minLength: true };
    }
    if (!USERNAME_REGEX.test(username)) {
        return { error: true, format: true };
    }
    return null;
}

export function validatePassword(password: string): { [k: string]: boolean } | null {
    if (!password || password.length === 0) {
        return { error: true, required: true };
    }
    if (password.length < 8) {
        return { error: true, minLength: true };
    }
    return null;
}

export function validateDisplayName(displayName: string): { [k: string]: boolean } | null {
    if (!displayName || displayName.trim().length === 0) {
        return { error: true, required: true };
    }
    return null;
}