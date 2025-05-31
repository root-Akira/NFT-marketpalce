import axios from 'axios';
import { IPFS_CONFIG } from '../config/contracts';

/**
 * Uploads a file to IPFS using Pinata
 * @param file File to upload
 * @returns IPFS URL
 * @throws Error if upload fails
 */
export const uploadToIPFS = async (file: File | Blob): Promise<string> => {
  if (!IPFS_CONFIG.projectId || !IPFS_CONFIG.apiKeySecret) {
    throw new Error('IPFS configuration is missing');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file instanceof File ? file.name : 'metadata.json',
      keyvalues: {
        app: 'NFT Marketplace',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: IPFS_CONFIG.projectId,
          pinata_secret_api_key: IPFS_CONFIG.apiKeySecret,
        },
        maxContentLength: -1,
      }
    );

    if (!response.data.IpfsHash) {
      throw new Error('No IPFS hash received');
    }
    
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    console.log('File uploaded to IPFS:', ipfsUrl);
    return ipfsUrl;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    if (error.response?.data?.message) {
      throw new Error(`IPFS Upload failed: ${error.response.data.message}`);
    }
    throw new Error('Failed to upload to IPFS');
  }
};

/**
 * Utility function to check if an IPFS URL is valid
 * @param url The IPFS URL to check
 * @returns boolean
 */
export const isValidIPFSUrl = (url: string): boolean => {
  try {
    const regex = /^https:\/\/(?:gateway\.pinata\.cloud|ipfs\.io)\/ipfs\/[a-zA-Z0-9]+$/;
    return regex.test(url);
  } catch {
    return false;
  }
};

/**
 * Helper function to get metadata from IPFS URL
 * @param url IPFS URL
 * @returns Metadata object
 */
export const getIPFSMetadata = async (url: string): Promise<any> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
};