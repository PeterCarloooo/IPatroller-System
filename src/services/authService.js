import { auth } from '../api/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

class AuthService {
  // Helper method to format email
  formatEmail(username) {
    return `${username.toLowerCase()}@ipatroller.com`;
  }

  // Sign up new user
  async signup(username, password) {
    try {
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
        throw new Error('Username is already taken');
      }
      throw new Error(error.message || 'Failed to create account');
    }
  }

  // Login user
  async login(username, password) {
    try {
      const email = this.formatEmail(username);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error in login:', error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid username or password');
      }
      throw new Error(error.message || 'Failed to login');
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
      const email = this.formatEmail(username);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService(); 