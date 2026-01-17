/**
 * API client for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiClient {
    private static ws: WebSocket | null = null;
    private static wsListeners: ((message: string) => void)[] = [];

    static async postEvent(event: {
        session_id: string;
        event_name: string;
        page?: string;
        timestamp: number;
        time_of_day?: string;
        day_of_week?: string;
        duration_ms?: number;
        keystrokes?: number;
        backspaces?: number;
        pauses?: number[];
        mood_icon?: string;
        prompt_id?: string;
        entry_length?: number;
        entry_abrupt_end?: boolean;
        properties?: any;
    }) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API] Failed to post event:', error);
            // Fallback to localStorage if backend is unavailable
            throw error;
        }
    }

    static async getGeminiInsights(data: {
        behavior_summary?: any;
        recent_entry_excerpt?: string | null;
        session_id?: string;
        type?: 'prompt' | 'analysis';
    }) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/gemini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API] Failed to get Gemini insights:', error);
            throw error;
        }
    }

    static connectWebSocket(onMessage: (message: string) => void) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        try {
            // WebSocket server runs on the same port as HTTP server
            const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('[WS] Connected to backend');
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'ai_trace') {
                        console.log(data.message);
                        onMessage(data.message);
                    }
                } catch (error) {
                    console.error('[WS] Error parsing message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[WS] WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('[WS] Disconnected from backend');
                // Attempt to reconnect after 3 seconds
                setTimeout(() => {
                    if (this.wsListeners.length > 0) {
                        this.connectWebSocket(onMessage);
                    }
                }, 3000);
            };

            this.wsListeners.push(onMessage);
        } catch (error) {
            console.error('[WS] Failed to connect:', error);
        }
    }

    static disconnectWebSocket() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.wsListeners = [];
        }
    }
}

