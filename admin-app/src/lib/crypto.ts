/**
 * Simple encryption/decryption utilities using Web Crypto API
 * Note: For a real-world app, you'd want more robust key management.
 * This implementation uses a derived key from a fixed salt for demonstration purposes
 * while moving toward a more secure sessionStorage-based token model.
 */

const ENCRYPTION_KEY_PREFIX = 'vc_v1_';

async function getKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const salt = encoder.encode('vadivelu-cars-secure-salt');
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode('v-cars-admin-app-secret-key-2024'),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptData(data: string): Promise<string> {
    try {
        const key = await getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(data);

        const encryptedContent = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedData
        );

        const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedContent), iv.length);

        return ENCRYPTION_KEY_PREFIX + btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Encryption failed:', error);
        return data; // Fallback to plaintext if encryption fails (better than breaking the app in this dev context)
    }
}

export async function decryptData(encryptedBase64: string): Promise<string | null> {
    if (!encryptedBase64.startsWith(ENCRYPTION_KEY_PREFIX)) {
        return encryptedBase64; // Return as is if not encrypted with our prefix
    }

    try {
        const key = await getKey();
        const combined = new Uint8Array(
            atob(encryptedBase64.replace(ENCRYPTION_KEY_PREFIX, ''))
                .split('')
                .map((char) => char.charCodeAt(0))
        );

        const iv = combined.slice(0, 12);
        const content = combined.slice(12);

        const decryptedContent = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            content
        );

        return new TextDecoder().decode(decryptedContent);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}
