import { auth, db } from '../api/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ERROR_MESSAGES, RATE_LIMITS } from '../constants';

class AuthService {
  constructor() {
    this.usersCollection = 'users';
    this.loginAttempts = new Map();
    this.setupLoginAttemptsCleaner();
  }

  // Helper method to format email from username
  formatEmail(username) {
    return `${username.toLowerCase()}@ipatroller.com`;
  }

  // Helper method to track login attempts
  trackLoginAttempt(username) {
    const now = Date.now();
    const attempts = this.loginAttempts.get(username) || [];
    
    // Remove attempts older than timeout period
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < RATE_LIMITS.LOGIN_TIMEOUT
    );
    
    recentAttempts.push(now);
    this.loginAttempts.set(username, recentAttempts);
    
    return recentAttempts.length;
  }

  // Clean up old login attempts periodically
  setupLoginAttemptsCleaner() {
    setInterval(() => {
      const now = Date.now();
      this.loginAttempts.forEach((attempts, username) => {
        const recentAttempts = attempts.filter(
          timestamp => now - timestamp < RATE_LIMITS.LOGIN_TIMEOUT
        );
        if (recentAttempts.length === 0) {
          this.loginAttempts.delete(username);
        } else {
          this.loginAttempts.set(username, recentAttempts);
        }
      });
    }, RATE_LIMITS.LOGIN_TIMEOUT);
  }

  // Check if username is available
  async checkUsernameAvailable(username) {
    try {
      const userDoc = await getDoc(doc(db, this.usersCollection, username.toLowerCase()));
      return !userDoc.exists();
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw new Error('Failed to check username availability');
    }
  }

  // Sign up new user
  async signup(username, password) {
    try {
      // First check if username is available
      const isAvailable = await this.checkUsernameAvailable(username);
      if (!isAvailable) {
        throw new Error(ERROR_MESSAGES.AUTH.USERNAME_TAKEN);
      }

      // Create auth user with email format
      const email = this.formatEmail(username);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
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
        isActive: true,
        emailVerified: false,
        lastLogin: null
      });

      return {
        message: ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED,
        user: userCredential.user
      };
    } catch (error) {
      console.error('Error in signup:', error);
      throw new Error(error.message || ERROR_MESSAGES.DEFAULT);
    }
  }

  // Login user
  async login(username, password) {
    try {
      // Check login attempts
      const attempts = this.trackLoginAttempt(username);
      if (attempts > RATE_LIMITS.LOGIN_ATTEMPTS) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      const email = this.formatEmail(username);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        throw new Error(ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED);
      }

      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, this.usersCollection, username.toLowerCase()));
      if (!userDoc.exists()) {
        throw new Error(ERROR_MESSAGES.DATA.NOT_FOUND);
      }

      const userData = userDoc.data();
      if (!userData.isActive) {
        throw new Error(ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED);
      }

      // Update last login time
      await updateDoc(doc(db, this.usersCollection, username.toLowerCase()), {
        lastLogin: new Date().toISOString()
      });

      // Clear login attempts on successful login
      this.loginAttempts.delete(username);

      return {
        ...userCredential.user,
        ...userData
      };
    } catch (error) {
      console.error('Error in login:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }
      throw new Error(error.message || ERROR_MESSAGES.DEFAULT);
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error in logout:', error);
      throw new Error('Failed to log out');
    }
  }

  // Send password reset email
  async sendPasswordReset(username) {
    try {
      const email = this.formatEmail(username);
      await sendPasswordResetEmail(auth, email);
      return { message: 'Password reset email sent' };
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      throw new Error('Failed to change password');
    }
  }

  // Update user profile
  async updateProfile(userId, data) {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== userId) {
        throw new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
      }

      // Update auth profile if display name is provided
      if (data.displayName) {
        await updateProfile(user, {
          displayName: data.displayName
        });
      }

      // Update Firestore profile
      await updateDoc(doc(db, this.usersCollection, user.email.split('@')[0]), {
        ...data,
        updatedAt: new Date().toISOString()
      });

      return { message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Get current user with Firestore data
  async getCurrentUser() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, this.usersCollection, user.email.split('@')[0]));
      if (!userDoc.exists()) return null;

      return {
        ...user,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export default new AuthService(); 