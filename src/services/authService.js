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

  // Validate username format
  validateUsername(username) {
    if (!username) {
      throw new Error('Username is required');
    }
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
    return true;
  }

  // Validate password
  validatePassword(password) {
    if (!password) {
      throw new Error('Password is required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  }

  // Check if username exists
  async checkUsernameExists(username) {
    try {
      this.validateUsername(username);
      const email = this.formatEmail(username);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods && methods.length > 0;
    } catch (error) {
      console.error('Error checking username:', error);
      if (error.message) {
        throw error;
      }
      return false;
    }
  }

  // Sign up new user
  async signup(username, password) {
    try {
      // Validate input
      this.validateUsername(username);
      this.validatePassword(password);

      // Check if username exists
      const exists = await this.checkUsernameExists(username);
      if (exists) {
        throw new Error('This username is already taken');
      }

      const email = this.formatEmail(username);
      
      // Create auth user
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
      }
      // If it's our validation error, throw it directly
      if (error.message && !error.code) {
        throw error;
      }
      throw new Error('Failed to create account. Please try again.');
    }
  }

  // Login user
  async login(username, password) {
    try {
      // Validate input
      this.validateUsername(username);
      this.validatePassword(password);

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
      // If it's our validation error, throw it directly
      if (error.message && !error.code) {
        throw error;
      }
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        throw new Error('Invalid username or password');
      }
      if (error.code === 'auth/too-many-requests') {
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
      throw new Error('Failed to logout. Please try again.');
    }
  }

  // Send password reset email
  async sendPasswordReset(username) {
    try {
      this.validateUsername(username);
      const exists = await this.checkUsernameExists(username);
      if (!exists) {
        throw new Error('Username not found');
      }
      const email = this.formatEmail(username);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset:', error);
      // If it's our validation error, throw it directly
      if (error.message && !error.code) {
        throw error;
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error('Username not found');
      }
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService(); 