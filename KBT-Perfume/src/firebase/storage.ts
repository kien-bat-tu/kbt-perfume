import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { app } from './config'

export const storage = getStorage(app)

export async function uploadProductImage(file: File) {
	const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
	const imageReference = ref(storage, `products/${Date.now()}-${safeFileName}`)
	const snapshot = await uploadBytes(imageReference, file)
	return getDownloadURL(snapshot.ref)
}

export default storage