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
      return methods && methods.length > 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  // Sign up new user
  async signup(username, password) {
    try {
      const email = this.formatEmail(username);

      // Create auth user with email format
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
      throw new Error('Failed to create account. Please try again.');
    }
  }

  // Login user
  async login(username, password) {
    try {
      const email = this.formatEmail(username);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update display name if not set
      if (!userCredential.user.displayName) {
        await updateProfile(userCredential.user, {
          displayName: username
        });
      }

      return userCredential.user;
    } catch (error) {
      console.error('Error in login:', error);
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        throw new Error('Invalid username or password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      }
      throw new Error('Failed to login. Please try again.');
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