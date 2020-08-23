import { toBase64Url } from './string'

/**
 * Generates a PKCE code verifier and challenge using SHA-256.
 * @see https://tools.ietf.org/html/rfc7636
 * @param  length - The verifier length.
 * @return The verifier and challenge.
 */
export async function getPkce(length = 128): Promise<PkceCode> {
  if (length < 43 || length > 128) {
    throw new Error(
      'A PKCE code verifier should have a minimum length of 43 characters and a maximum length of 128 characters'
    )
  }

  // Get cryptographically strong random values.
  const randomValues = window.crypto.getRandomValues(new Uint8Array(length))

  // Generate a random string.
  const randomString = Array.prototype.map.call(randomValues, (value) => String.fromCharCode(value)).join('')

  // Get the verifier by converting the random string to base64url.
  const verifier = toBase64Url(btoa(randomString)).substring(0, length)

  // Prepare an array of 8-bit unsigned integers that will contains the verifier values.
  const verifierValues = new Uint8Array(length)

  // Fill the array based on the verifier.
  for (let i = 0; i < verifier.length; i++) {
    verifierValues[i] = verifier.charCodeAt(i)
  }

  // Get a digest of the verifier using SHA-256.
  const digest = await window.crypto.subtle.digest('SHA-256', verifierValues)

  // Generate the challenge.
  const challenge = toBase64Url(
    btoa(Array.prototype.map.call(new Uint8Array(digest), (value) => String.fromCharCode(value)).join(''))
  )

  return { challenge, method: 'S256', verifier }
}

interface PkceCode {
  challenge: string
  method: 'S256' | 'plain'
  verifier: string
}
