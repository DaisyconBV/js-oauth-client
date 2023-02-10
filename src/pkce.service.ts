import * as crypto from 'crypto';

export class PkceService {
	public async generateCodeChallenge(codeVerifier: string): Promise<string> {
		let digest: ArrayBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));

		return btoa(String.fromCharCode(...(<number[]><unknown>new Uint8Array(digest))))
			.replace(/=/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_');
	}

	public generateRandomString(size: number = 128): string
	{
		let randomString: string = '';
		let allowedChars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (let charNumber: number = 0; charNumber < size; ++charNumber) {
			randomString += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
		}
		return randomString;
	}
}
