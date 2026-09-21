export interface UserProfile {
  id: string;
  handle: string;
  displayName: string;
  pronouns?: string;
  roleTitle: string;
  avatarUrl: string;
  bio: string;
  activeRoom?: {
    id: string;
    name: string;
  };
  stats: {
    challenges: number;
    sharedStories: number;
    processGuides: number;
  };
  gearList?: string[];
  quietModeEnabled?: boolean;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  category: 'Photography' | 'Culinary' | 'Visual Arts' | 'Writing' | string;
  description: string;
  coverImageUrl: string;
  isPrivate: boolean;
  isJoined?: boolean;
  membersCount: number;
  activeCount: number;
  isFeatured?: boolean;
}

export interface ProcessStage {
  stepNumber: number;
  title: string;
  tag: string;
  description: string;
  rawImageUrl?: string;
  processedImageUrl?: string;
  gearSetup?: string;
}

export interface Post {
  id: string;
  author: {
    id: string;
    handle: string;
    name: string;
    avatarUrl: string;
  };
  coAuthor?: {
    id: string;
    handle: string;
    name: string;
    avatarUrl: string;
  };
  roomName: string;
  roomId: string;
  aspectRatio: '4:5' | '16:9' | '1:1';
  imageUrl: string;
  rawImageUrl?: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  processStagesCount?: number;
  processStages?: ProcessStage[];
  cameraExif?: {
    camera: string;
    lens: string;
    settings: string;
    format: string;
  };
  createdAt: string;
}

export interface StoryContributor {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
}

export interface StorySlide {
  id: string;
  imageUrl: string;
  contributor: StoryContributor;
  timestamp: string;
  location?: string;
  caption?: string;
  notes?: string;
}

export interface SharedStory {
  id: string;
  title: string;
  coverImageUrl: string;
  contributorsCount: number;
  contributors: StoryContributor[];
  slides?: StorySlide[];
  hasUnread?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  roomName: string;
  roomId: string;
  coverImageUrl: string;
  closesIn: string;
  deadlineDate: string;
  entriesCount: number;
  guidelines: string[];
  isJoined?: boolean;
  submissions?: {
    id: string;
    imageUrl: string;
    author: StoryContributor;
  }[];
}

export interface ActivityItem {
  id: string;
  type: 'invite' | 'comment' | 'like' | 'mention';
  user: StoryContributor;
  message: string;
  targetTitle?: string;
  timeAgo: string;
  unread: boolean;
  actionRequired?: boolean;
  forkVersion?: string;
}

export interface MessageThread {
  id: string;
  user: StoryContributor;
  lastMessage: string;
  timeAgo: string;
  unreadCount: number;
  online?: boolean;
}
