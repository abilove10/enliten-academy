import { generateKey, encrypt, decrypt } from 'crypto-js/aes';
import { JSEncrypt } from 'jsencrypt';

export class SecurityClient {
    constructor() {
        this.rsaEncrypt = new JSEncrypt();
        this.publicKey = null;
    }

    async initialize() {
        // Fetch public key from backend
        const response = await fetch('/api/config/public-key');
        const { publicKey } = await response.json();
        this.rsaEncrypt.setPublicKey(publicKey);
    }

    async encryptRequest(data) {
        if (!this.publicKey) {
            await this.initialize();
        }
        const aesKey = generateKey();
        const encryptedData = encrypt(JSON.stringify(data), aesKey);
        const encryptedAesKey = this.rsaEncrypt.encrypt(aesKey);

        return {
            encrypted_aes_key: encryptedAesKey,
            data: encryptedData
        };
    }

    async decryptResponse(response) {
        const { encrypted_aes_key, data } = response;
        const aesKey = this.rsaEncrypt.decrypt(encrypted_aes_key);
        return JSON.parse(decrypt(data, aesKey));
    }
} 