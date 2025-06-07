import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirestoreConnection = async () => {
  try {
    if (!auth.currentUser) {
      console.log('❌ No authenticated user for Firestore test');
      return false;
    }

    const testDoc = doc(db, 'users', auth.currentUser.uid);
    
    // Try to read the user document
    const docSnap = await getDoc(testDoc);
    
    if (docSnap.exists()) {
      console.log('✅ Firestore read successful:', docSnap.data());
      return true;
    } else {
      console.log('📄 No user document found, this is normal for new users');
      return true;
    }
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return false;
  }
}; 