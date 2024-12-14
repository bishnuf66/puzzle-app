
const salt = import.meta.env.VITE_API_SECRET_KEY;

// Simple XOR encryption/decryption
export function xorEncryptDecrypt(data:string, ) {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      // XOR each character of the data with the salt (repeated if necessary)
      result += String.fromCharCode(data.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
    }
    return result;
  }

  // Function to  encrypt data 
  export function encryptData( data:string) {
    const encryptedData = xorEncryptDecrypt(data);
    return encryptedData;
  }
  
  // Function to decrypt the data 
  export function decryptData(data:string) {
      const decryptedData = xorEncryptDecrypt(data);
      return decryptedData;
    
  }
 