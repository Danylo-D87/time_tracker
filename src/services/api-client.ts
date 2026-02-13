const BASE_URL = "/api";

/** Custom error class for API requests — preserves status code and stack trace */
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = "ApiError";
    }

    /** Whether this is a client error (4xx) */
    get isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    /** Whether this is a conflict error (409 — e.g. timer already running) */
    get isConflict(): boolean {
        return this.status === 409;
    }
}

class ApiClient {
    private async request<T>(
        url: string,
        options?: RequestInit
    ): Promise<T> {
        const headers: HeadersInit = {
            ...(options?.body ? { "Content-Type": "application/json" } : {}),
        };

        const response = await fetch(`${BASE_URL}${url}`, {
            ...options,
            headers: {
                ...headers,
                ...options?.headers,
            },
        });

        if (!response.ok) {
            let message = `Request failed: ${response.statusText}`;

            try {
                const body = await response.json();
                message = body.error || body.message || message;
            } catch {
                // ignore parse error
            }

            throw new ApiError(message, response.status);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    }

    async get<T>(url: string, params?: Record<string, string>): Promise<T> {
        const queryString = params
            ? "?" + new URLSearchParams(params).toString()
            : "";
        return this.request<T>(`${url}${queryString}`);
    }

    async post<T>(url: string, body?: unknown): Promise<T> {
        return this.request<T>(url, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(url: string, body?: unknown): Promise<T> {
        return this.request<T>(url, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete(url: string): Promise<void> {
        return this.request<void>(url, {
            method: "DELETE",
        });
    }
}

export const apiClient = new ApiClient();
