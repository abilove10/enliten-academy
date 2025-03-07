import { generateKey, encrypt, decrypt } from 'crypto-js/aes';
import { JSEncrypt } from 'jsencrypt';
import { config } from './config';
import base64 from 'base64-js';
const API_URL = config.API_URL;
function base64_encode(s) {      
    return btoa(decodeURIComponent(s));
}
function base64_decode(s) {      
    return atob(decodeURIComponent(s));
}

export class SecurityClient {
    constructor() {
        this.rsaEncrypt = new JSEncrypt();
        this.publicKey = null;
        this.aes_key='';
    }

    async initialize() {
        // Fetch public key from backend
        const response = await fetch('/api/config/public-key');
        const { publicKey } = await response.json();
        this.rsaEncrypt.setPublicKey(publicKey);
        //this.rsaEncrypt.getKey().setOptions({ encryptionScheme: 'pkcs1_oaep' });

    }

      async  getHeaders(token = null){
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    async  get_key() {
    const token = localStorage.getItem('token');
    //alert("Token: "+token);
            const response = await fetch(`${API_URL}/api/user/ads`, {
                headers:  {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            // console.log('User data response status:', response.json());

            // if (!response.ok) {
            //     if (response.status === 401) {
            //         console.log('Unauthorized response, clearing token');
            //         localStorage.removeItem('token');
            //         //window.location.href='/';
            //         return;
            //     }
            //     throw new Error('Failed to fetch user data');
            // }

            const data = await response.json();
            // return atob(data.aes_key)
            return atob(data.ads_key)
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

    
    async decryptResponse_base641(response) {
        // console.log("Encrypted Response:", response);
        const encrypted_data=response.data;
        this.aes_key=await this.get_key()
        //alert("Key:"+this.aes_key)
        // console.log(this.aes_key)
        const decryptedData = decrypt(encrypted_data, this.aes_key).toString();
        // console.log(decryptedData)
        return JSON.parse(decryptedData);
    }
    async  decryptResponse_base64(response) {
        try {
            // console.log('data: '+atob(response.data))
            const encrypted_base64 = response.data;
            if (!this.aes_key) {
                this.aes_key = await this.get_key();
                if (!this.aes_key) {
                    window.location.href = '/';
                    return;
                }
            }
            const aes_key = this.aes_key; // Assuming this returns base64 encoded key
            // const aes_key = await this.get_key(); // Assuming this returns base64 encoded key
            
            //console.log("EN : "+encrypted_base64)
            // Decode the base64 key
            const key = new Uint8Array(aes_key.split('').map(c => c.charCodeAt(0)));
            
            // Decode the base64 encrypted data
            const encrypted = new Uint8Array(atob(encrypted_base64).split('').map(c => c.charCodeAt(0)));
            
            // Extract IV (12 bytes), tag (16 bytes), and ciphertext
            const iv = encrypted.slice(0, 12);
            const tag = encrypted.slice(12, 28);
            const ciphertext = encrypted.slice(28);
//             console.log('IV length:', iv.length);
// console.log('Tag length:', tag.length);
// console.log('Ciphertext length:', ciphertext.length);
            
            // Create the decryption key
            const cryptoKey = await window.crypto.subtle.importKey(
                'raw',
                key,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            // Decrypt the data
            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                    tagLength: 128 // Tag length in bits
                },
                cryptoKey,
                new Uint8Array([...ciphertext, ...tag]) // Combine ciphertext and tag
            );

            // Convert the decrypted array buffer to string
            const decoder = new TextDecoder();
            const decryptedText = decoder.decode(decrypted);
            // console.log("Decrypt: "+decryptedText)
            
            return JSON.parse(decryptedText);
        } catch (error) {
            console.error('Decryption failed:', error);
            // throw new Error('Decryption failed');
            throw new Error('Retry');
            
        }
    
    }
} 