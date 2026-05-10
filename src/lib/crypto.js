import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export const generateKeyPair = () => {
  const keypair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keypair.publicKey),
    secretKey: naclUtil.encodeBase64(keypair.secretKey)
  };
};

export const encryptMessage = (msg, recipientPubKeyBase64, mySecretKeyBase64) => {
  try {
    const recipientPubKey = naclUtil.decodeBase64(recipientPubKeyBase64);
    const mySecretKey = naclUtil.decodeBase64(mySecretKeyBase64);
    
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = naclUtil.decodeUTF8(msg);
    
    const encrypted = nacl.box(messageUint8, nonce, recipientPubKey, mySecretKey);
    
    return {
      ciphertext: naclUtil.encodeBase64(encrypted),
      nonce: naclUtil.encodeBase64(nonce)
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

export const decryptMessage = (ciphertextBase64, nonceBase64, senderPubKeyBase64, mySecretKeyBase64) => {
  try {
    const ciphertext = naclUtil.decodeBase64(ciphertextBase64);
    const nonce = naclUtil.decodeBase64(nonceBase64);
    const senderPubKey = naclUtil.decodeBase64(senderPubKeyBase64);
    const mySecretKey = naclUtil.decodeBase64(mySecretKeyBase64);
    
    const decrypted = nacl.box.open(ciphertext, nonce, senderPubKey, mySecretKey);
    
    if (!decrypted) {
      return null;
    }
    
    return naclUtil.encodeUTF8(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};
