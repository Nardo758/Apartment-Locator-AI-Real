import { api } from '@/lib/api';

export class UserService {
  async saveUserPreferences(userId: string, preferences: Record<string, unknown>) {
    return api.saveUserPreferences({
      userId,
      ...preferences,
    });
  }

  async getUserPreferences(userId: string) {
    return api.getUserPreferences(userId);
  }

  async saveUserProfile(userId: string, profile: Record<string, unknown>) {
    return api.saveUserPreferences({
      userId,
      ...profile,
    });
  }

  async getUserProfile(userId: string) {
    return api.getUserPreferences(userId);
  }
}

export const userService = new UserService();
