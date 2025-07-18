import { auth, db } from '../api/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

class AuthService {
  constructor() {
    this.usersCollection = 'users';
    // Set persistence to LOCAL
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
      });
  }

  // Convert username to a valid email format
  formatEmail(username) {
    // Remove special characters and spaces, convert to lowercase
    const sanitizedUsername = username.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    return `${sanitizedUsername}@ipatroller.com`;
  }

  async checkUsernameAvailable(username) {
    try {
      const userDoc = await getDoc(doc(db, this.usersCollection, username.toLowerCase()));
      return !userDoc.exists();
    } catch (error) {
      console.error('Error checking username:', error);
      throw new Error('Unable to check username availability');
    }
  }

  async signup(username, password) {
    try {
      // First check if username is available
      const isAvailable = await this.checkUsernameAvailable(username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      // Create auth user with email format
      const email = this.formatEmail(username);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, this.usersCollection, username.toLowerCase()), {
        uid: userCredential.user.uid,
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        role: 'user',
        isActive: true
      });

      return userCredential.user;
    } catch (error) {
      console.error('Error in signup:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Username is already taken');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid username format');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to create account');
      }
    }
  }

  async login(username, password) {
    try {
      const email = this.formatEmail(username);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, this.usersCollection, username.toLowerCase()));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data();
      if (!userData.isActive) {
        throw new Error('Account is disabled');
      }

      return {
        ...userCredential.user,
        ...userData
      };
    } catch (error) {
      console.error('Error in login:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid username or password');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to sign in');
      }
    }
  }

  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error in logout:', error);
      throw new Error('Failed to sign out');
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  isAuthenticated() {
    return !!auth.currentUser;
  }
}

export default new AuthService(); 