import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file to be upload-friendly.
 * Target: Max 1MB, Max 1920px width/height.
 */
export const compressImage = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg'
    };
    try {
        console.log(`Original size: ${file.size / 1024 / 1024} MB`);
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed size: ${compressedFile.size / 1024 / 1024} MB`);
        return compressedFile;
    } catch (error) {
        console.error("Compression failed:", error);
        return file; // Return original if compression fails
    }
};

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 */
export const uploadImageToStorage = async (file: File, path: string): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage not initialized");

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};
