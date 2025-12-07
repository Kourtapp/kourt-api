import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SocialPost {
  id: string;
  type: 'match_result' | 'achievement';
  user: {
    id?: string;
    name: string;
    avatar?: string | null;
    username?: string;
  };
  sport: string;
  result: 'victory' | 'defeat' | 'draw';
  score: string;
  venue: string;
  duration?: string;
  description?: string;
  photo?: string | null;
  xpEarned: number;
  likes: number;
  comments: number;
  createdAt: string;
  metrics?: Record<string, string>;
}

interface SocialPostsStore {
  posts: SocialPost[];
  addPost: (post: Omit<SocialPost, 'id' | 'likes' | 'comments' | 'createdAt'>) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  clearPosts: () => void;
}

export const useSocialPostsStore = create<SocialPostsStore>()(
  persist(
    (set, get) => ({
      posts: [],

      addPost: (post) => {
        const newPost: SocialPost = {
          ...post,
          id: `user-${Date.now()}`,
          likes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
        };

        console.log('[SocialPostsStore] Adding new post:', newPost.id);

        set((state) => ({
          posts: [newPost, ...state.posts],
        }));
      },

      likePost: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          ),
        }));
      },

      unlikePost: (postId) => {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post
          ),
        }));
      },

      clearPosts: () => {
        set({ posts: [] });
      },
    }),
    {
      name: 'kourt-social-posts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
