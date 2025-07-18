import { auth } from '../api/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  fetchSignInMethodsForEmail
} from 'firebase/auth';

class AuthService {
  // Helper method to format email
  formatEmail(username) {
    return `${username.toLowerCase()}@ipatroller.com`;
  }

  // Check if username exists
  async checkUsernameExists(username) {
    try {
      const email = this.formatEmail(username);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  // Sign up new user
  async signup(username, password) {
    try {
      // Check if username exists first
      const exists = await this.checkUsernameExists(username);
      if (exists) {
        throw new Error('This username is already taken');
      }

      // Create auth user with email format
      const email = this.formatEmail(username);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: username
      });

      return userCredential.user;
    } catch (error) {
      console.error('Error in signup:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This username is already taken');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid username format');
      }
      throw error;
    }
  }

  // Login user
  async login(username, password) {
    try {
      // Check if username exists first
      const exists = await this.checkUsernameExists(username);
      if (!exists) {
        throw new Error('Username not found');
      }

      const email = this.formatEmail(username);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error in login:', error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid username or password');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Username not found');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Invalid password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error in logout:', error);
      throw new Error('Failed to logout');
    }
  }

  // Send password reset email
  async sendPasswordReset(username) {
    try {
      // Check if username exists first
      const exists = await this.checkUsernameExists(username);
      if (!exists) {
        throw new Error('Username not found');
      }

      const email = this.formatEmail(username);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('Username not found');
      }
      throw new Error('Failed to send password reset email');
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService(); 